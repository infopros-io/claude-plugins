---
name: video-highlights
description: Find the best short-form moments in a long video (a webinar, podcast, interview or VSL) with InfoPros OS, each cut into a raw clip, and turn the ones they want into finished vertical reels. Use when someone wants highlights, clips, Shorts, Reels or TikToks pulled from a long video, sends a YouTube link or a long video file for that, wants reels made from highlights, or asks how a highlight search is going.
---

# Highlights with InfoPros OS

The `infopros-os` tools find the moments of a long video that work on their own as Shorts, Reels or TikToks, rank them, and cut each into a raw clip, as filmed: same frame, no captions. `make_reels` then turns the ones they want into finished reels. The people asking are not technical: never ask them for ids, settings or file paths, and speak in plain words.

## Starting a search

- **YouTube link** (public or unlisted): `find_highlights` with `youtubeUrl`. It starts at once.
- **A file you can read** (Claude Code, Cowork on their computer, Codex):
  1. Call `find_highlights` with the file's name and exact size in bytes. `stat -c %s` on Linux, `stat -f %z` on macOS, or `(Get-Item f).Length` in PowerShell.
  2. Upload it with `curl --fail -X PUT -H "Content-Type: <contentType>" -T "<path>" "<uploadUrl>"`.
  3. Call `start_highlights` with the `searchId`.
- **A file attached to a chat:** use the same steps from your sandbox when it can reach `*.t3.storageapi.dev`. If the upload is blocked or the video is too large for the chat, ask them to put it on YouTube as unlisted and send the link.
- **Client:** pass the client's name when the video is for one. It tunes what counts as a good fit.
- **What they tell you about it:** pass it in their words, as `speaker`, `about`, `audience`, `lookFor` ("objections about price") or `avoid`.
- **Lengths and count:** leave them out unless they ask. By default highlights run 30 seconds to 4 minutes, mostly 45 to 90 seconds, about one per 2 minutes of video.

## Following it

- **How long:** about 3 to 6 minutes for an hour of video, plus the download of a long YouTube video.
- **Checking:** call `get_highlights` about once a minute at most, and tell them where it is in a few words.
- **Finding an earlier search:** `list_highlight_searches` turns "the webinar from last week" into a search.
- **If it fails:** pass on the error in plain words. When YouTube refuses the download, ask them for the file instead.

## Showing the highlights

- **One short line each:** title, where it is in the video, length, and its clip link. Keep it phone friendly, with no tables.
- **More detail:** add the opening line or why it works only when it helps them choose.
- **Close calls:** mention the `maybe` list as worth a look. The reviews disagreed on those.
- **Things to check:** pass on `warnings` (an opening on "And", swearing, a long silence) and `claimsToCheck` (claims about results or income to clear before an ad boosts the clip).
- **Links:** clip links work for an hour. Call `get_highlights` again for fresh ones.

## Changing a search

"Shorter", "longer", "more", "fewer" or "focus on the money stories" goes to `start_highlights` on the same search, with new `minSeconds` and `maxSeconds`, `count` or `lookFor`. It reuses the transcript, and the new highlights replace the old ones.

## Making reels from highlights

When they want the highlights as finished reels or TikToks, call `make_reels` with the search. It makes every highlight into a reel by default; pass `highlights` with the ranks they pick (and `maybe` for close calls they want too). The reels are edited like any uploaded video, and a landscape video is framed for vertical shot by shot: the speaker followed, two people stacked, screen recordings and slides shown whole.

Then the reel-editing skill takes over: follow the batch with `show_reels` (or `list_reels`) using the `batchId`, and use `change_reel`, `approve_reel` and `share_reel` as for any reel. Each reel takes about 3 to 5 minutes.
