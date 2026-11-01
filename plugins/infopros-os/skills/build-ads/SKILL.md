---
name: build-ads
description: Upload ad creatives to a client's Meta ad account and build campaigns, ad sets and ads with the infopros-os tools, named in the team's convention and always paused. Use when someone wants to upload creatives (Drive links or files), launch a campaign for a webinar, add new ads to an ad set, or copy last launch's campaign for the next date.
---

# Build ads

Everything is created paused. Nothing is created until the person has seen the plan and said yes.

## Steps

1. **Client.** If none is named, call `choices` (kind `clients`, need `ads`) and offer a pick list.
2. **Creatives.** `upload_ad_media` with the Drive links, or the files with their exact sizes. Pass an angle per file
   in `renames` when the file name doesn't say the hook (`IMG_4821.mov`). Tell them the names in one or two lines.
   Check `ad_media` until they're ready (images about a minute, videos a few minutes).
3. **Plan.** `plan_ads` with the parts, never whole names:
   - New campaign: funnel, the webinar or launch date, objective (sales for webinars), a campaign budget or one per
     ad set, ad sets (audience, countries, ages, goal), ads (media, primary text, headline, link, button).
   - New ads into a running ad set: `add_ads` with the ad set's name.
   - Next launch: `duplicate_campaign` with last launch's campaign and the new date.
4. **Confirm.** Show the preview in a few lines: campaign name and budget, ad set names, ad names, link. Ask "Create
   it, paused?" and wait for a yes.
5. **Create.** `create_planned_ads` with the planId. Give the Ads Manager link and say it's paused.

## Names

The tools build every name from parts:

- Campaign: `Client | Funnel | MM.DD.YY | Objective`, e.g. `Acme | Webinar | 11.04.26 | Sales`
- Ad set: `Audience | Countries | Ages | Note`, e.g. `Broad | US | 28-65 | Adv+`
- Ad and its media: `VID03 | Dont Buy A Franchise | v1` (numbers continue from the account's ads)

An angle is the hook or idea in 2 to 6 plain words. A new cut of the same idea is the next version, not a new angle.

## Writing

Short: what will be created, then the question. No em dashes or middle dots. Never mention tool names or ids.

## Never

- Never call `create_planned_ads` without a yes to that exact preview.
- Never turn anything on; the person does that in Ads Manager.
