//+------------------------------------------------------------------+
//| GoldH1Trend.mq5                                                  |
//| Simple, auditable trend-following Expert Advisor for gold (H1).  |
//|                                                                  |
//| Rules (all evaluated once, on the close of each new H1 candle):  |
//|   LONG : EMA(fast) crosses above EMA(slow) AND close > EMA(trend)|
//|   SHORT: EMA(fast) crosses below EMA(slow) AND close < EMA(trend)|
//|   Stop-loss  = ATR(period) * InpATRStopMult                      |
//|   Take-profit= stop distance * InpRewardRisk                     |
//|                                                                  |
//| Safety: one position at a time, fixed % risk per trade, a hard   |
//| stop on every order, a daily closed-loss limit, a spread filter  |
//| and a margin check. No martingale, no grid, no averaging down.   |
//|                                                                  |
//| v1.10: ATR is Wilder's smoothed ATR, the same formula as the      |
//| paper engine (v1.00 used MT5's simple-average iATR). An entry the |
//| broker refuses because the market is closed is retried when       |
//| trading reopens instead of being dropped.                         |
//|                                                                  |
//| Compiles with 0 errors. Strategy Tester runs are recorded in      |
//| engine/research/LIVE-AND-MT5.md. Tests found no evidence of an    |
//| edge for this strategy. Demo first.                               |
//+------------------------------------------------------------------+
#property copyright "Iederees Francis"
#property version   "1.10"
#property description "Gold H1 trend-following EA. Fixed % risk, hard stops, no martingale."

#include <Trade/Trade.mqh>

input group "Strategy"
input int    InpFastEMA      = 20;     // Fast EMA period
input int    InpSlowEMA      = 50;     // Slow EMA period
input int    InpTrendEMA     = 200;    // Trend filter EMA period
input int    InpATRPeriod    = 14;     // ATR period
input double InpATRStopMult  = 2.0;    // Stop distance = ATR x this
input double InpRewardRisk   = 2.0;    // Take-profit = stop distance x this

input group "Risk"
input double InpRiskPercent  = 1.0;    // % of balance risked per trade
input double InpDailyLossPct = 3.0;    // No new trades once today's closed loss reaches this % of balance
input int    InpMaxSpreadPts = 60;     // Skip entries when spread (points) is wider than this
input double InpMaxMarginUse = 50.0;   // Skip entry if required margin exceeds this % of free margin

input group "Execution"
input long   InpMagic        = 260110; // Magic number (identifies this EA's trades)
input int    InpSlippagePts  = 30;     // Max slippage (points)
input string InpComment      = "GoldH1Trend";

CTrade   g_trade;
int      g_hFast  = INVALID_HANDLE;
int      g_hSlow  = INVALID_HANDLE;
int      g_hTrend = INVALID_HANDLE;
datetime g_lastBar = 0;

// An entry waiting to be sent. Set when a signal fires; cleared when the order is placed, fails for a reason
// other than a closed market, or grows too old.
int      g_pendingSignal   = 0;
double   g_pendingStopDist = 0.0;
datetime g_pendingBar      = 0;
datetime g_lastAttempt     = 0;

#define ATR_HISTORY_BARS      300   // closed candles fed to the Wilder ATR so its starting value has faded
#define PENDING_MAX_BARS      3     // give up on a waiting entry after this many H1 candles
#define RETRY_PAUSE_SECONDS   60    // minimum gap between attempts to send a waiting entry
#define H1_SECONDS            3600

//+------------------------------------------------------------------+
int OnInit()
  {
   if(InpFastEMA <= 0 || InpFastEMA >= InpSlowEMA || InpSlowEMA >= InpTrendEMA)
     {
      Print("Invalid inputs: need 0 < fast EMA < slow EMA < trend EMA.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   if(InpATRPeriod <= 0 || InpATRStopMult <= 0.0 || InpRewardRisk <= 0.0)
     {
      Print("Invalid inputs: ATR period, stop multiple and reward:risk must be positive.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   if(InpRiskPercent <= 0.0 || InpRiskPercent > 2.0)
     {
      Print("Invalid input: risk per trade must be between 0 and 2 percent.");
      return(INIT_PARAMETERS_INCORRECT);
     }
   if(InpDailyLossPct <= 0.0 || InpMaxMarginUse <= 0.0 || InpMaxMarginUse > 100.0)
     {
      Print("Invalid inputs: daily loss limit and margin use must be positive (margin use <= 100).");
      return(INIT_PARAMETERS_INCORRECT);
     }

   string sym = _Symbol;
   StringToUpper(sym);
   if(StringFind(sym, "XAU") < 0 && StringFind(sym, "GOLD") < 0)
      PrintFormat("Warning: %s does not look like gold. This EA is designed for XAUUSD on H1.", _Symbol);

   g_hFast  = iMA(_Symbol, PERIOD_H1, InpFastEMA,  0, MODE_EMA, PRICE_CLOSE);
   g_hSlow  = iMA(_Symbol, PERIOD_H1, InpSlowEMA,  0, MODE_EMA, PRICE_CLOSE);
   g_hTrend = iMA(_Symbol, PERIOD_H1, InpTrendEMA, 0, MODE_EMA, PRICE_CLOSE);
   if(g_hFast == INVALID_HANDLE || g_hSlow == INVALID_HANDLE || g_hTrend == INVALID_HANDLE)
     {
      Print("Failed to create indicator handles. Error: ", GetLastError());
      return(INIT_FAILED);
     }

   g_trade.SetExpertMagicNumber(InpMagic);
   g_trade.SetDeviationInPoints(InpSlippagePts);
   return(INIT_SUCCEEDED);
  }

//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
   if(g_hFast  != INVALID_HANDLE) IndicatorRelease(g_hFast);
   if(g_hSlow  != INVALID_HANDLE) IndicatorRelease(g_hSlow);
   if(g_hTrend != INVALID_HANDLE) IndicatorRelease(g_hTrend);
  }

//+------------------------------------------------------------------+
void OnTick()
  {
   datetime barTime = iTime(_Symbol, PERIOD_H1, 0);
   if(barTime == 0)
      return;

   // Evaluate once per new H1 candle, on closed-candle data only.
   if(barTime != g_lastBar)
     {
      g_lastBar = barTime;
      CheckForSignal(barTime);
     }

   if(g_pendingSignal != 0)
      TryPendingEntry(barTime);
  }

//+------------------------------------------------------------------+
//| Queue an entry if the candle that just closed gave a signal.      |
//+------------------------------------------------------------------+
void CheckForSignal(const datetime barTime)
  {
   if(HasOpenPosition())
     {
      g_pendingSignal = 0;
      return;
     }
   if(DailyLossLimitHit())
     {
      Print("Daily closed-loss limit reached. No new trades today.");
      g_pendingSignal = 0;
      return;
     }

   int signal = GetSignal();
   if(signal == 0)
      return;

   double atr = WilderATR();
   if(atr <= 0.0)
      return;

   g_pendingSignal   = signal;
   g_pendingStopDist = atr * InpATRStopMult;
   g_pendingBar      = barTime;
   g_lastAttempt     = 0;
  }

//+------------------------------------------------------------------+
//| Send the waiting entry once trading is open and the spread is     |
//| acceptable. Keeps waiting through a closed market.                |
//+------------------------------------------------------------------+
void TryPendingEntry(const datetime barTime)
  {
   if(HasOpenPosition())
     {
      g_pendingSignal = 0;
      return;
     }
   if(barTime - g_pendingBar >= PENDING_MAX_BARS * H1_SECONDS)
     {
      Print("Waiting entry is too old. Dropped.");
      g_pendingSignal = 0;
      return;
     }
   datetime now = TimeCurrent();
   if(g_lastAttempt != 0 && now - g_lastAttempt < RETRY_PAUSE_SECONDS)
      return;
   if(!TradeSessionOpen(now))
      return;
   g_lastAttempt = now;
   if(SpreadTooWide())
      return;

   uint retcode = OpenTrade(g_pendingSignal, g_pendingStopDist);
   if(retcode == TRADE_RETCODE_MARKET_CLOSED)
      return; // keep waiting; the session table and the server disagreed
   g_pendingSignal = 0;
  }

//+------------------------------------------------------------------+
//| True if the broker's trade sessions for this symbol include now.  |
//+------------------------------------------------------------------+
bool TradeSessionOpen(const datetime now)
  {
   MqlDateTime dt;
   TimeToStruct(now, dt);
   uint secondsToday = (uint)(dt.hour * 3600 + dt.min * 60 + dt.sec);
   datetime from, to;
   for(uint i = 0; SymbolInfoSessionTrade(_Symbol, (ENUM_DAY_OF_WEEK)dt.day_of_week, i, from, to); i++)
     {
      if(secondsToday >= (uint)from && secondsToday < (uint)to)
         return(true);
     }
   return(false);
  }

//+------------------------------------------------------------------+
//| Wilder's ATR on closed H1 candles: the first value is the plain   |
//| average of the first InpATRPeriod true ranges, then each new true |
//| range is blended in with weight 1/period. Returns 0 if history is |
//| too short.                                                        |
//+------------------------------------------------------------------+
double WilderATR()
  {
   MqlRates rates[];
   int wanted = ATR_HISTORY_BARS + InpATRPeriod + 1;
   int count  = CopyRates(_Symbol, PERIOD_H1, 1, wanted, rates); // index 0 is the oldest candle
   if(count < 2 * InpATRPeriod + 1)
      return(0.0);

   double sum = 0.0;
   for(int i = 1; i <= InpATRPeriod; i++)
      sum += TrueRange(rates, i);
   double atr = sum / InpATRPeriod;
   for(int i = InpATRPeriod + 1; i < count; i++)
      atr = (atr * (InpATRPeriod - 1) + TrueRange(rates, i)) / InpATRPeriod;
   return(atr);
  }

//+------------------------------------------------------------------+
double TrueRange(const MqlRates &rates[], const int i)
  {
   double prevClose = rates[i - 1].close;
   return(MathMax(rates[i].high - rates[i].low,
                  MathMax(MathAbs(rates[i].high - prevClose), MathAbs(rates[i].low - prevClose))));
  }

//+------------------------------------------------------------------+
//| +1 = buy signal, -1 = sell signal, 0 = none                       |
//+------------------------------------------------------------------+
int GetSignal()
  {
   double fast[], slow[], trend[];
   ArraySetAsSeries(fast, true);
   ArraySetAsSeries(slow, true);
   ArraySetAsSeries(trend, true);

   // Index 0 = last closed candle (shift 1), index 1 = the candle before it (shift 2).
   if(CopyBuffer(g_hFast,  0, 1, 2, fast)  != 2) return(0);
   if(CopyBuffer(g_hSlow,  0, 1, 2, slow)  != 2) return(0);
   if(CopyBuffer(g_hTrend, 0, 1, 1, trend) != 1) return(0);

   double close1 = iClose(_Symbol, PERIOD_H1, 1);
   if(close1 <= 0.0)
      return(0);

   if(fast[1] <= slow[1] && fast[0] > slow[0] && close1 > trend[0])
      return(1);
   if(fast[1] >= slow[1] && fast[0] < slow[0] && close1 < trend[0])
      return(-1);
   return(0);
  }

//+------------------------------------------------------------------+
//| Returns the trade server's return code, or 0 if no order was sent.|
//+------------------------------------------------------------------+
uint OpenTrade(const int signal, const double stopDist)
  {
   double tpDist = stopDist * InpRewardRisk;

   long stopsLevel = SymbolInfoInteger(_Symbol, SYMBOL_TRADE_STOPS_LEVEL);
   if(stopDist / _Point < (double)stopsLevel)
     {
      Print("Stop distance is inside the broker's minimum stop level. Skipping.");
      return(0);
     }

   MqlTick tick;
   if(!SymbolInfoTick(_Symbol, tick))
      return(0);

   int    digits = (int)SymbolInfoInteger(_Symbol, SYMBOL_DIGITS);
   bool   isBuy  = (signal > 0);
   double price  = isBuy ? tick.ask : tick.bid;
   double sl     = NormalizeDouble(isBuy ? price - stopDist : price + stopDist, digits);
   double tp     = NormalizeDouble(isBuy ? price + tpDist   : price - tpDist,   digits);

   double lots = LotsForRisk(stopDist);
   if(lots <= 0.0)
      return(0);
   if(!MarginOK(isBuy ? ORDER_TYPE_BUY : ORDER_TYPE_SELL, lots, price))
      return(0);

   bool ok = isBuy ? g_trade.Buy(lots,  _Symbol, 0.0, sl, tp, InpComment)
                   : g_trade.Sell(lots, _Symbol, 0.0, sl, tp, InpComment);
   if(!ok)
      PrintFormat("Order failed. Retcode %u (%s)", g_trade.ResultRetcode(), g_trade.ResultRetcodeDescription());
   return(g_trade.ResultRetcode());
  }

//+------------------------------------------------------------------+
//| Lot size so that hitting the stop loses InpRiskPercent of balance.|
//| Returns 0 (skip the trade) if even the minimum lot is too big.    |
//+------------------------------------------------------------------+
double LotsForRisk(const double stopDist)
  {
   double balance   = AccountInfoDouble(ACCOUNT_BALANCE);
   double riskMoney = balance * InpRiskPercent / 100.0;
   double tickSize  = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_SIZE);
   double tickValue = SymbolInfoDouble(_Symbol, SYMBOL_TRADE_TICK_VALUE_LOSS);
   if(tickSize <= 0.0 || tickValue <= 0.0 || riskMoney <= 0.0)
      return(0.0);

   double lossPerLot = (stopDist / tickSize) * tickValue;
   if(lossPerLot <= 0.0)
      return(0.0);

   double step   = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_STEP);
   double minLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MIN);
   double maxLot = SymbolInfoDouble(_Symbol, SYMBOL_VOLUME_MAX);
   if(step <= 0.0)
      return(0.0);

   double lots = MathFloor((riskMoney / lossPerLot) / step) * step;
   if(lots < minLot)
     {
      PrintFormat("Risk budget %.2f is too small for the minimum lot %.2f at this stop. Skipping.", riskMoney, minLot);
      return(0.0);
     }
   if(lots > maxLot)
      lots = maxLot;

   int volDigits = (int)MathMax(0.0, MathRound(-MathLog10(step)));
   return(NormalizeDouble(lots, volDigits));
  }

//+------------------------------------------------------------------+
bool MarginOK(const ENUM_ORDER_TYPE type, const double lots, const double price)
  {
   double margin = 0.0;
   if(!OrderCalcMargin(type, _Symbol, lots, price, margin))
      return(false);
   double freeMargin = AccountInfoDouble(ACCOUNT_MARGIN_FREE);
   if(margin > freeMargin * InpMaxMarginUse / 100.0)
     {
      Print("Required margin is above the allowed share of free margin. Skipping.");
      return(false);
     }
   return(true);
  }

//+------------------------------------------------------------------+
bool HasOpenPosition()
  {
   for(int i = PositionsTotal() - 1; i >= 0; i--)
     {
      ulong ticket = PositionGetTicket(i);
      if(ticket == 0)
         continue;
      if(PositionGetString(POSITION_SYMBOL) == _Symbol &&
         PositionGetInteger(POSITION_MAGIC) == InpMagic)
         return(true);
     }
   return(false);
  }

//+------------------------------------------------------------------+
bool SpreadTooWide()
  {
   long spread = SymbolInfoInteger(_Symbol, SYMBOL_SPREAD);
   if(spread > InpMaxSpreadPts)
     {
      PrintFormat("Spread %d points is wider than the %d limit. Skipping.", (int)spread, InpMaxSpreadPts);
      return(true);
     }
   return(false);
  }

//+------------------------------------------------------------------+
//| True once this EA's closed trades today have lost the limit.      |
//+------------------------------------------------------------------+
bool DailyLossLimitHit()
  {
   MqlDateTime dt;
   TimeCurrent(dt);
   dt.hour = 0;
   dt.min  = 0;
   dt.sec  = 0;
   datetime dayStart = StructToTime(dt);

   if(!HistorySelect(dayStart, TimeCurrent()))
      return(false);

   double pnl = 0.0;
   int total  = HistoryDealsTotal();
   for(int i = 0; i < total; i++)
     {
      ulong ticket = HistoryDealGetTicket(i);
      if(ticket == 0)
         continue;
      if(HistoryDealGetInteger(ticket, DEAL_MAGIC) != InpMagic)
         continue;
      if(HistoryDealGetString(ticket, DEAL_SYMBOL) != _Symbol)
         continue;
      if(HistoryDealGetInteger(ticket, DEAL_ENTRY) != DEAL_ENTRY_OUT)
         continue;
      pnl += HistoryDealGetDouble(ticket, DEAL_PROFIT)
           + HistoryDealGetDouble(ticket, DEAL_SWAP)
           + HistoryDealGetDouble(ticket, DEAL_COMMISSION);
     }

   double limit = AccountInfoDouble(ACCOUNT_BALANCE) * InpDailyLossPct / 100.0;
   return(pnl <= -limit);
  }
//+------------------------------------------------------------------+
