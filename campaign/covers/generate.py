#!/usr/bin/env python3
from pathlib import Path

OUT = Path(__file__).parent
CARDS = [
    ("tools.html", "FREE BROWSER TOOLS", "Size the trade\nbefore you click buy.", "Stake planner · daily stop · 20-trade sample"),
    ("demo.html", "14-DAY DEMO PLAN", "Live money stays\noff the calendar.", "Buttons first. Journal second. Live maybe never."),
    ("journal.html", "PRINTABLE JOURNAL", "Twenty rows.\nThen you may change a rule.", "One setup. One risk percent. No mid-sample tinkering."),
    ("stop.html", "DAILY LOSS LIMIT", "Write the number.\nWhen it hits, stop.", "The extra try is how 2% becomes 8%."),
    ("v75.html", "SYNTHETIC INDICES", "Volatility 75\nis not a salary.", "The market does not close, so you have to."),
    ("kit.html", "FREE DOWNLOAD KIT", "Five files.\nZero payout screenshots.", "Demo plan · journal · checklist · stop card · size sheet"),
    ("sizing.html", "POSITION SIZE", "Survive the week\nyou do not want.", "0.5%–1% per trade. Small is the point."),
]

HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    html, body {{ margin: 0; height: 100%; }}
    body {{
      width: 1200px; height: 627px;
      background:
        radial-gradient(circle at 12% 0%, rgba(107,228,196,.22), transparent 36%),
        radial-gradient(circle at 88% 18%, rgba(138,180,255,.16), transparent 32%),
        #08111f;
      color: #f7fbff;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      display: grid;
      grid-template-rows: auto 1fr auto;
      padding: 48px 64px 40px;
      box-sizing: border-box;
    }}
    .kicker {{
      color: #6be4c4; font-weight: 800; letter-spacing: .16em;
      font-size: 18px;
    }}
    h1 {{
      margin: 0; font-size: 72px; line-height: .95; letter-spacing: -0.03em;
      white-space: pre-line;
    }}
    footer {{
      display: flex; justify-content: space-between; align-items: end;
      color: #a8b6ca; font-size: 22px; gap: 24px;
    }}
    .brand {{ color: #6be4c4; font-weight: 800; }}
  </style>
</head>
<body>
  <div class="kicker">{kicker}</div>
  <h1>{title}</h1>
  <footer>
    <div>{sub}</div>
    <div class="brand">NextGenWebs Trading Desk</div>
  </footer>
</body>
</html>
"""

for name, kicker, title, sub in CARDS:
    (OUT / name).write_text(HTML.format(kicker=kicker, title=title, sub=sub), encoding="utf-8")
    print("wrote", name)
