---
name: video-highlights
description: Find the best short-form moments in a long video (a webinar, podcast, interview or VSL) with InfoPros OS, each cut into a raw clip, and turn the ones they want into finished vertical reels. Use when someone wants highlights, clips, Shorts, Reels or TikToks pulled from a long video, sends a YouTube link or a long video file for that, wants reels made from highlights, or asks how a highlight search is going.
---

# Highlights with InfoPros OS

The `infopros-os` tools find the moments of a long video that work on their own as Shorts, Reels or TikToks, rank them, and cut each into a raw clip, as filmed: same frame, no captions. `make_reels` then turns the ones they want into finished reels. The people asking are not technical: never ask them for ids, settings or file paths, and speak in plain words.

## Starting a search

Whatever they have and wherever they ask, make sure they get their highlights. If something can't work from here, say so in a sentence and give them the next step, ready to follow.

### A YouTube link

YouTube refuses to hand videos to our server for now, but it hands them to their own computer.

**When you can run commands on their computer** (Claude Code, the Code tab in Claude Desktop, Codex), download it there:

1. **Tools:** check `yt-dlp --version`, `ffmpeg -version`, and `deno --version` (or `node --version` 22 or later, then add `--js-runtimes node` below). Install what is missing, saying what it is in a few plain words:
   - macOS: `brew install yt-dlp ffmpeg` (it brings Deno).
   - Windows: `winget install -e --id yt-dlp.yt-dlp` (it brings Deno and ffmpeg). Open a new terminal after.
   - No Homebrew, or Linux: the yt-dlp release binary from github.com/yt-dlp/yt-dlp/releases, Deno's installer and a static ffmpeg, in a folder in their home folder. No admin rights needed.
2. **Download** into a new temporary folder:
   `yt-dlp --no-playlist -f "bv*[height<=1080][vcodec^=avc1]+ba[ext=m4a]/bv*[height<=1080]+ba/b[height<=1080]/b" --merge-output-format mp4 -o "<folder>/video.mp4" "<link>"`
   - **Sign-in needed** (age restricted, members only, or private but shared with them): ask, then retry with `--cookies-from-browser chrome` (or their browser). It uses their own YouTube login, on their computer only.
   - **Over 4 GB:** download again with `height<=720` in place of `height<=1080`.
3. **Upload:** `find_highlights` with `youtubeUrl` **and** `file` (name `video.mp4`, exact size), then the PUT below, then `start_highlights`. A long video takes a while to go up from home; tell them roughly.
4. **Clean up:** delete the download. OS keeps its own copy.

If you can't install the tools, or YouTube can't be reached from where you run (a sandbox, a blocked network), do as in a chat.

**In a chat** (claude.ai, the Claude app's chat or Cowork, the phone apps): `find_highlights` with `youtubeUrl` alone, and our server tries. If YouTube refuses it, `get_highlights` has a `next` saying what to tell them:
- Say plainly that YouTube won't let our server download it and this chat can't download it either.
- Then give the steps to run it through Claude Code on their computer: open the Claude app on a Mac or Windows computer, switch to the **Code** tab, pick any folder (Downloads is fine), and paste one message.
- Write that message out in full for them, with the link and anything they told you about the video, e.g. `Find highlights in https://youtu.be/... It's our pricing webinar, for Acme.`
- On a phone, tell them to do it from their computer.

### A file

- **A file you can read** (Claude Code, Cowork on their computer, Codex):
  1. Call `find_highlights` with the file's name and exact size in bytes. `stat -c %s` on Linux, `stat -f %z` on macOS, or `(Get-Item f).Length` in PowerShell.
  2. Upload it with `curl --fail -X PUT -H "Content-Type: <contentType>" -T "<path>" "<uploadUrl>"`.
  3. Call `start_highlights` with the `searchId`.
- **A file attached to a chat:** use the same steps from your sandbox when it can reach `*.t3.storageapi.dev`. If the upload is blocked or the video is too large for the chat, tell them Claude Code on their computer can send it: the Code tab steps above, with a message like `Find highlights in the video <file name> in my Downloads folder`.

### Every search

- **Client:** pass the client's name when the video is for one. It tunes what counts as a good fit.
- **What they tell you about it:** pass it in their words, as `speaker`, `about`, `audience`, `lookFor` ("objections about price") or `avoid`.
- **Lengths and count:** leave them out unless they ask. By default highlights run 30 seconds to 4 minutes, mostly 45 to 90 seconds, about one per 2 minutes of video.

## Following it

- **How long:** about 3 to 6 minutes for an hour of video, plus the download of a long YouTube video.
- **Checking:** call `get_highlights` about once a minute at most, and tell them where it is in a few words.
- **Finding an earlier search:** `list_highlight_searches` turns "the webinar from last week" into a search.
- **If it fails:** pass on the error in plain words, with what to do next. When YouTube refuses our server, follow the `next` in `get_highlights`: download it yourself if you can run commands on their computer, otherwise the Claude Code steps above.

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
