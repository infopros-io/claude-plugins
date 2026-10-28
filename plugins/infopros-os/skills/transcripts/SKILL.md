---
name: transcripts
description: Transcribe a video or recording with InfoPros OS into text, subtitles (SRT) and word timings, with who speaks. Use when someone wants a transcript, captions or subtitles file, or the words of a video, webinar, call or podcast, or when you need a video's words and timings for work on their computer.
---

# Transcripts with InfoPros OS

Be very brief with them: a line or two, no explanations. Never ask for ids or settings.

1. **Upload:** `transcribe` with the file's name and exact size, then `curl --fail -X PUT -H "Content-Type: <contentType>" -T "<path>" "<uploadUrl>"`. It starts by itself.
   - **A long video** goes up faster as its sound: `ffmpeg -i <video> -vn -c:a aac -b:a 96k <name>.m4a`, then transcribe that.
   - **Blocked** (curl can't reach `mcp.infopros.app`): ask once, in one line: "I can't send files from this chat. Allow `mcp.infopros.app` in Settings > Capabilities and I'll retry, or do it on your computer?" On their computer is the Code tab of the Claude app: give the exact message to paste, e.g. `Transcribe call.mp4 from my Downloads folder`.
2. **Wait:** about a minute per 10 minutes of sound. Check `get_transcript` about once a minute.
3. **Give it:** the text when it's short, else the links (text, subtitles, word timings; they work for an hour). On their computer, save the files next to the video instead.
