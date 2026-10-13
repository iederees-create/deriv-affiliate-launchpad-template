//+------------------------------------------------------------------+
//| ExportH1.mq5                                                     |
//| Read-only: writes H1 history and symbol settings to CSV.         |
//| No trading functions are used.                                   |
//+------------------------------------------------------------------+
#property copyright "Research export"
#property version   "1.00"
#property strict

#define EXPORT_FOLDER   "research"
#define HISTORY_START   D'2005.01.01 00:00'
#define SYNC_ATTEMPTS   90
#define SYNC_PAUSE_MS   2000

string Symbols[] = {"XAUUSD", "EURUSD", "GBPUSD", "USDJPY"};

int LoadRates(const string symbol, MqlRates &rates[])
{
   int copied = -1;
   int previous = -2;
   // Ask repeatedly: the terminal downloads older history in the background and returns more each time.
   for(int attempt = 0; attempt < SYNC_ATTEMPTS && !IsStopped(); attempt++)
   {
      ResetLastError();
      copied = CopyRates(symbol, PERIOD_H1, HISTORY_START, TimeCurrent() + 86400, rates);
      bool synced = (bool)SeriesInfoInteger(symbol, PERIOD_H1, SERIES_SYNCHRONIZED);
      if(copied > 0 && synced && copied == previous)
         break;
      previous = copied;
      Sleep(SYNC_PAUSE_MS);
   }
   return copied;
}

bool ExportSymbol(const string symbol, const int info)
{
   if(!SymbolSelect(symbol, true))
   {
      FileWrite(info, symbol, "ERROR", "symbol not available: " + IntegerToString(GetLastError()));
      return false;
   }
   MqlRates rates[];
   int copied = LoadRates(symbol, rates);
   if(copied <= 0)
   {
      FileWrite(info, symbol, "ERROR", "CopyRates returned " + IntegerToString(copied) + " err " + IntegerToString(GetLastError()));
      return false;
   }
   int digits = (int)SymbolInfoInteger(symbol, SYMBOL_DIGITS);
   int handle = FileOpen(EXPORT_FOLDER + "\\" + symbol + "_H1.csv", FILE_WRITE | FILE_ANSI | FILE_CSV, ',');
   if(handle == INVALID_HANDLE)
   {
      FileWrite(info, symbol, "ERROR", "cannot open csv: " + IntegerToString(GetLastError()));
      return false;
   }
   FileWrite(handle, "time", "open", "high", "low", "close", "tick_volume", "spread_points");
   for(int i = 0; i < copied; i++)
      FileWrite(handle, TimeToString(rates[i].time, TIME_DATE | TIME_MINUTES),
                DoubleToString(rates[i].open, digits), DoubleToString(rates[i].high, digits),
                DoubleToString(rates[i].low, digits), DoubleToString(rates[i].close, digits),
                IntegerToString(rates[i].tick_volume), IntegerToString(rates[i].spread));
   FileClose(handle);

   FileWrite(info, symbol, "bars", IntegerToString(copied));
   FileWrite(info, symbol, "first", TimeToString(rates[0].time, TIME_DATE | TIME_MINUTES));
   FileWrite(info, symbol, "last", TimeToString(rates[copied - 1].time, TIME_DATE | TIME_MINUTES));
   FileWrite(info, symbol, "server_first_date", TimeToString((datetime)SeriesInfoInteger(symbol, PERIOD_H1, SERIES_SERVER_FIRSTDATE), TIME_DATE | TIME_MINUTES));
   FileWrite(info, symbol, "digits", IntegerToString(digits));
   FileWrite(info, symbol, "point", DoubleToString(SymbolInfoDouble(symbol, SYMBOL_POINT), digits));
   FileWrite(info, symbol, "spread_points_now", IntegerToString(SymbolInfoInteger(symbol, SYMBOL_SPREAD)));
   FileWrite(info, symbol, "spread_floating", IntegerToString(SymbolInfoInteger(symbol, SYMBOL_SPREAD_FLOAT)));
   FileWrite(info, symbol, "contract_size", DoubleToString(SymbolInfoDouble(symbol, SYMBOL_TRADE_CONTRACT_SIZE), 2));
   FileWrite(info, symbol, "swap_mode", EnumToString((ENUM_SYMBOL_SWAP_MODE)SymbolInfoInteger(symbol, SYMBOL_SWAP_MODE)));
   FileWrite(info, symbol, "swap_long", DoubleToString(SymbolInfoDouble(symbol, SYMBOL_SWAP_LONG), 4));
   FileWrite(info, symbol, "swap_short", DoubleToString(SymbolInfoDouble(symbol, SYMBOL_SWAP_SHORT), 4));
   FileWrite(info, symbol, "swap_triple_day", EnumToString((ENUM_DAY_OF_WEEK)SymbolInfoInteger(symbol, SYMBOL_SWAP_ROLLOVER3DAYS)));
   FileWrite(info, symbol, "volume_min", DoubleToString(SymbolInfoDouble(symbol, SYMBOL_VOLUME_MIN), 2));
   FileWrite(info, symbol, "stops_level_points", IntegerToString(SymbolInfoInteger(symbol, SYMBOL_TRADE_STOPS_LEVEL)));
   FileWrite(info, symbol, "path", SymbolInfoString(symbol, SYMBOL_PATH));
   return true;
}

void OnStart()
{
   FolderCreate(EXPORT_FOLDER);
   int info = FileOpen(EXPORT_FOLDER + "\\info.txt", FILE_WRITE | FILE_ANSI | FILE_CSV, '\t');
   if(info == INVALID_HANDLE)
   {
      Print("ExportH1: cannot open info.txt, error ", GetLastError());
      return;
   }
   FileWrite(info, "terminal", "server", AccountInfoString(ACCOUNT_SERVER));
   FileWrite(info, "terminal", "account_type", EnumToString((ENUM_ACCOUNT_TRADE_MODE)AccountInfoInteger(ACCOUNT_TRADE_MODE)));
   FileWrite(info, "terminal", "connected", IntegerToString(TerminalInfoInteger(TERMINAL_CONNECTED)));
   FileWrite(info, "terminal", "server_minus_gmt_seconds", IntegerToString((long)(TimeTradeServer() - TimeGMT())));
   FileWrite(info, "terminal", "server_time", TimeToString(TimeTradeServer(), TIME_DATE | TIME_SECONDS));
   FileWrite(info, "terminal", "max_bars_in_chart", IntegerToString(TerminalInfoInteger(TERMINAL_MAXBARS)));

   int done = 0;
   for(int i = 0; i < ArraySize(Symbols); i++)
      if(ExportSymbol(Symbols[i], info))
         done++;
   FileWrite(info, "terminal", "symbols_exported", IntegerToString(done));
   FileClose(info);
   Print("ExportH1: finished, symbols exported = ", done);
}
