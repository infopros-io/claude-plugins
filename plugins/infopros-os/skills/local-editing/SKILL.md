---
name: local-editing
description: Where local editing starts: a reel or long-form video edited entirely on the person's computer, with you as the editor and InfoPros OS's own editing code and instructions; this skill also carries the render kit those edits run on. Use when they ask to edit locally or on their computer, have no InfoPros OS access, or the original can't be uploaded (too large, too slow, blocked), in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Local editing

A video is edited either entirely in OS (the video-editing skill: upload the original) or entirely on their computer (here). Never both: never upload a smaller copy for OS to edit and render it here.

Remote first: when they have OS, the original can go up and they didn't ask for local, edit it in OS. Use local when they ask for it, have no OS, or the upload can't work.

- **A reel** (9:16, for ads and Reels): the local-reels skill.
- **A long-form video** (16:9, for a sales, welcome or thank-you page): the local-long-form skill.

Both run the render kit in this skill's `kit` folder, installed into `.infopros/render-kit/<version>` in the current folder as their steps say. The only thing that may go to OS is the take's sound, to transcribe it, and only when OS is available.

**Everything stays in the current folder:** the kit and all it installs and downloads (Python environments, models, caches, temporary files) go in `.infopros/`, and each edit and its render in `infopros-edits/`. So the kit works inside an assistant's sandbox (Claude Code with its sandbox on, Codex), which lets commands write only in the project folder. What a sandbox still asks about is the downloads, the first time on a computer: `registry.npmjs.org` (Remotion), `remotion.media`, `storage.googleapis.com` and `playwright.azureedge.net` (its headless browser, about 100 MB), `pypi.org` and `files.pythonhosted.org` (Python packages), `huggingface.co` and its file hosts (the speech model), and `github.com` with `objects.githubusercontent.com` (the cutout model). Approve them when asked, or run that one command outside the sandbox if they can't be approved. Rendering also serves the original to the browser on a local address. If the folder is a git repository, add `.infopros/` and `infopros-edits/` to `.git/info/exclude` first.

The `kit` folder is built by OS (`scripts/build-render-kit.mjs`); don't edit it by hand.
