//+------------------------------------------------------------------+
//| ExportSpread.mq5                                                 |
//| Read-only: measures the bid/ask spread from historical ticks.    |
//| No trading functions are used.                                   |
//+------------------------------------------------------------------+
#property copyright "Research export"
#property version   "1.00"
#property strict

#define EXPORT_FOLDER     "research"
#define LOOKBACK_DAYS     120
#define MAX_POINTS        3000      // spreads above this land in the last bucket; the true maximum is kept separately
#define HOURS             24
#define ALL_HOURS         24        // row index for the whole-day total
#define MAX_HOLD_MS       60000     // a quote older than this is not counted (market shut or feed idle)
#define DAY_SECONDS       86400

string Symbols[] = {"XAUUSD", "EURUSD", "GBPUSD", "USDJPY"};

double Weights[];                    // (HOURS + 1) x (MAX_POINTS + 1), milliseconds each spread was quoted
long   TickCount[HOURS + 1];
long   MinPoints[HOURS + 1];
long   MaxPoints[HOURS + 1];

void ResetStats()
{
   ArrayResize(Weights, (HOURS + 1) * (MAX_POINTS + 1));
   ArrayInitialize(Weights, 0.0);
   for(int h = 0; h <= HOURS; h++)
   {
      TickCount[h] = 0;
      MinPoints[h] = LONG_MAX;
      MaxPoints[h] = 0;
   }
}

void AddQuote(const int hour, const long points, const double held_ms)
{
   int bucket = (int)MathMin(points, MAX_POINTS);
   int rows[2];
   rows[0] = hour;
   rows[1] = ALL_HOURS;
   for(int r = 0; r < 2; r++)
   {
      int h = rows[r];
      Weights[h * (MAX_POINTS + 1) + bucket] += held_ms;
      TickCount[h]++;
      if(points < MinPoints[h]) MinPoints[h] = points;
      if(points > MaxPoints[h]) MaxPoints[h] = points;
   }
}

// Time-weighted percentile: the spread at or below which the quote sat for `share` of the observed time.
int Percentile(const int hour, const double share, const double total)
{
   double running = 0.0;
   for(int b = 0; b <= MAX_POINTS; b++)
   {
      running += Weights[hour * (MAX_POINTS + 1) + b];
      if(running >= share * total)
         return b;
   }
   return MAX_POINTS;
}

bool MeasureSymbol(const string symbol, const int info)
{
   if(!SymbolSelect(symbol, true))
   {
      FileWrite(info, symbol, "ERROR", "symbol not available");
      return false;
   }
   double point = SymbolInfoDouble(symbol, SYMBOL_POINT);
   ResetStats();
   datetime today = (datetime)((long)TimeCurrent() / DAY_SECONDS * DAY_SECONDS);
   long first_msc = 0, last_msc = 0, total_ticks = 0;
   int days_with_ticks = 0;

   for(int back = LOOKBACK_DAYS; back >= 1 && !IsStopped(); back--)
   {
      datetime day = today - back * DAY_SECONDS;
      MqlTick ticks[];
      int copied = -1;
      for(int attempt = 0; attempt < 5 && copied < 0; attempt++)
      {
         ResetLastError();
         copied = CopyTicksRange(symbol, ticks, COPY_TICKS_INFO, (ulong)day * 1000, (ulong)(day + DAY_SECONDS) * 1000 - 1);
         if(copied < 0)
            Sleep(1500);
      }
      if(copied <= 0)
         continue;
      days_with_ticks++;
      total_ticks += copied;
      if(first_msc == 0) first_msc = ticks[0].time_msc;
      last_msc = ticks[copied - 1].time_msc;
      for(int i = 0; i < copied; i++)
      {
         if(ticks[i].bid <= 0 || ticks[i].ask <= 0)
            continue;
         long points = (long)MathRound((ticks[i].ask - ticks[i].bid) / point);
         double held = (i + 1 < copied) ? (double)(ticks[i + 1].time_msc - ticks[i].time_msc) : 1000.0;
         if(held > MAX_HOLD_MS) held = MAX_HOLD_MS;
         if(held <= 0) held = 1.0;
         int hour = (int)((ticks[i].time_msc / 1000 % DAY_SECONDS) / 3600);
         AddQuote(hour, points, held);
      }
   }

   int handle = FileOpen(EXPORT_FOLDER + "\\spread_" + symbol + ".csv", FILE_WRITE | FILE_ANSI | FILE_CSV, ',');
   if(handle == INVALID_HANDLE)
   {
      FileWrite(info, symbol, "ERROR", "cannot open csv: " + IntegerToString(GetLastError()));
      return false;
   }
   FileWrite(handle, "hour_utc", "ticks", "seconds_observed", "mean_points", "min_points", "p50_points", "p90_points", "p99_points", "max_points");
   for(int h = 0; h <= HOURS; h++)
   {
      double total = 0.0, weighted = 0.0;
      for(int b = 0; b <= MAX_POINTS; b++)
      {
         double w = Weights[h * (MAX_POINTS + 1) + b];
         total += w;
         weighted += w * b;
      }
      if(total <= 0)
         continue;
      FileWrite(handle, (h == ALL_HOURS ? "all" : IntegerToString(h)), IntegerToString(TickCount[h]),
                DoubleToString(total / 1000.0, 0), DoubleToString(weighted / total, 2), IntegerToString(MinPoints[h]),
                IntegerToString(Percentile(h, 0.50, total)), IntegerToString(Percentile(h, 0.90, total)),
                IntegerToString(Percentile(h, 0.99, total)), IntegerToString(MaxPoints[h]));
   }
   FileClose(handle);

   FileWrite(info, symbol, "point", DoubleToString(point, (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS)));
   FileWrite(info, symbol, "ticks", IntegerToString(total_ticks));
   FileWrite(info, symbol, "days_with_ticks", IntegerToString(days_with_ticks));
   FileWrite(info, symbol, "first_tick", TimeToString((datetime)(first_msc / 1000), TIME_DATE | TIME_SECONDS));
   FileWrite(info, symbol, "last_tick", TimeToString((datetime)(last_msc / 1000), TIME_DATE | TIME_SECONDS));
   return true;
}

void OnStart()
{
   FolderCreate(EXPORT_FOLDER);
   int info = FileOpen(EXPORT_FOLDER + "\\spread_info.txt", FILE_WRITE | FILE_ANSI | FILE_CSV, '\t');
   if(info == INVALID_HANDLE)
   {
      Print("ExportSpread: cannot open spread_info.txt, error ", GetLastError());
      return;
   }
   FileWrite(info, "terminal", "server", AccountInfoString(ACCOUNT_SERVER));
   FileWrite(info, "terminal", "lookback_days", IntegerToString(LOOKBACK_DAYS));
   FileWrite(info, "terminal", "weighting", "time each quote was live, capped at 60 s per quote");
   int done = 0;
   for(int i = 0; i < ArraySize(Symbols); i++)
      if(MeasureSymbol(Symbols[i], info))
         done++;
   FileWrite(info, "terminal", "symbols_measured", IntegerToString(done));
   FileClose(info);
   Print("ExportSpread: finished, symbols measured = ", done);
}
