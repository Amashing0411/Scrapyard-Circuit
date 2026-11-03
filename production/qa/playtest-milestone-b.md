# Milestone B Playtest

**The question from the sheet:** can testers explain why a part became unrepairable?
**Pass:** at least 4 of 5 testers explain it in their own words, without help.
**Time:** about 20 minutes per tester.

## Setup
1. Open the latest Vercel preview of `fix/custom-bot-balance-and-ui` (see the Vercel dashboard).
2. Use a fresh browser profile, so the tester starts a new career.
3. Say only: "Build your career and win some fights. Think out loud."
4. Don't explain repairs, Integrity or the Scrapworks. If asked, say "What do you think?"

## Let them play
Let the tester play until a part wears out (Integrity under 25) or 15 minutes pass. If no part has worn out by then, open the browser console and run:

```js
Object.assign(partStateFor('lead'), { condition: 20, integrity: 20 }); save();
```

Then reload the page and have them open the Repair Bay.

## Questions, in this order
1. "What's wrong with this part?"
2. "Why can't you repair it?"
3. "How did it get like that?"
4. "What would you do now?"
5. "What would you have done differently?"

## What to write down

| Tester | Explained why, unprompted? (Y/N) | Their words | What confused them | Used overhaul? | Used emergency help? |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |
| 3 | | | | | |
| 4 | | | | | |
| 5 | | | | | |

## Also watch for
- Do they find the Repair Bay and Scrapworks without help?
- Do they understand Condition and Integrity as two different things?
- Does repairing feel like a fair choice or a tax?
- Do they feel lost in the menus?
