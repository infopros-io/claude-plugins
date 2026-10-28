---
name: onboarding
description: Set up InfoPros OS for someone in one go, checking and fixing what it needs where they are, such as the sign-in, the mcp.infopros.app domain in a chat's settings, and the tools Claude Code uses for YouTube videos and local editing. Use when someone says set me up, get started, onboard me, connect InfoPros, or install it, right after installing the plugin, or when a task fails for a setup reason (blocked domain, missing tool, not signed in).
---

# Onboarding

Set everything up with as few words and steps as possible:

- **Before you start,** send one line: "Setting up InfoPros OS: sign-in, network and tools, about 2 minutes."
- **Then do the work.** Fix what you can yourself. Ask them only for what you can't do.
- **At the end,** one line: "All set." Name anything still missing and the one thing they need to do about it.

## 1. Sign-in (everywhere)

Call `list_clients`. If it answers, they are signed in. If the `infopros-os` tools are missing or ask for a sign-in:
- **Claude app (chat, Cowork):** Customize > Connectors (or the plugin's Connectors tab) > Connect next to infopros-os, then sign in with their InfoPros account.
- **Claude Code or the Code tab:** tell them to type `/mcp`, pick `infopros-os` and sign in. If there is no `infopros-os`, run `claude plugin marketplace add infopros-io/claude-plugins` and `claude plugin install infopros-os@infopros`, then ask them to restart and do `/mcp`.
- **Codex:** run `codex mcp login infopros-os`.

## 2. In a chat (claude.ai, the Claude app's chat or Cowork)

Check the domain the files go through: `curl -sS -m 10 -o /dev/null -w "%{http_code}" https://mcp.infopros.app/health`. A `200` means it's fine.

If it fails, send exactly this (one message):
> Allow one domain: Settings > Capabilities > turn on **Code execution and file creation** and **Allow network egress**, and add `mcp.infopros.app` if it asks for domains. Say "done" and I'll check.

- **On a Team or Enterprise plan,** an owner does it once for everyone: Organization settings > Capabilities > network egress to package managers and specific domains, adding `mcp.infopros.app`.
- **After "done":** check again.
- **YouTube videos and local editing** need their computer. Mention the Code tab in one line, only if they use those.

## 3. On their computer (Claude Code, the Code tab, Codex)

1. **Network:** the same `curl` check. If it fails, the company network blocks `mcp.infopros.app`. Say so in one line; their IT has to allow it.
2. **Tools:** check `yt-dlp --version`, `ffmpeg -version`, `node --version` (20 or later; 22 or later also covers YouTube) and `deno --version`.
   - If anything is missing, ask once, in one line: "Install yt-dlp, ffmpeg and Node (free, for YouTube videos and local editing)?" Then install all of it:
     - **macOS:** `brew install yt-dlp ffmpeg node`. With no Homebrew, ask them to paste the install line from brew.sh into Terminal (it asks for their Mac password), then continue.
     - **Windows:** `winget install -e --id yt-dlp.yt-dlp` (brings ffmpeg and Deno) and `winget install -e --id OpenJS.NodeJS.LTS`. Open a new terminal after.
     - **Linux:** the system's packages, or the yt-dlp release binary.
3. **Local editing kit:** call `local_edit_kit`. If its `dir` doesn't exist yet, run its `install` (`installWindows` in PowerShell) so the first local edit starts at once.

## 4. On a phone

Only the sign-in. Say in one line that YouTube links and local editing work from their computer.
