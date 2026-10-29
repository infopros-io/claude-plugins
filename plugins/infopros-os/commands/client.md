---
description: One-glance status of a client - next webinar, latest numbers, spend, results, recent notes
argument-hint: "[client]"
---

Give a one-glance status of a client. Follow the team-data skill, especially its writing rules.

Client: $ARGUMENTS

1. If no client is named, call `choices` with kind `clients` and let them pick.
2. Gather: `launches` for the client (next webinar and budget), `webinar_numbers` (latest held session),
   `ad_numbers` for the last 7 days, `results` for the last 14 days, and `search` in Slack and calls for the client in
   the last 7 days (decisions, problems, requests).
3. Answer in at most 8 lines:

**<Client>**
- Next webinar: day and time, daily budget
- Last webinar: registrants, show rate, cost per registration
- Ads, last 7 days: spend, cost per registration
- Results, 14 days: bookings, closes, cash (with links)
- Recent: up to 3 one-line notes from Slack or calls, each with its link

Leave out a line that has nothing.
