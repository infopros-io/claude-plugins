# Several videos, or recordings that aren't one video each

Part of the local editing SOP (`SKILL.md` in this folder). Step numbers refer to it.

## Map the videos

Use this when one recording holds several videos or retakes, or one video's takes are spread across files.

1. **Transcribe each whole recording once:** grade it first if it's log footage (step 4), then run `start` for each one in `infopros-edits/raw-<name>`, then step 6. Its takes, split at pauses, are in `infopros-edits/transcripts/<recording>-<id>/takes.json`.
2. **Map each video:** a video is its script, said start to finish.

   | Source | Map |
   |---|---|
   | One long recording | A video starts at a new hook or opening, a long pause, or "take two". The same lines said again are a retake of the same video. |
   | Takes across files | Join the parts that continue each other, in spoken order, each boundary in a real pause (step 4). |
   | A take that fits nowhere, an unclear order, or missing lines | Ask in one line for the scripts, then map against them. |

   Write the video's name into each take's `"ad"` in `takes.json`, or `"unused"` for a take left out.
3. **Plan:** one line per video, zero-padded, for example `Ad 01: talk.mp4 0:12 to 0:58`. The work folder is `infopros-edits/ad-01-<slug>` and the file is `Ad 01 - <Title>.mp4`. A video's source is one range of one recording, retakes and all, so the edit chooses every take change itself; `--part` ranges only where it truly spans files.

Done when every take has an `"ad"` and each video has its source: one range, or `--part` ranges whose boundaries sit in listed pauses.

## Edit in parallel

Use this when there are two or more videos and you can start subagents. Without subagents, edit them one after another, and answer the next video's asks while one renders.

1. **Do the shared work yourself, once:**
   - steps 1 to 4, with the key's credits checked for the whole batch;
   - `setup-cutout`, if the format needs it;
   - the mapping above;
   - `start` for every video, one after another, and step 6 for any take that isn't ready.

   Done when every `start` printed `"transcript": "ready (from saved transcripts)"`.
2. **Start helpers, at most 3 videos editing at once** on the computer (one helper per video, or one helper taking several in turn). Start the next video when one is delivered. Brief each with:

   > Follow `<skills>/local-editing/SKILL.md` steps 7 to 11 for `<work folders>`, one at a time. Format: `<skills>/local-reels/SKILL.md` (or local-long-form). Kit: `.infopros/render-kit/<v>`. Checks: `qa` as the SOP's rules say. Each transcript is in place; skip steps 1 to 6. Keep its limits (at most 2 renders on the computer, each long command in the background with a 30-minute limit, a printed summary or finished mp4 is success). Report for each video: file, length, hook, call to action, the gate's result (sound, words, picture) with any failure left, the join times to hear, and anything not fixed.
3. **Status:** before you report on a video, run `pgrep -af "[r]ender.mjs render"` and compare the mp4 and `edit.json` times.
4. **Reports:** step 12, one line per video. A later change to a video happens in its own work folder.
