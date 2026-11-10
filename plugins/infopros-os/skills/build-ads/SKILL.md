---
name: build-ads
description: Upload ad creatives to a client's Meta ad account and build campaigns, ad sets and ads with Meta's own ads tools (meta-ads) and the infopros-os tools, named in the team's convention and always paused. Use when someone wants to upload creatives (Drive links or files), launch a campaign for a webinar, add new ads to an ad set, duplicate an ad and change its media, text or enhancements, or copy last launch's campaign for the next date.
---

# Build ads

Everything is created paused. Nothing is created until the person has seen the plan and said yes.

## Which tools

- **Uploads:** `upload_ad_media` (infopros-os). Meta's tools can't upload files or Drive links.
- **New campaigns and ad sets:** Meta's own tools (`meta-ads`: `ads_create_campaign`, `ads_create_ad_set`). They act
  as the person's own Facebook login. If they aren't connected, help them sign in (onboarding skill).
- **Ads (images and videos):** `plan_ads` with `add_ads` into the ad set, then `create_planned_ads`. It names the ads,
  adds the UTM tags and finds the page and Instagram account.
- **Duplicating an ad and editing the copies:** `plan_ads` with `duplicate_ads`, then `create_planned_ads`. One
  entry in `copies` per new ad: new `media` (an upload) in place of the copied ad's, and only what else changes (text,
  headline, link, button, name). The page, URL tags, tracking and ad set stay as the copied ad has them.
  Enhancements default to the team's way (relevant comments, enhance CTA, brightness and contrast on; music, AI image
  and video generation, translation and the rest off). Change single ones with `enhancements.on` / `off` only when
  asked. The copied ad itself is never changed.
- **Copying last launch's campaign:** `plan_ads` with `duplicate_campaign`, then `create_planned_ads`.
- **Numbers and changes:** infopros-os (`ad_numbers`, `creative_performance`, `ad_changes`), as in team-data.

## Steps

1. **Client.** If none is named, call `choices` (kind `clients`, need `ads`) and offer a pick list.
2. **Creatives.** `upload_ad_media` with the Drive links, or the files with their exact sizes. Pass an angle per file
   in `renames` when the file name doesn't say the hook (`IMG_4821.mov`). Tell them the names in one or two lines.
   Check `ad_media` until they're ready (images about a minute, videos a few minutes).
3. **Plan.**
   - New campaign: the campaign (name below, objective, a campaign budget or one per ad set) and ad sets (name
     below, broad with Advantage+ audience, countries, ages, optimization goal, the pixel the account's latest ad sets
     use, budget), then the ads: media, primary text, headline, link, button.
   - New ads into a running ad set: the ad set and the ads.
   - Copies of one ad: the ad to copy and, per copy, the new media and anything else that changes. A batch of
     uploads becomes one copy each, named after its media.
   - Next launch: last launch's campaign and the new date.
4. **Confirm.** Show the plan in a few lines: campaign name and budget, ad set names, ad names, link (for copies:
   which ad, how many copies, what changes, enhancements off). Ask "Create
   it, paused?" and wait for a yes. One yes covers the whole plan.
5. **Create.** For a new campaign: the campaign and ad sets with Meta's tools, then the ads with `plan_ads`
   (`add_ads`, once per ad set) and `create_planned_ads`, no new question. Otherwise `plan_ads` and
   `create_planned_ads`. Give the Ads Manager link and say it's paused. If something is refused halfway, say what was
   already created.

## Names

Every name is built from parts joined by ` | `. infopros-os builds ad names and copied campaign names itself; build
campaign and ad set names for Meta's tools exactly like this:

- Campaign: `Client | Funnel | MM.DD.YY | Objective`, e.g. `Acme | Webinar | 11.04.26 | Sales`. The client as OS
  has it (`find`), the date of the webinar or launch, the objective one of Sales, Leads, Engagement, Traffic,
  Awareness.
- Ad set: `Audience | Countries | Ages | Note`, e.g. `Broad | US | 28-65 | Adv+`. Countries joined by `+`
  (`US+CA`); ages above 65 are 65.
- Ad and its media: `VID03 | Dont Buy A Franchise | v1`. Numbers continue from the account's ads.

An angle is the hook or idea in 2 to 6 plain words. A new cut of the same idea is the next version, not a new angle.
No pipes or quotes inside a part.

## Writing

Short: what will be created, then the question. No em dashes or middle dots. Never mention tool names or ids.

## Never

- Never create anything without a yes to that exact plan.
- Never turn anything on (`ads_activate_entity`), change or pause a live campaign, ad set or ad
  (`ads_update_entity`), or delete or change audiences. The person does that in Ads Manager.
