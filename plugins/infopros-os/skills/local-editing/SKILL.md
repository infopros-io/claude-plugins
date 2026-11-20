---
name: local-editing
description: The SOP for editing a reel or long-form video entirely on the person's computer with InfoPros OS's editing code, and the render kit it runs on. Use when they ask to edit locally or on their computer, have no InfoPros OS access, or the original can't be uploaded (too large, too slow, blocked), in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Local editing SOP

A video is edited all in OS (the video-editing skill) or all here. Use this SOP when they ask for local, have no OS, or the upload can't work; otherwise edit in OS.

Before step 4, read the format's file:
- **Reel** (9:16, ads and Reels): `../local-reels/SKILL.md`
- **Long form** (16:9 page video): `../local-long-form/SKILL.md`
- **Several videos**, or recordings holding several videos or retakes spread across files: also `batch.md` in this folder.

Talk in one short line at a time: what you need from them, or what's done.

## Rules

- **Folders:** the kit and everything it installs go in `./.infopros/`, each edit in `./infopros-edits/`. In a git repo, add both to `.git/info/exclude`.
- **Uploads:** the video stays here. Only the take's sound goes to OS, for the transcript.
- **The kit as shipped:** use it as it is. A case it can't handle goes in the done line; the kit and OS's code are changed only in their own task.
- **Long commands:** `edit`, `change` and `render` can take 5 minutes. Run them without a timeout, in the background, and wait for their notification.
- **The OpenRouter key** lives in `.infopros/openrouter.key`, saved there by them. Ask for it only that way; never print it or read it out.
- **Retakes:** the edit keeps the last complete, clean try of each line, or an earlier one when the last drops words. A restart breaks off and says the same words again; a repeat that makes a point ("I buy the house. I buy the house.") stays.

## Steps

1. **Tools.** Run `node --version` (20 or later) and `ffmpeg -version`. If either is missing, ask once, then install it: macOS `brew install node ffmpeg`; Windows `winget install -e --id OpenJS.NodeJS.LTS` and `winget install -e --id Gyan.FFmpeg`, then a new terminal; Linux the system's packages.
   Done when both print a version.

2. **Kit.** `<v>` is `version` in this folder's `kit/version.json`. If `.infopros/render-kit/<v>` is missing:
   `mkdir -p .infopros/render-kit/<v> && cp -R "<this folder>/kit/." .infopros/render-kit/<v> && npm install --prefix .infopros/render-kit/<v> --cache .infopros/cache/npm --no-audit --no-fund`
   (PowerShell: `New-Item -ItemType Directory -Force .infopros\render-kit\<v>`, `Copy-Item -Recurse -Force "<this folder>\kit\*" .infopros\render-kit\<v>`, then the same `npm install`.) Below, `render.mjs` is `.infopros/render-kit/<v>/render.mjs`.
   Done when `.infopros/render-kit/<v>/node_modules` exists.

3. **Transcriber.** Choose once per batch, the first that works:
   1. **OS:** load the InfoPros OS `transcribe` tool (from any connected InfoPros OS server) and call it. Only a failed call means there's no OS; a note or summary saying so doesn't count. If it needs sign-in, ask them once to sign in (`/mcp`), then call it again.
   2. **Their OpenRouter key** in `.infopros/openrouter.key`: ask once whether they have one.
   3. **Whisper on this computer.** It merges a restart into one copy, so retakes can survive the cut. Say so in the done line.
   Done when you know which one.

4. **Start.** `node render.mjs start "<original>" <work> <format flags>`, where `<work>` is `infopros-edits/<name>`. For a take made of parts: `node render.mjs start <work> --part "<file>@<from>-<to>" --part ... <format flags>` (seconds, in spoken order; `@<from>-` runs to the end; leave out the range for a whole file).
   Done when it prints JSON. If that says `"transcript": "ready (from saved transcripts)"`, skip step 5.

5. **Transcript.** Each recording is transcribed once and kept in `infopros-edits/transcripts/`.
   - **OS:** call `transcribe` with `<work>/audio.m4a`'s name and bytes. Save its answer to a file and PUT the sound to the link read from that file; never retype a link. Call `get_transcript` every 30 seconds until it's ready, then `node render.mjs import-transcript <work> "<its links.words URL>"`.
   - **Key:** `node render.mjs transcribe <work>`.
   - **Whisper:** `node render.mjs transcribe <work> --whisper` with the format's model (`--language es` for a known language). The first run sets up Python and the model in `.infopros/`. It needs Python 3.10 or later: macOS `brew install python`; Windows `winget install -e --id Python.Python.3.13`, then a new terminal; Linux `python3` and `python3-venv`.
   Done when it prints JSON with no error.

6. **Edit.** `node render.mjs edit <work>`. While it exits with code 3, it prints `asks`:
   - For each ask, read the question file and every picture it lists, then write one JSON value to its answer file.
   - Answer as the editor the question describes, following its rules to the letter. Answer every ask, then run `edit` again.
   - For a listen ask (`listen-...`), do exactly what it says with OS's `listen_to_cut` and `get_listening`, and write the report as the answer. Answer `null` only when OS can't be reached. With a key, the kit listens itself and doesn't ask.
   Done when it exits 0 and prints the summary.

7. **Check.**
   1. Read `<work>/transcript-final.json`, the edit word by word as it plays. Each restart, repeated line or cut-off word in it is a cut to fix.
   2. Fix each check that warns, as the format file says.
   3. Run `node render.mjs stills <work>` and read the sheet it prints, against the format's list.
   Done when each flag is fixed in step 8, or noted for the done line.

8. **Change.** `node render.mjs change <work> "<request>"` (`--at <seconds>` for a moment, `--screenshot <file>` for one they gave). Answer its asks as in step 6, then run step 7 again. Each change is a new version in `<work>/versions`.
   - **For "whenever I say X":** find each moment in `transcript-final.json` and pass it with `--at`. The transcript is never redone.
   - **A word fix** swaps one word for one word.
   - **A restart inside one phrase** (the change answers that cutting inside a phrase isn't possible):
     1. Copy `<work>/words.json` and end the broken-off try's last word with `-.` (for example `deal-.`).
     2. Run `node render.mjs import-transcript <work> <copy>`, then `node render.mjs edit <work> --fresh`.
     3. `--fresh` rebuilds the edit and drops earlier changes. Answer the asks it prints, then apply the earlier changes again (end card, word fixes).
   - **When the change answers `reedit`:** run `start` again with their request in `--notes`, then `edit <work> --fresh`.

9. **Render.** At most two renders run at once on a computer. `pgrep -fc "[r]ender.mjs render"` must print 0 or 1 before you start one. Then run `node render.mjs render <work> "<work>/<Title>.mp4"`; the first render also downloads a browser of about 100 MB.
   Done when the mp4 exists and is newer than `<work>/edit.json`.

10. **Check the sound.** With OS or a key, transcribe what was rendered:
    1. `node render.mjs start "<work>/<Title>.mp4" infopros-edits/<name>-check`
    2. Run step 5 on that folder, then read its `words.json`.
    3. A restart or cut-off word that plays is a fix: go back to step 8, then render again.
    With Whisper only, skip this step and say so in the done line.
    Done when the rendered words hold every line once.

11. **Deliver.** One line per video: `Done: <full path>`, its length, and anything left (a restart not cut, a claim to check, cuts not listened to, a Whisper transcript).
    - **Working over SSH:** give one copy command to run on their machine, with the remote path in single quotes: `scp 'user@host:/path/infopros-edits/*/Ad*.mp4' ~/Downloads/<folder>/`.
    - **Downloads on this computer:** copy the file there (outside a sandbox).

**If a step fails:** say in one line what failed and what fixes it.

## Sandbox

A sandbox (Claude Code's, Codex) asks about these hosts the first time on a computer. Approve them, or run that one command outside the sandbox:
- `registry.npmjs.org` (Remotion)
- `remotion.media`, `storage.googleapis.com` and `playwright.azureedge.net` (the headless browser)
- `pypi.org` and `files.pythonhosted.org` (Python packages)
- `huggingface.co` and its file hosts (the speech model)
- `github.com` and `objects.githubusercontent.com` (the cutout model)
- `openrouter.ai` (the key)
- the host of OS's upload link

Rendering also serves the original on a local address.

The `kit` folder is built by OS (`scripts/build-render-kit.mjs`).
