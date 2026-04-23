# Working on Wild Stewart Homeschool

## First-time setup (one time only)

1. Download the zip from the chat, unzip it anywhere on your Mac/PC.
2. Open a terminal in that folder and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
3. Create an empty repo on GitHub (no README, no .gitignore — the project already has them).
4. Connect and push:
   ```bash
   git remote add origin https://github.com/<your-username>/wild-stewart-homeschool.git
   git branch -M main
   git push -u origin main
   ```

You're done — the project is on GitHub.

## Streamlining future changes with Claude

The smoothest loop is:

### Option A — Import the repo into Claude each chat (recommended)

1. Start a new chat in this project (or any Claude project).
2. Use **Import** → paste your GitHub repo URL.
3. Make changes by chatting with me.
4. When you're happy, ask: **"give me a zip of the current project"** — I'll hand you a download.
5. Replace the files in your local repo folder with the new ones, then:
   ```bash
   git add .
   git commit -m "Describe what changed"
   git push
   ```

### Option B — Ask Claude for a patch

Instead of a zip, ask: **"give me a git diff / patch file for these changes"** and I'll produce one you can apply with `git apply changes.patch`.

### Option C — Copy individual files

For tiny tweaks (one file changed), I can just paste the new contents of that file. You replace it locally, commit, push.

## Git cheat sheet

```bash
# see what changed
git status
git diff

# stage + commit + push
git add .
git commit -m "Add WH digraph lesson"
git push

# undo uncommitted changes on a file
git checkout -- path/to/file

# pull latest (if you work from multiple machines)
git pull
```

## What to commit vs skip

The included `.gitignore` already skips editor junk, OS files, and scratch folders. Everything that's part of the app itself — the HTML, the JSX files, `data.js`, `README.md` — should be committed.

Your curriculum edits made inside the app are saved to browser localStorage on the device, NOT into the code. If you want them backed up in the repo, edit `data.js` directly (or export your CSV and commit that).
