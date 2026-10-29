---
description: A client's winning creatives, tired ones, and the hooks that work
argument-hint: "[client] [period, default last 30 days]"
---

Show a client's creatives. Follow the team-data skill, especially its writing rules.

Request: $ARGUMENTS

1. If no client is named, call `choices` with kind `clients` and need `ads`, and let them pick.
2. Call `creative_performance` view `winners` (limit 3), view `fatigue` (limit 3) and view `hooks` (limit 3) for the
   client and period.
3. Answer in this shape:

**Winners** (cost per registration, last 30 days)
1. <creative>: $X per registration, $Y spent. Hook: "<first line>"
2. ...

**Getting tired**
- <creative>: <what got worse>

**Hooks that work:** one line naming the hook types that win.

Leave out a section with nothing in it.
