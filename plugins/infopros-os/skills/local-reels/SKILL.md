---
name: local-reels
description: Edit a talking-head take into a 9:16 reel (an ad, Reels, TikTok) entirely on the person's computer with InfoPros OS's editing code, set by four settings or a style name. Use when they ask to edit a reel locally, on their computer or without uploading it, or have no InfoPros OS access, in Claude Code, the Code tab in Claude Desktop, or Codex.
---

# Reels on their computer

Run the SOP in `../local-editing/SKILL.md`. This file holds what's specific to a reel; step numbers refer to the SOP.

## Start flags (step 4)

With no flags you get the house default: the hook highlighted (dark type on a white box), simple captions, nothing else on screen, and a light camera.

| Setting | Values (default first) |
|---|---|
| `--colors` | `brand` (their design system or the look they show), `custom` (with `--color accent=#rrggbb`, also `primary`, `page`, `surface`, `text`, `onAccent`, `onPrimary`), `footage` |
| `--energy` | `light` (a small zoom only on a long still stretch, none when the speaker is close), `natural` (calm reframes), `brisk` (tight cuts, punches, quiet sound effects) |
| `--captions` | `simple` (Instagram's own), `bold` (condensed capitals, the spoken word in the accent), `box` (white on dark, for busy footage), `inverted` (the negative of the picture), `stacked` (two tiers, no graphics) |
| `--visuals` | `none` (captions and hook; text at spots in the air only when the speaker clearly points at them), `light` (typed lines, a stat, a comment box), `standard` (cards and effects where the ad turns), `rich` (effects wherever a line fits) |

- **Style names** set all four, and any flag can override one:

  | Style | Colors | Energy | Captions | Visuals |
  |---|---|---|---|---|
  | `--style cinematic` | brand | brisk | simple | rich |
  | `--style fun` | brand | natural | simple | standard |
  | `--style simple` | footage | natural | simple | standard |
  | `--style stacked` | brand | brisk | stacked | none |

  Fun's extras are `--punch-ins`, `--active-word` (with bold captions) and `--extended-hook`.
- **Their look:** `--brand <brand.json>` (OS's brand kit shape), `--look-website <url>`, `--look-screenshot <file>`, `--look-request "<words>"`.
- **`--notes "<what they told you>"`:** the offer, who it's for, what to keep or cut. Never invent any of it.

## Transcript (step 5)

Whisper uses its default model (about 150 MB).

## Edit asks (step 6)

The edit asks for these, in order:
1. Where the face is.
2. What shows over the footage (for a landscape take, also what each shot shows).
3. The plan of the cut.
4. A listen to the cuts.
5. One or two read-throughs.
6. The script map and its visuals: map every word into sections first, then give each must-see section the visual that shows it best within the settings.
7. A look at stills of the finished edit.

When the check "Key moments shown" warns, change it with a lighter visual, such as `"show the no quota contrast as typed lines"`.

## Stills (step 7)

Check that:
- no text sits over the eyes or mouth;
- nothing is cut off;
- the hook is readable.

## Render (step 9)

When it prints `cutout: missing`, run `node render.mjs setup-cutout` once on this computer (Python 3.10 or later), then render again. For `cinematic`, run `setup-cutout` before step 6, so the look at the finished edit sees what will render.

## Deliver (step 11)

The reel isn't in OS, so it gets no Meta policy review: say so in one line if they'll run it as an ad.
