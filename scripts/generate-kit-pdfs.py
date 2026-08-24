#!/usr/bin/env python3
"""Build the printable trading kit PDFs for public/kit/."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

OUT = Path(__file__).resolve().parents[1] / "public" / "kit"
OUT.mkdir(parents=True, exist_ok=True)

BG = colors.HexColor("#08111f")
SURFACE = colors.HexColor("#101a2b")
LINE = colors.HexColor("#2a3d57")
TEXT = colors.HexColor("#f7fbff")
MUTED = colors.HexColor("#a8b6ca")
PRIMARY = colors.HexColor("#6be4c4")
ACCENT = colors.HexColor("#f8d06b")

DISCLOSURE = (
    "Affiliate disclosure: NextGenWebs / Iederees Francis may earn a commission if you "
    "register through the partner links on the website. Trading involves risk. CFDs and "
    "leveraged products can lose more than you put in. These pages are educational, not financial advice."
)


def styles():
    base = getSampleStyleSheet()
    return {
        "kicker": ParagraphStyle(
            "kicker", parent=base["Normal"], textColor=PRIMARY, fontName="Helvetica-Bold",
            fontSize=9, leading=12, tracking=1, spaceAfter=6,
        ),
        "title": ParagraphStyle(
            "title", parent=base["Title"], textColor=TEXT, fontName="Helvetica-Bold",
            fontSize=22, leading=26, alignment=TA_LEFT, spaceAfter=10,
        ),
        "h": ParagraphStyle(
            "h", parent=base["Heading2"], textColor=TEXT, fontName="Helvetica-Bold",
            fontSize=13, leading=17, spaceBefore=12, spaceAfter=6,
        ),
        "body": ParagraphStyle(
            "body", parent=base["BodyText"], textColor=MUTED, fontName="Helvetica",
            fontSize=10, leading=14, spaceAfter=8,
        ),
        "cell": ParagraphStyle(
            "cell", parent=base["BodyText"], textColor=TEXT, fontName="Helvetica",
            fontSize=8, leading=11,
        ),
        "cellh": ParagraphStyle(
            "cellh", parent=base["BodyText"], textColor=PRIMARY, fontName="Helvetica-Bold",
            fontSize=8, leading=11,
        ),
        "note": ParagraphStyle(
            "note", parent=base["BodyText"], textColor=ACCENT, fontName="Helvetica",
            fontSize=8, leading=11, spaceBefore=10,
        ),
    }


def paint(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BG)
    canvas.rect(0, 0, A4[0], A4[1], fill=1, stroke=0)
    canvas.setFillColor(PRIMARY)
    canvas.rect(0, A4[1] - 8, A4[0], 8, fill=1, stroke=0)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawString(18 * mm, 12 * mm, "NextGenWebs Trading Desk  ·  not financial advice")
    canvas.drawRightString(A4[0] - 18 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


def doc(path):
    return SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=20 * mm,
        bottomMargin=18 * mm,
        title=path.stem,
        author="Iederees Francis / NextGenWebs",
    )


def table(rows, widths):
    data = []
    for i, row in enumerate(rows):
        style = S["cellh"] if i == 0 else S["cell"]
        data.append([Paragraph(str(cell), style) for cell in row])
    grid = Table(data, colWidths=widths, repeatRows=1)
    grid.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SURFACE),
        ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#0c1728")),
        ("GRID", (0, 0), (-1, -1), 0.4, LINE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return grid


S = styles()
W = 174 * mm


def write_demo_plan():
    story = [
        Paragraph("NEXTGENWEBS TRADING DESK", S["kicker"]),
        Paragraph("14-day demo plan", S["title"]),
        Paragraph("Live money stays off this calendar. If you cannot keep the rules on demo, do not fund live.", S["body"]),
        Paragraph("Standing rules", S["h"]),
        Paragraph("One market family for 14 days. One risk percent, written before the session (0.5% or 1%). Daily stop of 2% of the demo balance. Maximum four completed trades per session. Journal every trade.", S["body"]),
        Paragraph("Days 1–3 · buttons", S["h"]),
        Paragraph("Open the demo. Learn open / monitor / close. Take only tiny stakes. Write why you clicked, even if the reason is 'curiosity'.", S["body"]),
        Paragraph("Days 4–10 · one setup", S["h"]),
        Paragraph("Describe the setup in one sentence a stranger would understand. Do not change it. Fill twenty journal rows. Use the stake planner so the number is not a mood.", S["body"]),
        Paragraph("Days 11–14 · review", S["h"]),
        Paragraph("Count broken rules first, results second. The only decision is whether you can run the process again. Funding live is a separate decision and is not required.", S["body"]),
        Paragraph("Daily log", S["h"]),
        table(
            [["Day", "Market", "Risk %", "Daily stop $", "Trades", "Rules kept?", "Note"]]
            + [[str(i), "", "", "", "", "", ""] for i in range(1, 15)],
            [18 * mm, 28 * mm, 22 * mm, 28 * mm, 20 * mm, 26 * mm, 32 * mm],
        ),
        Paragraph(DISCLOSURE, S["note"]),
    ]
    d = doc(OUT / "14-day-demo-plan.pdf")
    d.build(story, onFirstPage=paint, onLaterPages=paint)


def write_journal():
    header = ["#", "Date", "Market", "Stake", "Setup (one sentence)", "Result", "Broke a rule?", "Emotion"]
    widths = [12 * mm, 22 * mm, 24 * mm, 18 * mm, 48 * mm, 18 * mm, 16 * mm, 16 * mm]
    rows_page = [["1"]]  # placeholder replaced below
    story = [
        Paragraph("NEXTGENWEBS TRADING DESK", S["kicker"]),
        Paragraph("Trade journal · 20 rows", S["title"]),
        Paragraph("One setup. One risk percent. Do not change the rules until row 20 is filled.", S["body"]),
    ]
    block = [header] + [[str(i), "", "", "", "", "", "", ""] for i in range(1, 11)]
    story += [table(block, widths), Spacer(1, 8), Paragraph("Rows 11–20", S["h"])]
    block2 = [header] + [[str(i), "", "", "", "", "", "", ""] for i in range(11, 21)]
    story += [table(block2, widths), PageBreak()]
    story += [
        Paragraph("Weekly review", S["h"]),
        Paragraph("Broken-rule count first. Then wins / losses. Then whether the daily stop was hit. A green week with ignored stops is still a failed sample.", S["body"]),
        table(
            [
                ["Question", "Answer"],
                ["Trades completed", ""],
                ["Rules broken", ""],
                ["Daily stop hit how many days?", ""],
                ["Same setup the whole week?", ""],
                ["What I will keep", ""],
                ["What I will not do next week", ""],
            ],
            [70 * mm, 104 * mm],
        ),
        Paragraph(DISCLOSURE, S["note"]),
    ]
    d = doc(OUT / "trade-journal.pdf")
    d.build(story, onFirstPage=paint, onLaterPages=paint)
    del rows_page


def write_checklist():
    items = [
        ["Gate", "Yes / no"],
        ["I slept enough to sit still for 45 minutes", ""],
        ["I wrote today's dollar stop before opening a chart", ""],
        ["I wrote today's max trade count", ""],
        ["I know the one setup in one sentence", ""],
        ["I am not trying to recover yesterday", ""],
        ["If any answer is no, I sit out", ""],
    ]
    story = [
        Paragraph("NEXTGENWEBS TRADING DESK", S["kicker"]),
        Paragraph("Pre-session checklist", S["title"]),
        Paragraph("Fill this before the platform. A no on any line is a valid session: you do not trade.", S["body"]),
        table(items, [130 * mm, 44 * mm]),
        Paragraph("Session notes", S["h"]),
        table([["Start", "End", "Stop $", "Cap", "What would make me quit early"], ["", "", "", "", ""]], [28 * mm, 28 * mm, 28 * mm, 22 * mm, 68 * mm]),
        Paragraph(DISCLOSURE, S["note"]),
    ]
    d = doc(OUT / "pre-session-checklist.pdf")
    d.build(story, onFirstPage=paint, onLaterPages=paint)


def write_limit_card():
    story = [
        Paragraph("NEXTGENWEBS TRADING DESK", S["kicker"]),
        Paragraph("Daily loss-limit card", S["title"]),
        Paragraph("Write the number once. When it is hit, the session is over.", S["body"]),
        table(
            [
                ["Field", "Today"],
                ["Account size", ""],
                ["Daily max % (example: 2%)", ""],
                ["Daily max $", ""],
                ["Already lost $", ""],
                ["Remaining $", ""],
                ["Session over? (yes when remaining is 0)", ""],
            ],
            [100 * mm, 74 * mm],
        ),
        Paragraph("If remaining is smaller than the next planned stake, skip the trade. Do not 'make it back' in the same sitting.", S["body"]),
        Paragraph(DISCLOSURE, S["note"]),
    ]
    d = doc(OUT / "daily-loss-limit-card.pdf")
    d.build(story, onFirstPage=paint, onLaterPages=paint)


def write_size_sheet():
    story = [
        Paragraph("NEXTGENWEBS TRADING DESK", S["kicker"]),
        Paragraph("Position-size worksheet", S["title"]),
        Paragraph("Max stake = account × risk percent. If five losers at that stake would wreck the week, the percent is too high.", S["body"]),
        table(
            [
                ["Input", "Value"],
                ["Account size $", ""],
                ["Risk per trade % (0.25–1 is a common ceiling)", ""],
                ["Max $ at risk this trade", ""],
                ["Daily cap %", ""],
                ["Daily cap $", ""],
                ["Planned stake $ (must be ≤ max at risk and ≤ remaining daily cap)", ""],
            ],
            [110 * mm, 64 * mm],
        ),
        Paragraph("Worked example, not a recommendation: $500 account, 1% risk → $5 max at risk. 2% daily cap → $10. Two full-risk losers and the day is done.", S["body"]),
        Paragraph(DISCLOSURE, S["note"]),
    ]
    d = doc(OUT / "position-size-worksheet.pdf")
    d.build(story, onFirstPage=paint, onLaterPages=paint)


if __name__ == "__main__":
    write_demo_plan()
    write_journal()
    write_checklist()
    write_limit_card()
    write_size_sheet()
    print("Wrote", ", ".join(p.name for p in sorted(OUT.glob("*.pdf"))))
