---
name: reel-editing
description: Edit talking-head videos with InfoPros OS into short-form vertical reels or long-form 16:9 videos (sales, welcome or thank-you page videos), change finished reels from any plain request or screenshot, show them visually, and share them. Use when someone wants videos edited into reels or ads, sends video files, a folder or a Google Drive link to edit, asks for a page video, VSL or long-form edit, asks to see, change, regenerate, approve or share a reel, or asks how their edits are going.
---

# Reel editing with InfoPros OS

The `infopros-os` tools do the editing on InfoPros OS. The people asking are not technical and short on time:

- **Be very brief.** A line or two. No explanations or recaps; only what they must know or do.
- **Never ask** for ids, settings or file paths. Pick sensible defaults.
- **Always finish.** Run it on our server first. When that can't work, do it on their computer, and say so in one line.

## New videos

**Short form or long form?** Every edit needs a `format`. Ask in one line, "Short form or long form?", unless they already said:
- **Short form** (`format: "short"`): a vertical 9:16 reel for Meta ads and Reels. A reel or an ad is short form.
- **Long form** (`format: "long"`): a 16:9 video of any length, edited whole, for a sales, welcome or thank-you page. Calm cuts that keep deliberate pauses, plain captions, titles, numbered cards and a button for the call to action. A page video, VSL or YouTube-style video is long form.

- **Videos attached to the chat, or files you can read** (Claude Code, Cowork, Codex):
  1. Call `upload_files` with each file's name and exact size in bytes. `stat -c %s` on Linux, `stat -f %z` on macOS, or `(Get-Item f).Length` in PowerShell.
  2. Upload each with `curl --fail -X PUT -H "Content-Type: <contentType>" -T "<path>" "<uploadUrl>"`. Each edit starts by itself once its file arrives.
  3. **Blocked** (curl can't reach `mcp.infopros.app`, or a proxy refuses it): ask once, in one line: "I can't send files from this chat. Allow `mcp.infopros.app` in Settings > Capabilities and I'll retry, or do it on your computer?" Add `start_upload`'s link as a third way.
     - **On their computer** is the Code tab of the Claude app (Mac or Windows). Give the exact message to paste there, e.g. `Edit talk.mp4 from my Downloads folder into a reel`.
  4. **On their computer, when our server can't take the file** (too large, too slow, blocked) or they ask for it, edit it locally: the local-editing skill.
- **Files you can't reach:** `start_upload` gives a link they open in their browser.
- **Drive link:** `import_from_drive`.
- **A long video they want cut into several reels** (not edited whole): find its highlights first with the video-highlights skill, then `make_reels`.
- **Landscape videos in short form:** they are framed for vertical shot by shot: the speaker followed, two people stacked, screen recordings and slides shown whole across the width. Mention it if they ask why a reel looks that way.
- **Videos that are already edited:** only what is missing is added. A video with its own captions gets none of ours, and our graphics stay out of moments where it shows its own; it is still cut.
- **Style (short form only):** default to the house style. Use `style: "fun"` only when they ask for their brand's colors and fonts. Long form uses the client's brand when OS has one.
- **Batch:** keep the `batchId`. Each reel takes about 3 to 5 minutes; a long-form video a little longer.
- **Switching format:** `reedit_reel` with the other `format`, only when they ask.

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
