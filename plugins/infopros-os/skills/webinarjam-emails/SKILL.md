---
name: webinarjam-emails
description: Shortcodes (merge fields) for WebinarJam email notifications, such as {FIRST_NAME}, {LIVE_LINK}, {DATE} and {TIME}. Use only when writing or editing an email or reminder that will be sent from WebinarJam, for example webinar confirmation, reminder or replay emails. Not for other emails.
---

# WebinarJam email shortcodes

WebinarJam fills these in for each registrant. Use them only in emails sent from WebinarJam; anywhere else they show up as raw text.

Give any shortcode a default for registrants without a value: `{FIRST_NAME|friend}`.

| Shortcode | Fills in |
| --- | --- |
| `{TITLE}` | Webinar title |
| `{DESCRIPTION}` | Webinar description |
| `{PRESENTER}` | Presenter(s) |
| `{FIRST_NAME}` | Attendee first name |
| `{LAST_NAME}` | Attendee last name |
| `{ATTENDEE_EMAIL}` | Attendee email |
| `{DATE}` | Date |
| `{TIME}` | Time |
| `{LIVE_LINK}` | Link to the live room |
| `{PASSWORD}` | Password |

- Write the shortcodes exactly as above, in capitals with curly braces. No other shortcodes exist.
- Greet with a default, e.g. `Hi {FIRST_NAME|there},`.
- Use `{LIVE_LINK}` for the room link instead of a pasted URL, and `{DATE}` and `{TIME}` instead of typed dates.
