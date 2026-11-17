---
name: local-editing
description: Edit a reel or long-form video with InfoPros OS while the original video stays on the person's computer. A small proxy goes up, OS edits it as usual, and their computer renders the final at full quality. Use only when they ask to edit locally or on their computer, or when the original can't be uploaded (too large, too slow, blocked), in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Local editing

Remote first: upload the original with `upload_files` whenever you can. Use this only when they pick local, or the upload can't work.

Talk to them in one short line at a time: what you need from them, or what's done. No explanations.

## Steps

1. **Tools:** check `node --version` (20 or later) and `ffmpeg -version`. Install what's missing, after one line asking:
   - macOS: `brew install node ffmpeg` (no Homebrew: Node from nodejs.org, a static ffmpeg in their home folder).
   - Windows: `winget install -e --id OpenJS.NodeJS.LTS` and `winget install -e --id Gyan.FFmpeg`, then open a new terminal.
   - Linux: the system's packages.
2. **Kit:** the render kit comes with this skill, in its `kit` folder (next to this file). Call `local_edit_kit`, then read `kit/version.json`:
   - If its `version` isn't `kitVersion`, this plugin is out of date: say in one line "Update the InfoPros plugin, then ask again" and stop.
   - If `dir` doesn't exist yet, run `install` (`installWindows` in PowerShell) with `<local-editing skill folder>` replaced by this skill's folder. It copies the kit there and installs Remotion.
3. **Proxy:** run its `proxy` command (`proxyWindows` in PowerShell) with the original, writing into a new temporary folder under the original's name. It prints the proxy's `name` and `bytes`.
4. **Upload:** `upload_files` with the proxy (same client, format, style and notes as any upload), then PUT it. Its edit starts by itself once it arrives.
5. **Wait:** `get_video` at most once a minute until it's ready, about 3 to 5 minutes.
6. **Render:** call `render_locally`. Check its `kit.version` against `kit/version.json` as in step 2, and install it the same way if its `dir` is missing.
   - **Cutout:** when it answers `needsCutout: true` (the video shows something behind the speaker or stands them on a page), run its `setupCutout` (`setupCutoutWindows` in PowerShell) once on this computer, skipped when an earlier render here printed `cutout: made`. It needs Python 3.10 or later; install it after one line asking (macOS `brew install python`, Windows `winget install -e --id Python.Python.3.13` then a new terminal, Linux the system's `python3` and `python3-venv`).
   - Run its `render` command (`renderWindows` in PowerShell) with `editUrl`, the original, and their Downloads folder (`~/Downloads/<title>.mp4`, or `$HOME\Downloads\<title>.mp4` on Windows). It takes a few minutes; the first time it also downloads a browser of about 100 MB.
   - When render prints `cutout: missing`, run `setupCutout` and render again.
7. **Tell them:** `Done: <file>`.
8. **Into OS:** before `share_video` or `approve_video`, or when they want it in OS, call `attach_local_render`, PUT the file, then `finish_local_render` with the `bytes` and `sha256` that render printed. Until then OS holds the proxy's softer render.

**Changes:** `change_video` as usual, then steps 6 to 8 for the new version.

**If a step fails:** one line with what failed and what fixes it. When render says the edit is for another kit, the plugin is out of date: ask them to update it.

The `kit` folder is built by OS (`scripts/build-render-kit.mjs`); don't edit it by hand.
