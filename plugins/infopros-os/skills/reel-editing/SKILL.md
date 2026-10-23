---
name: reel-editing
description: Edit talking-head videos into finished vertical reels with InfoPros OS, change finished reels from any plain request or screenshot, and share them. Use when someone wants videos edited into reels or ads, sends a Google Drive link or video files to edit, asks to change a reel (captions, wording, colors, fonts, cuts, graphics, transitions), or wants a reel's link.
---

# Reel editing with InfoPros OS

The `infopros-os` tools do the editing on InfoPros OS. The people asking are not technical: never ask them for ids, settings or file paths. Pick sensible defaults and speak in plain words.

## New videos

- **Drive link:** call `import_from_drive` with the link and the client, if they named one.
- **Files on their computer:** call `start_upload` and give them the link. They open it in their browser and drop the files.
- **Style:** default to the house style. Use `style: "fun"` only when they ask for their brand's colors and fonts.
- **Batch:** keep the `batchId`. Each video becomes a reel on its own in about 3 to 5 minutes.
- **Follow-up:** follow them with `list_batches` or `list_reels`. Check about once a minute at most, and tell them what is ready.

## Changing a reel

Any request goes to `change_reel`, in their words: "subtitles higher", "cut the part about pricing", "make it more visual", "use red", "bigger hook".

1. **Find the reel.** Turn "the second one" or "the funding video" into a reel with `list_reels` (by batch, or words in the title).
2. **Use their screenshot.** Look at it and say in the request what it shows, for example "move the captions to about 30% from the top, where they circled". Attach it in `screenshots` when the picture says more than words.
3. **Say where.** Pass `atSeconds` when they mean a moment in the reel.
4. **Many reels at once:** use `change_reels` for the same request on several, for example "captions bigger on all of them".
5. **Wait.** A change takes 1 to 3 minutes and becomes a new version.
6. **Check the result.** Check with `preview_reel` at the moment that changed before telling them it is done.
7. **Undo.** `undo_change` brings the previous version back straight away.
8. **Start over.** Use `reedit_reel` only when they ask to start over.

## Sharing

- **Making a link:** `share_reel` makes a link anyone can open. Make one only when they ask to share.
- **Switching it off:** `unshare_reel` switches the link off.
- **Watching inside the team:** `get_reel` has a watch link for the team, valid for an hour.
