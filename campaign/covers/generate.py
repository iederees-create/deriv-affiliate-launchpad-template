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
    ("drawdown.html", "DRAWDOWN MATH", "A 20% hole needs\na 25% climb.", "The recovery is never the same number as the loss."),
    ("streak.html", "LOSING STREAKS", "Five losers in a row\nis not rare.", "See what is left before you size the next one."),
    ("session.html", "SESSION CLOCK", "The market does not\nclose. You still have to.", "45 minutes. Then the next tick is not a session."),
    ("gate.html", "SIT-OUT GATE", "If any answer is no,\nthere is no trade.", "Sitting out is a valid session."),
    ("expectancy.html", "SAMPLE MATH", "Win rate without R\nis a vanity number.", "Twenty trades. Then review, not rewrite."),
    ("paid.html", "HOW THIS DESK WORKS", "The tools are free.\nThe commission is disclosed.", "Demo first. No password. No profit promise."),
]

HTML = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <style>
    html, body {{ margin: 0; width: 100%; height: 100%; overflow: hidden; }}
    body {{
      position: relative;
      min-height: 627px;
      background:
        radial-gradient(circle at 12% 0%, rgba(107,228,196,.22), transparent 36%),
        radial-gradient(circle at 88% 18%, rgba(138,180,255,.16), transparent 32%),
        #08111f;
      color: #f7fbff;
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
    }}
    .kicker {{
      position: absolute; top: 48px; left: 64px; right: 64px;
      color: #6be4c4; font-weight: 800; letter-spacing: .16em;
      font-size: 18px;
    }}
    h1 {{
      position: absolute; top: 110px; left: 64px; right: 80px;
      margin: 0; font-size: 64px; line-height: .95; letter-spacing: -0.03em;
      white-space: pre-line;
    }}
    footer {{
      position: absolute; left: 64px; right: 64px; bottom: 40px;
      display: flex; justify-content: space-between; align-items: end;
      color: #a8b6ca; font-size: 22px; gap: 24px;
    }}
    .brand {{ color: #6be4c4; font-weight: 800; white-space: nowrap; }}
  </style>
</head>
<body>
  <div class="kicker">{kicker}</div>
  <h1>{title}</h1>
  <footer>
    <div>{sub}</div>
    <div class="brand">Apex Trade Network</div>
  </footer>
</body>
</html>
"""

for name, kicker, title, sub in CARDS:
    (OUT / name).write_text(HTML.format(kicker=kicker, title=title, sub=sub), encoding="utf-8")
    print("wrote", name)
