export type Direction = 'buy' | 'sell';

export function finitePositive(value: string | number) {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

export function calculateTradePlan(direction: Direction, entryValue: string, stopValue: string, targetValue: string, sizeValue: string) {
  const entry = finitePositive(entryValue);
  const stop = finitePositive(stopValue);
  const target = finitePositive(targetValue);
  const size = finitePositive(sizeValue);
  if (!entry || !stop || !target || !size) return { error: 'Enter positive, valid numbers in every price and position-size field.' } as const;
  const valid = direction === 'buy' ? stop < entry && target > entry : stop > entry && target < entry;
  if (!valid) return { error: direction === 'buy' ? 'For a buy, stop must be below entry and target above entry.' : 'For a sell, stop must be above entry and target below entry.' } as const;
  const risk = Math.abs(entry - stop) * size;
  const reward = Math.abs(target - entry) * size;
  return { risk, reward, ratio: reward / risk, breakEven: entry, direction } as const;
}

export function calculateDrawdown(peakValue: string, currentValue: string) {
  const peak = finitePositive(peakValue);
  const currentNumber = Number(currentValue);
  const current = Number.isFinite(currentNumber) && currentNumber >= 0 ? currentNumber : null;
  if (!peak || current === null) return { error: 'Enter positive, valid balances.' } as const;
  if (current > peak) return { error: 'Current balance cannot exceed the selected previous peak.' } as const;
  const amount = peak - current;
  const percentage = (amount / peak) * 100;
  const recovery = current === 0 ? Infinity : (amount / current) * 100;
  return { amount, percentage, recovery, progress: (current / peak) * 100 } as const;
}

export type JournalEntry = {
  id: string; date: string; market: string; account: 'demo' | 'live'; direction: Direction;
  entry: number; exit: number; size: number; result: number; setup: string; notes: string; lessons: string;
};

export function journalStats(entries: JournalEntry[]) {
  const wins = entries.filter((entry) => entry.result > 0);
  const losses = entries.filter((entry) => entry.result < 0);
  const grossWin = wins.reduce((sum, entry) => sum + entry.result, 0);
  const grossLoss = Math.abs(losses.reduce((sum, entry) => sum + entry.result, 0));
  return {
    total: entries.length,
    winRate: entries.length ? (wins.length / entries.length) * 100 : 0,
    averageWin: wins.length ? grossWin / wins.length : 0,
    averageLoss: losses.length ? grossLoss / losses.length : 0,
    net: entries.reduce((sum, entry) => sum + entry.result, 0),
    profitFactor: grossLoss ? grossWin / grossLoss : grossWin ? Infinity : 0,
  };
}

const csvHeaders: (keyof JournalEntry)[] = ['id','date','market','account','direction','entry','exit','size','result','setup','notes','lessons'];
const quote = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;

export function journalToCsv(entries: JournalEntry[]) {
  return [csvHeaders.join(','), ...entries.map((entry) => csvHeaders.map((header) => quote(entry[header])).join(','))].join('\n');
}

function parseCsvRows(text: string) {
  const rows: string[][] = []; let row: string[] = []; let field = ''; let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted && char === '"' && text[index + 1] === '"') { field += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) { if (char === '\r' && text[index + 1] === '\n') index += 1; row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = ''; }
    else field += char;
  }
  row.push(field); if (row.some(Boolean)) rows.push(row); return rows;
}

export function csvToJournal(text: string): JournalEntry[] {
  const rows = parseCsvRows(text.trim());
  if (!rows.length || rows[0].join(',') !== csvHeaders.join(',')) throw new Error('CSV headers do not match the Apex journal export format.');
  return rows.slice(1).map((row, index) => {
    const values = Object.fromEntries(csvHeaders.map((header, column) => [header, row[column] ?? ''])) as Record<keyof JournalEntry, string>;
    const entry = Number(values.entry), exit = Number(values.exit), size = Number(values.size), result = Number(values.result);
    if (!values.date || !values.market || !['demo','live'].includes(values.account) || !['buy','sell'].includes(values.direction) || ![entry, exit, size, result].every(Number.isFinite) || entry < 0 || exit < 0 || size <= 0) throw new Error(`Invalid journal row ${index + 2}.`);
    return { ...values, id: values.id || crypto.randomUUID(), account: values.account as 'demo'|'live', direction: values.direction as Direction, entry, exit, size, result };
  });
}

export const sessions = [
  { name: 'Sydney', zone: 'Australia/Sydney', open: 8, close: 17 },
  { name: 'Tokyo', zone: 'Asia/Tokyo', open: 9, close: 18 },
  { name: 'London', zone: 'Europe/London', open: 8, close: 17 },
  { name: 'New York', zone: 'America/New_York', open: 8, close: 17 },
] as const;

function zoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function sessionStatus(now = new Date()) {
  return sessions.map((session) => {
    const parts = zoneParts(now, session.zone);
    const minutes = Number(parts.hour) * 60 + Number(parts.minute);
    const weekdayOpen = !['Sat','Sun'].includes(parts.weekday);
    const open = weekdayOpen && minutes >= session.open * 60 && minutes < session.close * 60;
    const localFormatter = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });
    const zonedDay = new Intl.DateTimeFormat('en-CA', { timeZone: session.zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
    const [year, month, day] = zonedDay.split('-').map(Number);
    const instantForHour = (hour: number) => {
      let guess = new Date(Date.UTC(year, month - 1, day, hour));
      for (let i = 0; i < 2; i += 1) {
        const p = zoneParts(guess, session.zone); const delta = hour * 60 - (Number(p.hour) * 60 + Number(p.minute));
        guess = new Date(guess.getTime() + delta * 60000);
      }
      return guess;
    };
    return { ...session, isOpen: open, localHours: `${localFormatter.format(instantForHour(session.open))}–${localFormatter.format(instantForHour(session.close))}` };
  });
}

export function downloadText(filename: string, content: string, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type }); const url = URL.createObjectURL(blob);
  const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
