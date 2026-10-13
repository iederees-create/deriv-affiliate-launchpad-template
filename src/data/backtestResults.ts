import data from "./backtestResults.json";

export type BacktestVerdict = "no evidence of edge" | "inconclusive";

export type BacktestRow = {
  slug: string | null;
  name: string;
  kind: string;
  trades: number;
  expectancyR: number;
  interval: string;
  profitFactor: number;
  verdict: BacktestVerdict;
  note: string;
};

export type BacktestResultsData = {
  testedOn: string;
  data: string;
  unseenWindow: string;
  costs: string;
  rows: BacktestRow[];
};

export const backtestResults = data as BacktestResultsData;
