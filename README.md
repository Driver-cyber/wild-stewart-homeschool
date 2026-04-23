# Wild Stewart Homeschool

An iPad-friendly homeschool app for Lyle — covering Reading, Writing & Spelling, Math, Science, and Social Studies.

## Running

Just open `Homeschool App.html` in a browser. No build step, no server required.

For best results on iPad, add it to the home screen:
1. Open the app in Safari
2. Tap Share → Add to Home Screen

## Project structure

```
Homeschool App.html    # main entry — loads everything else
data.js                # curriculum content + subject config + CSV parser
App.jsx                # top-level router + state/localStorage
Dashboard.jsx          # home screen with 5 subject modules
Admin.jsx              # curriculum planning + CSV upload
Lessons.jsx            # all lesson type components
Celebration.jsx        # star confetti on lesson completion
```

## Lesson types

| Type | Subjects | What it does |
|---|---|---|
| `reading`          | Reading        | Digraph feature → word grid → one-sentence-at-a-time reader |
| `spelling`         | Writing        | Word jumble — tap scrambled letter tiles into slots |
| `math_place_value` | Math           | Ones/tens/hundreds with visual column breakdown + quiz |
| `math_stacked`     | Math           | Step-by-step two-digit addition/subtraction with carrying |
| `interactive`      | Science, Social Studies | YouTube video → fill-in-blank OR ordering → discussion |

## Adding lessons

Two options:

**Option 1 — edit `data.js` directly** (fastest for now)
Find the `SAMPLE_CURRICULUM` array and add an entry. See existing lessons for the content shape for each type.

**Option 2 — CSV upload** (from within the app)
Tap the gear icon → Upload CSV → drag in a file. Format:
```
id,subject,title,type,week,content
r010,reading,The WH Sound,reading,2026-W20,"{""sound"":""WH"",...}"
```

## Adding YouTube videos to Science/Social Studies

Open `data.js`, find the lesson (e.g. `sc001`), set:
```js
videoId: 'HgJ0RB_Bexc'  // the ID from a YouTube URL
```

## State

All progress (stars, completed lessons, curriculum edits, active week) is stored in `localStorage` under the `wsh_*` keys. To reset: open browser devtools → Application → Local Storage → clear.

## Roadmap

- [ ] Direct in-app lesson editing (no CSV needed)
- [ ] Month-view calendar for planning ahead
- [ ] Google Sheets sync via link
- [ ] Reward milestones in the dashboard (e.g. 10 stars, 25 stars)
