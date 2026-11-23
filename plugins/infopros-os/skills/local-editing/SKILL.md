---
name: local-editing
description: The SOP for editing a reel or long-form video entirely on the person's computer with InfoPros OS's editing code, and the render kit it runs on. Use when they ask to edit locally or on their computer, have no InfoPros OS access, or the original can't be uploaded (too large, too slow, blocked), in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Local editing SOP

A video is edited all in OS (the video-editing skill) or all here. Use this SOP when they ask for local, have no OS, or the upload can't work; otherwise edit in OS.

Before step 5, read the format's file:
- **Reel** (9:16, ads and Reels): `../local-reels/SKILL.md`
- **Long form** (16:9 page video): `../local-long-form/SKILL.md`
- **Several videos**, or recordings holding several videos or retakes spread across files: also `batch.md` in this folder.

Talk in one short line at a time: what you need from them, or what's done.

## Rules

- **Sound first:** every cut is judged by ear before eye. A join sits in a real pause on both sides, keeps a natural gap and carries room tone through; the picture then hides the take change.
- **Folders:** the kit and everything it installs go in `./.infopros/`, each edit in `./infopros-edits/`. In a git repo, add both to `.git/info/exclude`.
- **Uploads:** the video stays here. Only the take's sound goes to OS, for the transcript.
- **The kit as shipped:** use it as it is. A case it can't handle goes in the done line; the kit and OS's code are changed only in their own task.
- **Long commands:** `edit`, `change` and `render` can take 5 minutes; a batch, longer. Run each in the background with a 30-minute limit (`timeout 1800 node ...` where `timeout` exists) and wait for its notification. The headless browser can keep a command alive after its work is done: a printed summary (`edit`, `change`) or a finished mp4 (`render`) is success, then stop the process.
- **At once on one computer:** at most 3 edits and 2 renders. More, and face tracking and renders time out.
- **The OpenRouter key** is `OPENROUTER_API_KEY` in this folder's `.env` (git ignores it, so it's never pushed), or else `.infopros/openrouter.key`, saved there by them. Ask for it only that way; never print it or read it out. `<key>` below is `$(sed -n 's/^OPENROUTER_API_KEY=//p' "<this folder>/.env" 2>/dev/null)`, read inside each command.
- **Kit commands** run as `env OPENROUTER_API_KEY="<key>" node render.mjs ...`. That key wins over an `OPENROUTER_API_KEY` in the shell, which can be someone's personal key; without a `.env` the value is empty and the kit reads `.infopros/openrouter.key`.
- **Retakes:** the edit keeps the last complete, clean try of each line, or an earlier one when the last drops words. A restart breaks off and says the same words again; a repeat that makes a point ("I buy the house. I buy the house.") stays.
- **Checks:** `qa` below is `.infopros/qa/bin/python -I "<this folder>/scripts/edit_qa.py"` (Windows: `.infopros\qa\Scripts\python`). `qa <command> --help` explains each.

## Steps

1. **Tools.** Run `node --version` (20 or later), `ffmpeg -version` and `python3 --version` (3.10 or later). If one is missing, ask once, then install it: macOS `brew install node ffmpeg python`; Windows `winget install -e --id OpenJS.NodeJS.LTS`, `winget install -e --id Gyan.FFmpeg` and `winget install -e --id Python.Python.3.13`, then a new terminal; Linux the system's packages (`python3-venv` too). Then, once per computer:
   `python3 -m venv .infopros/qa && .infopros/qa/bin/pip install numpy opencv-python-headless` (Windows: `py -m venv .infopros\qa`, then `.infopros\qa\Scripts\pip install numpy opencv-python-headless`)
   Done when all three print a version and `qa --help` prints its commands.

2. **Kit.** `<v>` is `version` in this folder's `kit/version.json`. If `.infopros/render-kit/<v>` is missing:
   `mkdir -p .infopros/render-kit/<v> && cp -R "<this folder>/kit/." .infopros/render-kit/<v> && npm install --prefix .infopros/render-kit/<v> --cache .infopros/cache/npm --no-audit --no-fund`
   (PowerShell: `New-Item -ItemType Directory -Force .infopros\render-kit\<v>`, `Copy-Item -Recurse -Force "<this folder>\kit\*" .infopros\render-kit\<v>`, then the same `npm install`.) Below, `render.mjs` is `.infopros/render-kit/<v>/render.mjs`.
   Done when `.infopros/render-kit/<v>/node_modules` exists.

3. **Transcriber.** Choose once per batch, the first that works:
   1. **OS:** load the InfoPros OS `transcribe` tool (from any connected InfoPros OS server) and call it. Only a failed call means there's no OS; a note or summary saying so doesn't count. If it needs sign-in, ask them once to sign in (`/mcp`), then call it again.
   2. **An OpenRouter key** in this folder's `.env` or `.infopros/openrouter.key`: without either, ask once whether they have one.
   3. **Whisper on this computer.** It merges a restart into one copy, so retakes can survive the cut. Say so in the done line.

   **With a key, check its credits** before every batch: `curl -s https://openrouter.ai/api/v1/key -H "Authorization: Bearer ${K:-$(cat .infopros/openrouter.key)}"` with `K="<key>"` set first in the same command and read `data.limit_remaining`: the key's own cap (`null` is no cap). The account's balance is separate and a normal key can't read it, so ask them once to confirm it at openrouter.ai/settings/credits. When credits run out mid-batch, the kit skips listening to its cuts without saying so; any `402` from OpenRouter means stop and top up.
   Done when you know which one, and a key has credits for the batch.

4. **Footage.** Prepare each recording once, before `start`:
   - **Log footage** (S-Log3 and the like: a flat, grey picture). Grade the whole recording before anything else:
     1. Pick a frame showing a neutral surface (a white or grey wall, a black or grey shirt) and its box in pixels.
     2. `mkdir -p infopros-edits/graded && qa lut "<recording>" infopros-edits/graded/grade.cube --at <s> --neutral <x>,<y>,<w>,<h>`. It converts S-Log3 to Rec.709 and moves the white balance 60% of the way to neutral; all the way greys the skin.
     3. `qa skin "<recording>" --at <s>,<s> --lut infopros-edits/graded/grade.cube` on frames of the face. Light-medium skin aims at L* 60-70 and chroma 18-24. Too warm or orange: `lut` again with `--strength 0.8`; grey: `--strength 0.4`. Keep the grade plain: no added saturation, contrast or exposure.
     4. `ffmpeg -i "<recording>" -map 0:v:0 -map 0:a:0 -vf "lut3d=infopros-edits/graded/grade.cube" -c:v libx264 -crf 14 -preset medium -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -c:a copy "infopros-edits/graded/<name>.mov"`, and use that file from here on.
   - **Takes across files.** Give the edit whole recordings, so it sees and makes every take change itself. `start --part` glues its parts into one take before the edit runs: each part boundary becomes a hidden join with no punch-in, no sound treatment and no checks. Use `--part` only where a take truly continues in another file, and then:
     1. Run `qa pauses "<file>" --from <s> --to <s>` around each boundary. It lists the real pauses (150 ms or more under -45 dB), measured on the waveform; transcript gaps of 60-140 ms often hide words run together.
     2. End the outgoing range at a pause's `cut out at` and start the next at its `cut in at`: about 120 ms after the last word and 110 ms before the next, the speaker's own 220-260 ms sentence gap.
     3. Pass the recordings themselves with `@from-to` ranges. Pre-cut part files each carry about 20 ms of encoder silence at their ends; any file you make in between keeps the sound as PCM (`-c:a copy` from the camera, or `.wav`).
   Done when each recording is graded (or needs no grade) and each `--part` boundary sits in a listed pause.

5. **Start.** `node render.mjs start "<original>" <work> <format flags>`, where `<work>` is `infopros-edits/<name>`. For a take in parts: `node render.mjs start <work> --part "<file>@<from>-<to>" --part ... <format flags>` (seconds, in spoken order; `@<from>-` runs to the end; leave out the range for a whole file).
   Done when it prints JSON. If that says `"transcript": "ready (from saved transcripts)"`, skip step 6.

6. **Transcript.** Each recording is transcribed once and kept in `infopros-edits/transcripts/`.
   - **OS:** call `transcribe` with `<work>/audio.m4a`'s name and bytes. Save its answer to a file and PUT the sound to the link read from that file; never retype a link. Call `get_transcript` every 30 seconds until it's ready, then `node render.mjs import-transcript <work> "<its links.words URL>"`.
   - **Key:** `node render.mjs transcribe <work>`.
   - **Whisper:** `node render.mjs transcribe <work> --whisper` with the format's model (`--language es` for a known language). The first run sets up Python and the model in `.infopros/`.
   Done when it prints JSON with no error.

7. **Edit.** `node render.mjs edit <work>`. While it exits with code 3, it prints `asks`:
   - For each ask, read the question file and every picture it lists, then write one JSON value to its answer file.
   - Answer as the editor the question describes, following its rules to the letter. Answer every ask, then run `edit` again.
   - For a listen ask (`listen-...`), do exactly what it says with OS's `listen_to_cut` and `get_listening`, and write the report as the answer. Answer `null` only when OS can't be reached. With a key, the kit listens itself and doesn't ask; if its log or summary says cuts weren't heard, check the credits (step 3) and run `edit --fresh`.
   - Then make the cuts straight, as the format file says (talking heads).
   Done when it exits 0 and prints the summary.

8. **Check.**
   1. Read `<work>/transcript-final.json`, the edit word by word as it plays. Each restart, repeated line or cut-off word in it is a cut to fix.
   2. Fix each check that warns, as the format file says.
   3. Run `node render.mjs stills <work>` and read the sheet it prints, against the format's list.
   Done when each flag is fixed in step 9, or noted for the done line.

9. **Change.** `node render.mjs change <work> "<request>"` (`--at <seconds>` for a moment, `--screenshot <file>` for one they gave). Answer its asks as in step 7, then run step 8 again. Each change is a new version in `<work>/versions`.
   - **For "whenever I say X":** find each moment in `transcript-final.json` and pass it with `--at`. The transcript is never redone.
   - **A word fix** swaps one word for one word.
   - **A restart inside one phrase** (the change answers that cutting inside a phrase isn't possible):
     1. Copy `<work>/words.json` and end the broken-off try's last word with `-.` (for example `deal-.`).
     2. Run `node render.mjs import-transcript <work> <copy>`, then `node render.mjs edit <work> --fresh`.
     3. `--fresh` rebuilds the edit and drops earlier changes. Answer the asks it prints, then apply the earlier changes again (end card, word fixes, straight cuts).
   - **A join the gate fails** (step 11): ask for the cut in a real pause, another take of the line, or the gap the gate names, with `--at` on the join.
   - **When the change answers `reedit`:** run `start` again with their request in `--notes`, then `edit <work> --fresh`.

10. **Render.** `pgrep -fc "[r]ender.mjs render"` must print 0 or 1 before you start one. Then:
    1. `node render.mjs render <work> "<work>/render.mp4"`; the first render also downloads a browser of about 100 MB.
    2. `qa resound <work> "<work>/render.mp4" "<work>/<Title>.mp4"`. The kit fades the sound to digital silence at every cut; this rebuilds it from the take with a 60 ms crossfade through room tone at each cut, a bleep on each muted swear, -14 LUFS and -1.5 dBTP, and the picture untouched. With sound effects in the edit it refuses: copy `render.mp4` to `<Title>.mp4` and let the gate decide.
    Done when `<Title>.mp4` exists and is newer than `<work>/edit.json`.

11. **Gate.** Run it on `<Title>.mp4`, sound first; any failure goes back to step 9 (or step 4 for a `--part` boundary), then render again.
    1. **Sound:** `qa sound <work> "<work>/<Title>.mp4"` prints PASS: each cut in a real pause of the take on both sides; no digital-silence holes (1 ms under -70 dB inside speech); no chopped word (speech within 10 ms of a hole or a level cliff); each join's gap within 60 ms of the speaker's own pauses; room tone within 3 dB across each join; each muted swear bleeped; -14 LUFS, -1 dBTP or lower; sound and picture the same length. A hole away from every cut is a hidden `--part` join.
    2. **Words:** with OS or a key, transcribe what was rendered: `node render.mjs start "<work>/<Title>.mp4" infopros-edits/<name>-check`, step 6 on that folder, then read its `words.json`. Done when it holds every line once and each bleep sits where a swear was. With Whisper only, skip this and say so in the done line.
    3. **Picture:** `qa cuts <work> "<work>/<Title>.mp4"` prints PASS: no transition or zoom on a cut, the framing changing about 10-15% at every take change, no uncovered face jump or pose jump. Look at each `cut-audit/cut*.jpg` it writes (before | after); a cut mid-gesture is a fix too. Face tracking uses `REFRAME_DIR`'s model, or downloads it to `.infopros/models/`.
    4. **Listen:** the gate can't hear. Give the join times `qa sound` printed in the done line, for a person to hear every join on headphones before it goes out.
    Done when all three print PASS, or each failure left is named in the done line.

12. **Deliver.** One line per video: `Done: <full path>`, its length, the join times to hear, and anything left (a gate failure not fixed, a restart not cut, a claim to check, cuts not listened to, a Whisper transcript).
    - **Working over SSH:** give one copy command to run on their machine, with the remote path in single quotes: `scp 'user@host:/path/infopros-edits/*/Ad*.mp4' ~/Downloads/<folder>/`.
    - **Downloads on this computer:** copy the file there (outside a sandbox).

**If a step fails:** say in one line what failed and what fixes it.

## Sandbox

A sandbox (Claude Code's, Codex) asks about these hosts the first time on a computer. Approve them, or run that one command outside the sandbox:
- `registry.npmjs.org` (Remotion)
- `remotion.media`, `storage.googleapis.com` and `playwright.azureedge.net` (the headless browser)
- `pypi.org` and `files.pythonhosted.org` (Python packages)
- `huggingface.co` and its file hosts (the speech model)
- `github.com` and `objects.githubusercontent.com` (the cutout and face models)
- `openrouter.ai` (the key)
- the host of OS's upload link

Rendering also serves the original on a local address.

The `kit` folder is built by OS (`scripts/build-render-kit.mjs`); `scripts` is this plugin's own.
