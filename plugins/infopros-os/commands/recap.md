---
description: Recap a client's webinar, like the team's Slack recap posts
argument-hint: "[client] [session, e.g. last night or Oct 25]"
---

Recap a webinar. Follow the team-data skill, especially its writing rules.

Request: $ARGUMENTS

1. **Client:** if none is named, call `choices` with kind `clients` and need `webinars`, and let them pick.
2. **Session:** if none is named, call `choices` with kind `sessions` for that client and let them pick (the latest
   held one is first).
3. Call `webinar_numbers` for that session (previous 3), and `webinarjam` view `session` for who was there at the
   offer when the report doesn't have it.
4. Answer in exactly this shape, nothing before or after:

**<Client>, <Day Mon D> webinar**
- Ad spend: $X
- Registrants: N ($X per registrant)
- Show rate: X% (N live)
- At the offer: N (X% of live)
- VIP purchases: N
- vs last 3: one line with the biggest moves, like "show rate down 5 pts, cost per registrant down 8%"

Leave out a line whose number is missing. When the tool withholds a number with a warning, write that line as
"⚠️ <number>: sources disagree, check before using" with no value. The report link last.
