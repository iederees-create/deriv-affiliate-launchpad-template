const KIT_STORAGE_KEY = "ngw-deriv-kit-unlocked";

export function isKitUnlocked(): boolean {
  try {
    return window.localStorage.getItem(KIT_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function unlockKit(): void {
  try {
    window.localStorage.setItem(KIT_STORAGE_KEY, "1");
    window.dispatchEvent(new Event("ngw-kit-unlock"));
  } catch {
    // Storage can be blocked; downloads still work as public files.
  }
}

export function isAffiliateHref(href: string): boolean {
  return (
    href.includes("track.deriv.com") ||
    href.includes("t.deriv.link") ||
    href.includes("home.deriv.com/dashboard")
  );
}

export const kitFiles = [
  {
    file: "14-day-demo-plan.pdf",
    title: "14-day demo plan",
    pages: "1 page",
    text: "A day-by-day practice plan that keeps live money out of the first two weeks."
  },
  {
    file: "trade-journal.pdf",
    title: "Printable trade journal",
    pages: "2 pages",
    text: "Twenty numbered rows, plus a weekly review sheet. Fill it before you change a rule."
  },
  {
    file: "pre-session-checklist.pdf",
    title: "Pre-session checklist",
    pages: "1 page",
    text: "A one-page gate: sleep, daily stop, max trades, and a reason to sit out."
  },
  {
    file: "daily-loss-limit-card.pdf",
    title: "Daily loss-limit card",
    pages: "1 page",
    text: "Write the number once. When it is hit, the session is over."
  },
  {
    file: "position-size-worksheet.pdf",
    title: "Position-size worksheet",
    pages: "1 page",
    text: "Turn account size and a risk percent into a maximum stake before you click buy."
  }
] as const;
