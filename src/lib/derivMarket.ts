export type Tick = {
  symbol: string;
  quote: number;
  epoch: number;
};

export type SocketStatus = "connecting" | "live" | "offline";

export const BEGINNER_SYMBOLS = ["R_10", "R_25", "R_50", "R_75", "R_100", "BOOM500", "CRASH500", "frxEURUSD"] as const;

export type BeginnerSymbol = (typeof BEGINNER_SYMBOLS)[number];

export function derivSocketUrl(appId: number, endpoint = "wss://ws.derivws.com/websockets/v3"): string {
  if (!Number.isInteger(appId) || appId <= 0) {
    throw new Error("Deriv app_id must be a positive integer from api.deriv.com.");
  }
  return `${endpoint}?app_id=${appId}`;
}

export function parseTickMessage(payload: unknown): Tick | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as { error?: unknown; tick?: { symbol?: unknown; quote?: unknown; epoch?: unknown } };
  if (body.error) return null;
  const tick = body.tick;
  if (!tick) return null;
  const symbol = typeof tick.symbol === "string" ? tick.symbol : "";
  const quote = typeof tick.quote === "number" ? tick.quote : Number(tick.quote);
  const epoch = typeof tick.epoch === "number" ? tick.epoch : Number(tick.epoch);
  if (!symbol || !Number.isFinite(quote) || !Number.isFinite(epoch)) return null;
  return { symbol, quote, epoch };
}

export function parseHistoryMessage(payload: unknown): Tick | null {
  if (!payload || typeof payload !== "object") return null;
  const body = payload as {
    error?: unknown;
    echo_req?: { ticks_history?: unknown };
    history?: { prices?: unknown; times?: unknown };
  };
  if (body.error) return null;
  const symbol = typeof body.echo_req?.ticks_history === "string" ? body.echo_req.ticks_history : "";
  const prices = Array.isArray(body.history?.prices) ? body.history.prices : [];
  const times = Array.isArray(body.history?.times) ? body.history.times : [];
  const quote = Number(prices[prices.length - 1]);
  const epoch = Number(times[times.length - 1]);
  if (!symbol || !Number.isFinite(quote)) return null;
  return { symbol, quote, epoch: Number.isFinite(epoch) ? epoch : Math.floor(Date.now() / 1000) };
}

type QuoteHandlers = {
  onTick: (tick: Tick) => void;
  onStatus: (status: SocketStatus) => void;
  onError?: (message: string) => void;
};

export function subscribeDerivQuotes(
  appId: number,
  symbols: readonly string[],
  handlers: QuoteHandlers,
  socketFactory: (url: string) => WebSocket = (url) => new WebSocket(url)
): () => void {
  let closed = false;
  let socket: WebSocket | null = null;
  let pingTimer = 0;
  let retryTimer = 0;
  let attempt = 0;
  const unique = [...new Set(symbols.filter(Boolean))];

  const stopTimers = () => {
    window.clearInterval(pingTimer);
    window.clearTimeout(retryTimer);
    pingTimer = 0;
    retryTimer = 0;
  };

  const connect = () => {
    if (closed) return;
    handlers.onStatus("connecting");
    const next = socketFactory(derivSocketUrl(appId));
    socket = next;

    const requestHistory = () => {
      if (next.readyState !== WebSocket.OPEN) return;
      unique.forEach((symbol, index) => {
        next.send(JSON.stringify({ ticks_history: symbol, end: "latest", count: 1, req_id: index + 1 }));
      });
    };

    next.addEventListener("open", () => {
      if (closed || socket !== next) return;
      attempt = 0;
      handlers.onStatus("live");
      unique.forEach((symbol, index) => {
        next.send(JSON.stringify({ ticks: symbol, subscribe: 1, req_id: 100 + index }));
      });
      requestHistory();
      pingTimer = window.setInterval(() => {
        if (next.readyState !== WebSocket.OPEN) return;
        next.send(JSON.stringify({ ping: 1 }));
        requestHistory();
      }, 2_500);
    });

    next.addEventListener("message", (event) => {
      if (closed) return;
      try {
        const parsed = JSON.parse(String(event.data)) as { error?: { code?: string; message?: string } };
        if (parsed.error?.code && parsed.error.code !== "InvalidSymbol") {
          handlers.onError?.(parsed.error.message || parsed.error.code);
        }
        const tick = parseTickMessage(parsed) ?? parseHistoryMessage(parsed);
        if (tick) handlers.onTick(tick);
      } catch {
        handlers.onError?.("Deriv sent a message this desk could not read.");
      }
    });

    next.addEventListener("error", () => {
      if (!closed) handlers.onError?.("Deriv quote stream failed.");
    });

    next.addEventListener("close", () => {
      stopTimers();
      if (closed) return;
      handlers.onStatus("offline");
      const delay = Math.min(15_000, 1_000 * 2 ** attempt);
      attempt += 1;
      retryTimer = window.setTimeout(connect, delay);
    });
  };

  connect();

  return () => {
    closed = true;
    stopTimers();
    socket?.close();
    socket = null;
  };
}
