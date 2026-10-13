// Fetch candle history from Deriv's public WebSocket API (no login or token needed for market data).
// Uses the WebSocket built into Node 22+. Pass `WebSocketImpl` to inject a fake in tests.

export const DERIV_ENDPOINT = "wss://ws.derivws.com/websockets/v3";

export function parseCandles(body) {
  if (body?.error) throw new Error(`Deriv error: ${body.error.message || body.error.code}`);
  if (!Array.isArray(body?.candles)) throw new Error("Deriv response had no candles");
  const candles = body.candles.map((c) => ({
    epoch: Number(c.epoch),
    open: Number(c.open),
    high: Number(c.high),
    low: Number(c.low),
    close: Number(c.close)
  }));
  for (const c of candles) {
    if (![c.epoch, c.open, c.high, c.low, c.close].every(Number.isFinite)) throw new Error("Deriv returned a bad candle");
  }
  return candles.sort((a, b) => a.epoch - b.epoch);
}

/**
 * requests: [{ symbol, granularity, count }]. Resolves to a Map keyed `${symbol}:${granularity}`.
 * Rejects if the socket cannot connect or times out. A request that Deriv answers with an error is listed in
 * `results.failures` and its key is simply missing from the Map.
 */
export function fetchCandlesMany(requests, { appId = 1089, endpoint = DERIV_ENDPOINT, timeoutMs = 20000, WebSocketImpl = globalThis.WebSocket } = {}) {
  if (!WebSocketImpl) return Promise.reject(new Error("No WebSocket available. Use Node 22 or newer."));
  return new Promise((resolve, reject) => {
    const results = new Map();
    results.failures = [];
    const responded = new Set();
    const byReq = new Map();
    const socket = new WebSocketImpl(`${endpoint}?app_id=${appId}`);
    let done = false;
    const finish = (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try {
        socket.close();
      } catch {
        // already closed
      }
      if (err) reject(err);
      else resolve(results);
    };
    const timer = setTimeout(() => finish(new Error("Deriv request timed out")), timeoutMs);
    socket.addEventListener("error", () => finish(new Error("Deriv socket error")));
    socket.addEventListener("close", () => finish(responded.size === requests.length ? undefined : new Error("Deriv socket closed early")));
    socket.addEventListener("open", () => {
      requests.forEach((r, idx) => {
        const reqId = idx + 1;
        byReq.set(reqId, r);
        socket.send(
          JSON.stringify({
            ticks_history: r.symbol,
            adjust_start_time: 1,
            count: r.count ?? 500,
            end: "latest",
            granularity: r.granularity,
            style: "candles",
            req_id: reqId
          })
        );
      });
    });
    socket.addEventListener("message", (event) => {
      try {
        const body = JSON.parse(typeof event.data === "string" ? event.data : String(event.data));
        const r = byReq.get(body.req_id);
        if (!r) return;
        responded.add(body.req_id);
        try {
          results.set(`${r.symbol}:${r.granularity}`, parseCandles(body));
        } catch (err) {
          // One bad symbol must not take the others down. Report it and carry on.
          results.failures.push(`${r.symbol}: ${err instanceof Error ? err.message : String(err)}`);
        }
        if (responded.size === requests.length) finish();
      } catch (err) {
        finish(err instanceof Error ? err : new Error(String(err)));
      }
    });
  });
}
