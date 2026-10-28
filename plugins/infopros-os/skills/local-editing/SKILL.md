---
name: local-editing
description: Edit a reel with InfoPros OS while the original video stays on the person's computer. A small proxy goes up, OS edits it as usual, and their computer renders the final at full quality. Use only when they ask to edit locally or on their computer, or when the original can't be uploaded (too large, too slow, blocked), in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Local editing

Remote first: upload the original with `upload_files` whenever you can. Use this only when they pick local, or the upload can't work.

Talk to them in one short line at a time: what you need from them, or what's done. No explanations.

## Steps

1. **Tools:** check `node --version` (20 or later) and `ffmpeg -version`. Install what's missing, after one line asking:
   - macOS: `brew install node ffmpeg` (no Homebrew: Node from nodejs.org, a static ffmpeg in their home folder).
   - Windows: `winget install -e --id OpenJS.NodeJS.LTS` and `winget install -e --id Gyan.FFmpeg`, then open a new terminal.
   - Linux: the system's packages.
2. **Kit:** call `local_edit_kit`. If its `dir` doesn't exist yet, run `install` (`installWindows` in PowerShell).
3. **Proxy:** run its `proxy` command (`proxyWindows` in PowerShell) with the original, writing into a new temporary folder under the original's name. It prints the proxy's `name` and `bytes`.
4. **Upload:** `upload_files` with the proxy (same client, format, style and notes as any upload), PUT it, then `finish_uploads`.
5. **Wait:** `get_reel` at most once a minute until it's ready, about 3 to 5 minutes.
6. **Render:** call `render_locally`, then run its `render` command (`renderWindows` in PowerShell) with `editUrl`, the original, and their Downloads folder (`~/Downloads/<title>.mp4`, or `$HOME\Downloads\<title>.mp4` on Windows). It takes a few minutes; the first time it also downloads a browser of about 100 MB.
7. **Tell them:** `Done: <file>`.
8. **Into OS:** before `share_reel` or `approve_reel`, or when they want it in OS, call `attach_local_render`, PUT the file, then `finish_local_render` with the `bytes` and `sha256` that render printed. Until then OS holds the proxy's softer render.

**Changes:** `change_reel` as usual, then steps 6 to 8 for the new version.

**If a step fails:** one line with what failed and what fixes it.
