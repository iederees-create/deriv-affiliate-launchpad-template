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
