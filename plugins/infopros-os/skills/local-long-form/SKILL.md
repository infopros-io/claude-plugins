---
name: local-long-form
description: Edit a talking-head take into a long-form 16:9 video (a sales, VSL, welcome or thank-you page video) entirely on the person's computer, with you as the editor and the InfoPros OS editor's own code and instructions: the cut, the script map, the designed pages, the look of a website or screenshots they give, checks, changes and the full-quality render. Nothing goes up but the take's sound for the transcript, and not even that when OS can't be reached. Use when they ask to edit a long-form or page video locally, on their computer, or without uploading it, or when they have no InfoPros OS access, in Claude Code, the Code tab in Claude Desktop, or Codex. Reels edited locally use the local-reels skill.
---

# Long-form videos on their computer

Remote first: when they have OS, the original can go up and they didn't ask for local, edit it in OS (the video-editing skill). Use this when they ask for local, have no OS, or the upload can't work.

Talk to them in one short line at a time: what you need from them, or what's done. No explanations.

You are the editor. The kit runs OS's whole edit and asks you every question OS asks its models, with OS's own rules. Answer each one as the editor it describes, following its rules to the letter; your answers are the edit.

**Everything stays in the current folder:** the kit and all it installs and downloads (Python environments, models, caches, temporary files) go in `.infopros/`, and each edit and its render in `infopros-edits/`. So the kit works inside an assistant's sandbox (Claude Code with its sandbox on, Codex), which lets commands write only in the project folder. What a sandbox still asks about is the downloads, the first time on a computer: `registry.npmjs.org` (Remotion), `remotion.media`, `storage.googleapis.com` and `playwright.azureedge.net` (its headless browser, about 100 MB), `pypi.org` and `files.pythonhosted.org` (Python packages), `huggingface.co` and its file hosts (the speech model), and `github.com` with `objects.githubusercontent.com` (the cutout model). Approve them when asked, or run that one command outside the sandbox if they can't be approved. Rendering also serves the original to the browser on a local address. If the folder is a git repository, add `.infopros/` and `infopros-edits/` to `.git/info/exclude` first.

## When the recordings aren't one video each

Sometimes one long recording holds several page videos and their retakes, or one video's takes are spread across several recordings. Work out the videos before editing:

1. **Transcribe every recording** (step 5 of the steps below, in its own work folder per recording, `infopros-edits/raw-<name>`). Each recording's transcript is kept, split into takes at its pauses, in `infopros-edits/transcripts/<recording>-<id>/` (`words.json`, `takes.json`, `about.json`).
2. **Map the videos from the transcripts:** each video is the script it says, start to finish. In one long recording, find where each starts and ends (a new opening, a pause, "take two", the same lines again for a retake). Across recordings, put together the parts that continue each other, in the order they're said; a retake of the same lines belongs to the same video. Write which video each take is into `"ad"` in its recording's `takes.json` (the video's name, or `"unused"` for a take you leave out), so a later request can pick up a take left out without transcribing again.
3. **When something doesn't fit** (a part that matches no video, an order you can't tell, a video that seems to be missing lines), ask in one line for the scripts, and map against them.
4. **Say the plan in one line per video** ("Sales video: talk.mp4 from 0:12 to 9:40"), then make each video's take as below.

## Several videos at once

When there are two or more videos to edit and you can start subagents (Claude Code's Agent tool, or your client's equivalent), edit them in parallel:

1. **Do the shared work yourself first, once:** the tools and the kit (steps 1 and 2), the speaker cutout's setup when it's needed (`setup-cutout`), and, when the recordings aren't one video each, the mapping of the videos above, with the take for each. When OS can't transcribe, start each video's work folder and transcribe it on this computer yourself too, one after another (step 5; the first run sets up the speech model, which two at once would fight over); then each subagent's `start` finds its words in the saved transcripts and skips the transcript. Every recording is transcribed once, whoever edits from it.
2. **Start one subagent per video**, all at once. Tell each one: follow this skill (the local-long-form skill) from the start step for this one video; its original or `--part` list, its work folder (`infopros-edits/<name>`, its own), the settings and notes; the kit is already installed at `.infopros/render-kit/<v>`, so skip steps 1 and 2; answer every question the edit asks itself, by its rules; get the transcript as the skill says; check the stills; render; and report back the file, its length, the hook, the call to action and any check that warns.
3. **Rendering is heavy:** each render uses about half the computer's cores, so at most two render at the same time. Tell the subagents to edit freely but take turns rendering: render only when fewer than two `render.mjs render` are running (check the running processes), else wait a minute and check again.
4. **When they report back,** tell the person in one line per video: `Done: <file>`, and anything that warns. A change to one video is that video's own (`change` in its work folder), by you or a subagent.

Without subagents, edit them one after another, and while one renders, answer the next one's questions.

## Steps

1. **Tools:** `node --version` (20 or later) and `ffmpeg -version`. Install what's missing, after one line asking: macOS `brew install node ffmpeg`; Windows `winget install -e --id OpenJS.NodeJS.LTS` and `winget install -e --id Gyan.FFmpeg`, then a new terminal; Linux the system's packages.
2. **Kit:** the kit is in the local-editing skill's `kit` folder, next to this skill's folder (`../local-editing/kit`). Read its `version.json`; its `version` is `<v>`. If `.infopros/render-kit/<v>` is missing in the current folder, copy the kit there and install Remotion, with npm's cache there too: `mkdir -p .infopros/render-kit/<v> && cp -R "<kit folder>/." .infopros/render-kit/<v> && npm install --prefix .infopros/render-kit/<v> --cache .infopros/cache/npm --no-audit --no-fund` (PowerShell: `New-Item -ItemType Directory -Force .infopros\render-kit\<v>`, `Copy-Item -Recurse -Force "<kit folder>\*" .infopros\render-kit\<v>`, then the same `npm install`). Below, `render.mjs` is `.infopros/render-kit/<v>/render.mjs` and `<work>` is `infopros-edits/<take name>-long`.
3. **What it's for:** ask in one line, unless they said: what the video is for and what it sells (the offer, its price, who it's for), and whether the pages should follow their website or screenshots of their brand. Never invent any of it.
4. **Start:** `node render.mjs start "<original>" <work> --style long --notes "<what they told you>"`, or for a video made of parts of recordings `node render.mjs start <work> --part "<file>@<from>-<to>" --part ... --style long --notes "..."` (seconds; in order), which joins them into one take. To follow their look, add `--look-website <url>`, `--look-screenshot <file>` (once per screenshot) and `--look-request "<their words>"`. A brand file in OS's BrandKit shape goes in with `--brand <file>`. It writes the take's sound to `<work>/audio.m4a`.
5. **Transcript:** never twice. When `start` printed `"transcript": "ready (from saved transcripts)"`, every recording of the take was transcribed before and its words are in place: skip this step. Else OS first, else on this computer; either way the recording's transcript is kept in `infopros-edits/transcripts` for next time.
   - **OS:** `transcribe` with `audio.m4a`'s name and bytes, PUT it as the tool says, `get_transcript` about every 30 seconds until ready (about a minute per 10 minutes of sound), then `node render.mjs import-transcript <work> "<its links.words URL>"`.
   - **On this computer**, when the OS tools aren't there, aren't signed in or fail: `node render.mjs transcribe <work> --model small` (`--language es` for a known language). The first time it sets up a Python environment and a speech model of about 500 MB (in `.infopros/`); it needs Python 3.10 or later (macOS `brew install python`, Windows `winget install -e --id Python.Python.3.13` then a new terminal, Linux the system's `python3` and `python3-venv`). A long take takes a few minutes.
6. **Edit:** `node render.mjs edit <work>`. While it exits with code 3 it prints `asks`: for each, read the question file and look at every picture it lists, write exactly one JSON value answering it to its answer file, then run `edit` again. It asks, in order:
   - where the speaker's face is, and what each still shows over the footage (a few batches);
   - the look they asked for, when they gave one;
   - the plan: which phrases to keep (cut only false starts, flubs, abandoned takes and dead air), the message, the call to action;
   - one or two read-throughs of the cut;
   - the script map and the pages: map every word into sections first, then plan pages from the map, as its rules say;
   - a look at stills of the finished edit.
   When done it prints the length, the script as cut, each page with its time and layout, and the checks. If they warn "Key moments shown", give that moment a page with a change (step 9).
7. **Look:** Read `<work>/transcript-final.json` first: the edit as it plays, word by word; a restart, a repeated line or a cut-off word in it is a cut to fix with a change. Then `node render.mjs stills <work>` and read the sheet it prints: each page readable, nothing over the speaker's face, nothing cut off, the pages in their look. Fix anything wrong with step 9, then look again.
8. **Render:** `node render.mjs render <work> <work>/"<title>.mp4"`. About as long as the video, more for a 4K take; the first time it also downloads a browser of about 100 MB. If it prints `cutout: missing` (a page the speaker stands on), run `node render.mjs setup-cutout` once on this computer (Python 3.10 or later) and render again, or leave it: the speaker then shows in a window. A long video may stand the speaker on one page: when Python is there, run `setup-cutout` before step 6 instead, so the look at the finished edit sees what will render. Tell them `Done: <file>` with its full path; if they want it in Downloads, copy it there (outside a sandbox, which can't write there).
9. **Changes:** For a request tied to what is said ("whenever I say X, show Y"), find the moments in `<work>/transcript-final.json` (each word of the edit with its time as it plays) and give each with `--at`, without transcribing again. `node render.mjs change <work> "<their words>"` (`--at <seconds>` for the moment they point at, `--screenshot <file>` for a screenshot they gave). Answer its question as in step 6, then steps 7 and 8. Each change is a new version in `<work>/versions`. When it answers `reedit`, they want it done again: `start` with their request in `--notes`, then `edit <work> --fresh`.

This video isn't in OS. It doesn't get OS's listening pass on the cuts; mention it in one line only if a cut sounds wrong when they watch it.

**If a step fails:** one line with what failed and what fixes it.

The kit is built by OS (`scripts/build-render-kit.mjs`); don't edit it by hand.
