---
description: Make the results form link for a client's webinar (calls booked, deals closed, cash) to share yourself
argument-hint: "[client] [session]"
---

Make a results form link. Follow the team-data skill.

Request: $ARGUMENTS

1. **Client:** if none is named, call `choices` with kind `clients` and need `webinars`, and let them pick.
2. **Session:** if none is named, call `choices` with kind `sessions` for that client and let them pick from the held
   ones.
3. Call `results` with action `form_link`, the client and the session's date.
4. Answer in two lines: the link, and "Not sent. Share it with <client> yourself; it works for 14 days."

Never send the link to anyone yourself.
