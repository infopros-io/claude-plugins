---
name: reel-editing
description: Edit talking-head videos into finished vertical reels with InfoPros OS, change finished reels from any plain request or screenshot, show them visually, and share them. Use when someone wants videos edited into reels or ads, sends video files, a folder or a Google Drive link to edit, asks to see, change, regenerate, approve or share a reel, or asks how their edits are going.
---

# Reel editing with InfoPros OS

The `infopros-os` tools do the editing on InfoPros OS. The people asking are not technical: never ask them for ids, settings or file paths, pick sensible defaults, and speak in plain words.

## New videos

- **Files you can read** (Claude Code, Cowork on their computer, Codex):
  1. Call `upload_files` with each file's name and exact size in bytes. `stat -c %s` on Linux, `stat -f %z` on macOS, or `(Get-Item f).Length` in PowerShell.
  2. Upload each file with `curl --fail -X PUT -H "Content-Type: <contentType>" -T "<path>" "<uploadUrl>"`.
  3. Call `finish_uploads` with every reel id.
- **Files attached to a Claude chat:** use the same flow from your sandbox when it can reach `*.t3.storageapi.dev`. If the upload is blocked, tell them to add that domain under Settings > Capabilities, or use `start_upload` instead.
- **Files you can't reach:** `start_upload` gives a link they open in their browser.
- **Drive link:** `import_from_drive`.
- **Style:** default to the house style. Use `style: "fun"` only when they ask for their brand's colors and fonts.
- **Batch:** keep the `batchId`. Each reel takes about 3 to 5 minutes.

## Showing reels

- **Seeing, browsing or checking reels:** use `show_reels`. It shows a grid of covers with status and progress, and tapping one opens it.
- **One reel:** use `show_reel` to show it with:
  - its player and versions;
  - the latest change as before and after;
  - its ad policy findings;
  - buttons to approve, share, go back or change it.

  Use it after a change finishes, too.
- **After either:** add one or two short sentences. Don't repeat what the page shows.
- **In text:** keep it phone friendly. Write one short line per reel (title, status, length, approved), with no tables.
- **Looking things up yourself:** `list_reels` and `get_reel`. Check progress about once a minute at most.

## Changing a reel

Any request goes to `change_reel`, in their words: "subtitles higher", "cut the part about pricing", "make it more visual", "use red", "bigger hook".

1. **Find the reel:** turn "the second one" or "the funding video" into a reel with `list_reels`.
2. **Their screenshot:** look at it and say in the request what it shows ("move the captions to about 30% from the top, where they circled"). Attach it when the picture says more than words.
3. **Where:** pass `atSeconds` when they mean a moment.
4. **"Regenerate", "redo" or "try again":** this is a `change_reel` saying what they didn't like, or "give it a new hook". Use `reedit_reel` only when they clearly want to start over from scratch.
5. **Many reels:** `change_reels` applies one request to several at once ("captions bigger on all of them").
6. **Afterwards:** a change takes 1 to 3 minutes and becomes a new version. Check `get_reel` and show the before and after. If the ad policy got worse, say so and offer `undo_change`, or a change that fixes the policy findings.

## Approving and sharing

- **`approve_reel`:** only when they say a reel is approved.
- **`share_reel`:** makes a link anyone can open. Make one only when they ask to share. `unshare_reel` switches it off.
