---
description: Find why a client's cost or show rate moved, and what to fix first
argument-hint: "[client] [session or period]"
---

Find why a client's numbers moved. Follow the team-data skill, especially its writing rules.

Request: $ARGUMENTS

1. **Client:** if none is named, call `choices` with kind `clients` and let them pick.
2. **What moved:** `webinar_numbers` for the latest held session (or the one named) with previous 3. Pick the metric
   that moved most for the worse: cost per registration, show rate, retention at the offer, or bookings.
3. **Look for causes,** only where they fit the metric:
   - Cost per registration: `ad_numbers` grouped by day for 14 days, `ad_changes` for 7 days with `withResults`,
     `creative_performance` view `fatigue` for the client.
   - Show rate or retention: `webinarjam` view `session` (signup timing, late joiners, watch time) for this session
     and the one before.
   - Bookings: `results` and `search` in the client's Slack for the last 7 days.
4. Answer in this shape, nothing more:

**<Client>: <metric> <from> -> <to>**
- Likely cause: one line, with the evidence (a change, a date, a number).
- Also seen: up to 2 lines.
- Fix first: one line.

Say "likely" for causes: timing is context, not proof. If nothing explains it, say so in one line and name what you
checked in a few words.
