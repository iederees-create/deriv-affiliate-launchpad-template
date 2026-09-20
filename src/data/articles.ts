export type ArticleSection = { heading: string; body: string[] };

export type Article = {
  slug: string;
  title: string;
  description: string;
  date: string;
  sections: ArticleSection[];
};

export const articles: Article[] = [
  {
    slug: "rsi-eclipse-across-volatility-charts",
    title: "How RSI Eclipse Reads 15 Volatility Markets Without Turning Into a Signal Room",
    description: "A public Deriv demo that scans 15 volatility indices on six timeframes. RSI 20/80, one contract, practice funds. How to read the board, why 5-minute-only was too slow, and what the numbers are not.",
    date: "2026-09-13",
    sections: [
      {
        heading: "The board is a scan, not a salary screenshot",
        body: [
          "The live desk on this site is a shared Deriv demo. Anyone can watch it without a login. The wallet is practice money. The trades are rise/fall options at a $1 stake. If someone quotes those numbers as income, they misread the page.",
          "The current rule is called Apex Eclipse Call Guard. It is still mean-reversion, not momentum. CALL only after RSI(14) was at or below 20 and ticks up with a higher close while still at or below 28. PUT is off because the previous 140-trade RSI-cross book paid 39.7% on PUTs. Extra gates: last-bar range versus recent average, a slower chart that is not in a washout, 10-minute through 30-minute signal charts, skip 06:00–12:00 UTC, volatility indices only, and the highest-score setup wins. Expiry is never shorter than the chart that signalled. Practice funds only. This is not a 90% win-rate claim.",
          "Watch it here: https://iederees-create.github.io/deriv-affiliate-launchpad-template/lab . Partner link and referral code sit on that page because this is an independent partner desk, not an official Deriv website, not a signal room, and not financial advice."
        ]
      },
      {
        heading: "What you are actually looking at",
        body: [
          "The dark panel is a radar for stretch, not a price chart. Each row is a volatility index. Each column is a timeframe. The number in a cell is RSI, not the last tick. Teal means the last 14 bars of that chart fell hard enough to print below 20. Copper means they rose hard enough to print above 80. Grey means the desk is waiting.",
          "The six dials above the grid belong to the highlighted market. The needle is RSI. The teal band on the left of each dial is the buy zone. The copper band on the right is the sell zone. Tap a market name to park the dials on that row.",
          "Boom, Crash and Step are not on the grid. Those products have a different shape. This desk does not pretend one RSI rule fits them."
        ]
      },
      {
        heading: "Why 5-minute-only was too slow",
        body: [
          "The first honest version of this rule sat on Volatility 75 (1s) using only the 5-minute chart. RSI 20/80 on M5 is strict. That is the point. It is also why a visitor could stare at a quiet board for a long time and decide the desk was broken.",
          "Adding 15-minute, 30-minute, 1-hour, 4-hour and daily charts does not make higher timeframes fire more often than M5. It adds extra chances when M5 is quiet. If M5 is already at 18, M5 still wins. If M5 is at 51 and the hourly chart just printed 81, the hourly chart can take the trade.",
          "That is an OR-scan, not a confirmation stack. We do not wait for five charts to agree. Waiting for agreement is how people miss the only bar that qualified."
        ]
      },
      {
        heading: "Why fifteen markets, and why not Boom or Crash",
        body: [
          "The scan list is Volatility 10, 15, 25, 30, 50, 75, 90, 100, 150 and 250 on the 1-second variants, plus the standard Volatility 10, 25, 50, 75 and 100. Fifteen products. One global contract. The desk does not pyramid, does not martingale, and does not open a second ticket because another cell went teal.",
          "Boom, Crash and Step stay off the list. Spike products and step products are a different game. A 20/80 RSI fade that is reasonable on a volatility index is not automatically reasonable on a market built around discontinuous jumps.",
          "If two markets print a signal at the same moment, the walk order on the server decides. Volatility 10 (1s) is checked first, Volatility 100 last. That is a queue, not a ranking of quality."
        ]
      },
      {
        heading: "RSI 20/80 is a stretch meter, not a crystal ball",
        body: [
          "RSI(14) asks a narrow question: of the last fourteen closes, how much of the movement was up versus down. Below 20, recent bars were mostly down. Above 80, mostly up. The desk bets that an extreme stretch on a synthetic index often gives some of that move back before expiry.",
          "It often does not. Mean reversion loses when the stretch continues. That is why the stake stays at $1 and why there is still only one contract. A public desk that sizes up after a loss is a tutorial in how accounts die.",
          "The MT5 pack that downline members can download still uses a 1,000-point stop and a 25,000-point target on a CFD chart. Rise/fall options on the website cannot attach those stops. The website uses time. The EA uses price. They will not take the same trade at the same second, and they should not be compared as if they did."
        ]
      },
      {
        heading: "How to read a finished trade",
        body: [
          "Up means a CALL: the desk thought the market would finish higher than the entry tick when the contract expired. Down means a PUT. Won and lost are practice dollars. A $1 stake loses $1 when wrong. A win pays a bit less than $1, so you still need more than half the trades to come out ahead. Anything near a coin flip is not an edge.",
          "The tape of short bars under the wallet is the recent closed sample, in order. Teal is a win. Copper is a loss. It is there so a visitor can see streaks without opening a spreadsheet.",
          "If the board says it is taking a short break, that is the three-loss pause. It is a rule, not a bug. Revenge trades after the third loser are how a 2 percent day becomes an 8 percent day."
        ]
      },
      {
        heading: "What the earlier public rules taught us",
        body: [
          "The first live rule on this desk chased four 1-second ticks in the same direction. It printed a win rate near 54 percent on more than a thousand trades and still lost money, because a win paid less than a loss cost. That is a coin with a fee. We said so in public and changed the rule.",
          "A spike-fade version came next: fade a 1.8× average tick and hold eight ticks. Then a 1-second RSI 30/70. Both leaked. The current desk moved the question off the 1-second tape and onto closed 5-minute through daily bars, with a stricter 20/80 band.",
          "None of that is a victory lap. It is the reason the board exists. If the arithmetic is ugly, the honest move is to change the rule, not crop the screenshot."
        ]
      },
      {
        heading: "How the scan decides, in order",
        body: [
          "Candles are seeded from Deriv history, then kept fresh from the live tick stream. Each market holds six buckets. When a bar closes, RSI is recomputed. If RSI has just entered the buy or sell zone on a chart that has not already been used for this bucket, that chart can fire.",
          "The server walks markets in a fixed list, then timeframes from M5 to D1. First valid signal wins. The contract duration matches that timeframe: five minutes for M5, fifteen for M15, and so on, with a 15-minute then 5-minute fallback if the broker rejects the first duration.",
          "If a contract is already open, every other cell can glow teal and the desk will still wait. One position is the risk rule. It is also the readability rule. A board with six open tickets is a light show, not a lesson."
        ]
      },
      {
        heading: "What this page will not claim",
        body: [
          "It will not say the strategy is profitable. It will not say 20/80 is magic. It will not treat a 100 percent win rate on two trades as evidence. It will not call demo dollars a salary. It will not tell you to fund a live account.",
          "It will show the wallet, the losses, the pause, and the cells that are not signalling. Hiding the quiet cells would make the desk look busier than it is.",
          "I may earn a commission if you open Deriv through the partner link on this site. That is the commercial relationship. It does not change the demo math."
        ]
      },
      {
        heading: "If you want to practise the same idea yourself",
        body: [
          "Open a Deriv demo through the partner link. Referral code 28EX72Q47LR4. Do not copy the public tickets tick-for-tick. The website board and an Expert Advisor on your MT5 will not match, and options are not CFDs.",
          "Write a daily stop before you start. Journal twenty trades before you change the rule. If five losers in a row would wreck the account, the stake is too large. The 14-day kit on this site exists for that work.",
          "Downline members can claim the MT5 pack after the Deriv ID is verified on this partner downline. The website remains watchable either way."
        ]
      }
    ]
  },
  {
    slug: "drawdown-recovery-math",
    title: "A 20% Hole Needs a 25% Climb",
    description: "Why drawdown recovery is not symmetric, and why a written daily stop is cheaper than a heroic comeback.",
    date: "2026-08-28",
    sections: [
      {
        heading: "The arithmetic people skip",
        body: [
          "Lose 10% and you need 11.1% back. Lose 20% and you need 25%. Lose 50% and you need 100%. The hole and the climb are not the same number. That is not a motivation poster. It is the reason a daily stop exists.",
          "The drawdown recovery tool on this site does that sum in the browser. Type the percent you are already down. If the climb looks ugly, the answer is not a larger next stake."
        ]
      },
      {
        heading: "What to do instead of doubling",
        body: [
          "Write the daily cap before the session. When remaining hits zero, close the platform. Review the journal tomorrow. A smaller account that still exists on Friday is more useful than a recovery plan written at 23:40.",
          "This is not a claim that 1% risk makes you profitable. It is a claim that 4% risk after three losers is how people turn a bad morning into a ruined week."
        ]
      }
    ]
  },
  {
    slug: "sitting-out-is-a-valid-session",
    title: "Sitting Out Is a Valid Session",
    description: "The platform being open is not a reason to take a contract. A written no still counts as process.",
    date: "2026-08-28",
    sections: [
      {
        heading: "A no is a finished session",
        body: [
          "The pre-session checklist in the kit has a line I like: if any answer is no, I sit out. That is not a slogan. It is the only way a checklist is worth the paper.",
          "The sit-out gate on the tools page is five checkboxes: written stake, daily remaining larger than the stake, still inside the session clock, a setup you can say in one sentence, and not taking the trade to recover the last loss. If any box is empty, there is no trade."
        ]
      },
      {
        heading: "Journal the skip",
        body: [
          "Write the sit-out as a row: time, market, reason. 'Would have been revenge' is a better note than a green screenshot of a trade you should not have taken.",
          "I may earn a commission if you open a Deriv demo through the partner link. Sitting out does not change that, and it does not require a deposit."
        ]
      }
    ]
  },
  {
    slug: "revenge-trade-after-the-third-loser",
    title: "The Third Loser Is Where Accounts Disappear",
    description: "The extra try after a streak is how a 2% day becomes an 8% day.",
    date: "2026-08-28",
    sections: [
      {
        heading: "The mood arrives on schedule",
        body: [
          "Two losers feel like noise. The third feels personal. That is when people raise the stake, skip the journal, and stay past the session clock. The losing-streak tool shows what five full-risk losers do to a $500 account at 1%. It is not rare. It is the default bad week.",
          "A daily stop of 2% means two full-risk losers and the day is done. The extra try is how 2% becomes 8%."
        ]
      },
      {
        heading: "Write the number while you are still calm",
        body: [
          "The card in the kit is a piece of paper on purpose. A number in a notes app is easy to edit after the third loser. A number already written is harder to negotiate with.",
          "Use the daily limiter. Type what you already lost. If remaining is smaller than the next planned stake, skip. That sentence saves more accounts than any indicator I have seen posted as a screenshot."
        ]
      }
    ]
  },
  {
    slug: "session-clock-for-24-7-markets",
    title: "Put a Clock on a Market That Never Closes",
    description: "Volatility indices keep ticking at 02:00. Your session should not.",
    date: "2026-08-28",
    sections: [
      {
        heading: "The product is 24/7. You are not.",
        body: [
          "Synthetic indices do not have a cash close. That is useful for practice. It is also why people sit in front of 1-second ticks like it is a night shift. A salary has hours. This market does not. You have to put the clock on yourself.",
          "The session clock on the tools page is a timer, not a strategy. Forty-five minutes plus a four-trade cap is plenty. When the clock hits zero, the next tick is not a session."
        ]
      },
      {
        heading: "Combine the clock with the cap",
        body: [
          "Time or trade count, whichever hits first. Then journal. Opening the platform 'just to look' after the cap is the note worth writing down.",
          "If you still want a Deriv demo to practise that routine, use the partner link so the referral sits with me. Read the risk page first. None of this is a payout promise."
        ]
      }
    ]
  },
  {
    slug: "how-this-affiliate-desk-gets-paid",
    title: "How This Desk Gets Paid, Without Hiding It",
    description: "The calculators are free. Commission only happens if you become a Deriv client through my disclosed partner link.",
    date: "2026-08-28",
    sections: [
      {
        heading: "The model in one paragraph",
        body: [
          "You can use the browser tools with no login. If you want the printable kit, the unlock is a click through my Deriv partner link. If you later qualify as a client, Deriv may pay me a commission. I cannot see your password. I do not hold your money. I will not tell you what to trade.",
          "A deposit is not required to read the education pages. Demo is the default route I send people to."
        ]
      },
      {
        heading: "Why say this in public",
        body: [
          "Trading audiences already assume someone is getting paid. When a page pretends otherwise, the visitor fills in a worse story. Disclosure is cheaper than that, and it filters the people who only wanted a secret income method.",
          "If that is too boring to follow, this desk is not for you. If you want the process files anyway, they are on the kit page."
        ]
      }
    ]
  },
  {
    slug: "demo-first-14-day-plan",
    title: "A 14-Day Demo Plan That Keeps Live Money Out of Week One",
    description: "A two-week practice plan for Deriv demo accounts with a daily stop, a trade cap, and a journal.",
    date: "2026-08-24",
    sections: [
      {
        heading: "The point of the two weeks",
        body: [
          "The plan is not to find a secret Volatility 75 setup. The plan is to prove that you can follow a written process when nothing real is on the line. If you cannot keep a daily stop on demo, you will not keep it live.",
          "I keep live funding off the calendar on purpose. Demo is slower to teach ego than live money, but it is still useful: you learn the platform buttons, the contract types you actually understand, and whether you can stop after a cap."
        ]
      },
      {
        heading: "Rules that stay the same every day",
        body: [
          "One market family. If you pick synthetic indices, stay there for the 14 days. Do not hop from V75 1s to gold to a random multiplier because the last trade lost.",
          "One risk percent, written before the session. 0.5% or 1% of the demo balance is enough to feel the math without turning every tick into a drama.",
          "A daily stop, also written first. Two percent of the demo balance is a hard ceiling I use in the printable kit. When it is hit, the platform is closed.",
          "A session trade cap. Four completed trades is plenty. The 1-second synthetics will invite twenty more. That invitation is the test."
        ]
      },
      {
        heading: "Days 1 to 3: buttons and boredom",
        body: [
          "Open the demo through the partner link on this site if you want the tracking to sit with me. Then ignore strategy YouTube. Click through the platform until you can open, monitor, and close a contract without guessing.",
          "Journal every click: time, market, stake, reason, result, whether you followed the daily stop. The reason can be one sentence. 'Felt like it' is an allowed reason. It is also useful data."
        ]
      },
      {
        heading: "Days 4 to 10: one setup, twenty rows",
        body: [
          "Pick one setup you can describe in a sentence a stranger would understand. Example: 'I only take a contract if I have already written the stake and I am inside my trade cap.' That is a process setup, not a prediction setup, and it is enough for this plan.",
          "Fill twenty journal rows before you change the setup. Use the calculator on the tools page so the stake is a number, not a mood."
        ]
      },
      {
        heading: "Days 11 to 14: review, then decide nothing expensive",
        body: [
          "Count wins and losses, but also count broken rules. A profitable week with six ignored stops is a failed sample.",
          "The only decision at the end is whether you can run this process again next fortnight. Funding a live account is a separate decision and it is not required by this plan.",
          "If you use the signup route on this site, I may earn a commission. That does not change the work: demo first, journal second, live maybe never."
        ]
      }
    ]
  },
  {
    slug: "position-sizing-that-survives-a-bad-week",
    title: "Position Sizing That Survives a Bad Week",
    description: "How to pick a stake so five losing trades do not end the account.",
    date: "2026-08-24",
    sections: [
      {
        heading: "Start from the losing streak, not the win",
        body: [
          "People size trades from the screenshot they want. Size them from the week you do not want. Five losers in a row is not rare. If those five trades at your current stake would take out 10% or more of the account, the stake is entertainment, not a process.",
          "A simple ceiling: risk 0.5% to 1% of account per trade. On a $500 demo that is $2.50 to $5. It looks small. Small is the point."
        ]
      },
      {
        heading: "Do the arithmetic once, then reuse it",
        body: [
          "Max stake = account × risk percent. Daily cap = account × daily percent. If the next stake is larger than remaining daily cap, skip the trade. That last sentence saves more accounts than any indicator.",
          "The stake planner on this site does that math in the browser. It does not connect to your Deriv account and it does not know your market. You still have to type honest numbers."
        ]
      },
      {
        heading: "What this is not",
        body: [
          "This is not a lot-size formula for every CFD, and it is not a claim that 1% risk makes you profitable. It is a way to still have an account on Friday after a stupid Monday.",
          "I may earn a commission if you open a Deriv account through the links here. The calculator is free regardless."
        ]
      }
    ]
  },
  {
    slug: "volatility-75-is-not-a-salary",
    title: "Volatility 75 Is Not a Salary",
    description: "Why 24/7 synthetic indices invite overtrading, and how to put a clock on the session.",
    date: "2026-08-24",
    sections: [
      {
        heading: "The market does not close, so you have to",
        body: [
          "Volatility 75 and the 1-second variants keep moving while you eat, while you work, and at 02:00. That is useful for practice. It is also why people blow demo and live accounts: there is always another tick that looks like a chance to get even.",
          "A salary has hours. This does not. If you need the next contract to pay rent, you are already past the point where a tool on a website helps. Do not trade money you need."
        ]
      },
      {
        heading: "Put a clock and a cap on it",
        body: [
          "Decide the session length before you open the chart. Forty-five minutes is plenty. Combine that with a four-trade cap and a daily stop from the tools page.",
          "If you catch yourself opening the platform 'just to look' after the cap, that is the journal note. Write it. That note is more valuable than a new indicator."
        ]
      },
      {
        heading: "I am not selling a V75 system",
        body: [
          "I have traded these markets and I have been bad at them. This page exists because process files are more honest than a signal group. If you still want a Deriv demo, use the partner link so the referral sits with me. Read the risk page first."
        ]
      }
    ]
  },
  {
    slug: "journal-20-trades-before-you-change-anything",
    title: "Journal 20 Trades Before You Change Anything",
    description: "Why a 20-trade sample beats swapping strategies after three losers.",
    date: "2026-08-24",
    sections: [
      {
        heading: "Three trades is a mood. Twenty is a sample.",
        body: [
          "After two losers, the brain wants a new strategy. After one winner, it wants a larger stake. Both impulses destroy the only thing you can actually study: a fixed set of rules under a fixed risk percent.",
          "Twenty trades will not prove an edge. It will prove whether you can follow the rules you wrote. That is the first hurdle. Most people never clear it."
        ]
      },
      {
        heading: "What to write on each row",
        body: [
          "Date, session, market, stake, setup in one sentence, result, rule broken (yes/no), emotion in one word. If you cannot describe the setup in one sentence, you do not have a setup.",
          "The printable journal in the kit is just a table. You can photocopy it. You can ignore it. The people who ignore it usually also ignore the daily stop."
        ]
      },
      {
        heading: "Review only at the end",
        body: [
          "Count broken rules first, results second. If you broke the daily stop four times, the win rate is not the story.",
          "Download the journal from the kit after you open a demo through the partner link, or tick that you already did. I may earn a commission from that signup. The sample size rule does not care."
        ]
      }
    ]
  },
  {
    slug: "the-daily-stop-that-saves-accounts",
    title: "The Daily Stop That Actually Saves Accounts",
    description: "Write the daily loss limit before the session. Stop when it hits. That is the whole method.",
    date: "2026-08-24",
    sections: [
      {
        heading: "The rule is boring. That is why it works.",
        body: [
          "Pick a percent of the account you can lose today without needing to 'make it back' tonight. Two percent is a common ceiling. Write the dollar amount on paper or on the daily loss-limit card in the kit.",
          "When the number is hit, close the platform. Not after one more try. The extra try is how 2% becomes 8%."
        ]
      },
      {
        heading: "Make the remaining budget visible",
        body: [
          "The daily limiter on the tools page subtracts what you already lost from the cap. If remaining is smaller than the next planned stake, there is no next trade.",
          "This is not financial advice and it will not make a losing setup profitable. It only stops the day from becoming a hole you feel you must climb in the same sitting."
        ]
      }
    ]
  },
  {
    slug: "what-deriv-platforms-actually-are",
    title: "What Deriv Platforms Actually Are",
    description: "A plain map of MT5, Deriv Trader, Bot, and GO, including the part where availability depends on region.",
    date: "2026-08-24",
    sections: [
      {
        heading: "They are not one app",
        body: [
          "Deriv MT5 is a terminal many people use for CFDs on synthetics and other markets where the product is offered. Deriv Trader is the browser product for contracts and multipliers. Deriv Bot is a block-based automation workspace. Deriv GO is the mobile app. cTrader and TradingView appear in some setups and not others.",
          "Availability depends on your country, account type, and what Deriv currently offers. If a YouTube video shows a button you do not have, believe your account, not the video."
        ]
      },
      {
        heading: "Pick one surface for the 14-day plan",
        body: [
          "Learning four platforms in a week is how people confuse a UI tour with a process. Pick the surface you will actually open daily. Journal on that one.",
          "I am a Deriv partner. Links on this site can send you to signup and I may earn a commission. This article is still just a map. Check official product pages for current access."
        ]
      }
    ]
  },
  {
    slug: "introducing-brokers-paid-traffic",
    title: "What Introducing Brokers Need Before Sending Paid Traffic",
    description: "A checklist for IBs before buying ads: tracking, disclosure, risk copy, and a follow-up path.",
    date: "2026-07-15",
    sections: [
      {
        heading: "Paid traffic makes weak funnels expensive",
        body: [
          "A raw affiliate URL in an ad sends people into a broker site with no context. Some will register. Many will bounce, complain, or arrive already expecting guaranteed income because the ad implied it.",
          "Before you spend, you need a destination that explains who you are, that you may earn a commission, that trading can lose money, and which route (demo vs live vs partner) you want the click to take."
        ]
      },
      {
        heading: "Minimum stack",
        body: [
          "A tracking link you actually own. Risk and affiliate disclosure above the fold. A demo-first button. A way to ask a question (WhatsApp or email). A page that does not promise commissions, deposits, or trading profits.",
          "If you cannot say those things in public, you are not ready to buy the click."
        ]
      }
    ]
  },
  {
    slug: "affiliate-disclosure-trust-trading-funnels",
    title: "Affiliate Disclosure and Trust in Trading Funnels",
    description: "Why saying you get paid is better for conversion than hiding the relationship.",
    date: "2026-07-15",
    sections: [
      {
        heading: "Hiding the commission is a tell",
        body: [
          "Trading audiences already assume someone is getting paid. When the page pretends otherwise, the visitor fills in a worse story. A one-line disclosure is cheaper than that.",
          "This site says it in the header band, the footer, the kit page, and here: I may earn a commission if you register through my links."
        ]
      },
      {
        heading: "Disclosure filters the wrong leads",
        body: [
          "People who only wanted a secret income method leave. That is useful. The remaining visitor is closer to someone who can read a risk warning and still want a demo."
        ]
      }
    ]
  },
  {
    slug: "trading-content-funnel-no-fake-income-claims",
    title: "How to Build a Trading Content Funnel Without Making Fake Income Claims",
    description: "Teach, disclose, route, follow up. Skip the lifestyle screenshot.",
    date: "2026-07-15",
    sections: [
      {
        heading: "The funnel is a sequence, not a flex",
        body: [
          "Useful post → tool or checklist → risk page → demo route → optional conversation. That is the whole machine. Screenshots of cars and 'I turned $50 into $5,000' are not a step in it.",
          "If you cannot describe the next action without a profit promise, you do not have a funnel. You have bait."
        ]
      },
      {
        heading: "What I publish instead",
        body: [
          "Calculators, a journal, a 14-day demo plan, and articles about stops and sample size. If you want a Deriv account after that, the partner link is on the page. If you do not, keep the files."
        ]
      }
    ]
  }
];

export function getArticle(slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
