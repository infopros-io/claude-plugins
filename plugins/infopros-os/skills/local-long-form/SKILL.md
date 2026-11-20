---
name: local-long-form
description: Edit a talking-head take into a long-form 16:9 video (a sales, VSL, welcome or thank-you page video) entirely on the person's computer with InfoPros OS's editing code, with designed pages in the look of their website or screenshots. Use when they ask to edit a long-form or page video locally, on their computer or without uploading it, or have no InfoPros OS access, in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Long-form videos on their computer

Run the SOP in `../local-editing/SKILL.md`. This file holds what's specific to long form; step numbers refer to the SOP.

## Before step 4

Unless they've already said, ask in one line:
- what the video is for and what it sells (the offer, its price, who it's for);
- whether the pages should follow their website or screenshots of their brand.

Never invent any of it.

## Start flags (step 4)

- Always pass `--style long --notes "<what they told you>"`. The work folder is `infopros-edits/<name>-long`.
- **Their look:** `--look-website <url>`, `--look-screenshot <file>` (once per screenshot), `--look-request "<their words>"`, or `--brand <file>` (OS's BrandKit shape).
- If Python 3.10 or later is installed, run `node render.mjs setup-cutout` before step 6, so pages can stand the speaker on them.

## Transcript (step 5)

Whisper uses `--model small` (about 500 MB); a long take takes a few minutes. OS takes about a minute per 10 minutes of sound.

## Edit asks (step 6)

The edit asks for these, in order:
1. Where the face is, and what each still shows (in a few batches).
2. The look they asked for, when they gave one.
3. The plan: keep every phrase except false starts, flubs, abandoned takes and dead air; then the message and the call to action.
4. A listen to the cuts.
5. One or two read-throughs.
6. The script map and its pages: map every word into sections first, then plan pages from the map.
7. A look at stills of the finished edit.

When the check "Key moments shown" warns, give that moment a page with a change.

## Stills (step 7)

Check that:
- each page is readable and in their look;
- nothing covers the speaker's face;
- nothing is cut off.

## Render (step 9)

A render takes about as long as the video, and longer for a 4K take. `cutout: missing` means the speaker shows in a window instead: run `setup-cutout` and render again, or leave it that way.
