# Video ad fonts

Latin-subset WOFF2 files for TikTok Sans (captions, weight 600), Inter (the phone interfaces, 400 to 700) and Playfair Display (the long video style's titles and numbers, 400 to 900), and for the caption styles (engine/caption-styles.ts): Figtree (the Instagram Reels default, closest open font to Instagram Sans) and Anton (Instagram's condensed preset), and Playfair Display Italic (the stacked style's serif key phrases, engine/stack.ts). All variable except Anton, as served by Google Fonts:

- TikTok Sans: `https://fonts.gstatic.com/s/tiktoksans/v8/70luu7g-Lm8OXGnh_Ow1sUfFMmlnhbRF425wxXH-UGeud7XItbaHtxhggMrrmAvSNAHtMV6x5NBNB5M.woff2`
- Inter: `https://fonts.gstatic.com/s/inter/v20/UcC73FwrK3iLTeHuS_nVMrMxCp50SjIa1ZL7.woff2`
- Playfair Display: `https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgA.woff2`
- Figtree: `https://fonts.gstatic.com/s/figtree/v9/_Xms-HUzqDCFdgfMm4S9DQ.woff2`
- Anton: `https://fonts.gstatic.com/s/anton/v27/1Ptgg87LROyAm3Kz-C8.woff2`
- Playfair Display Italic: `https://fonts.gstatic.com/s/playfairdisplay/v40/nuFkD-vYSZviVYUb_rj3ij__anPXDTnogkk7.woff2`

For the long style's pages (engine/long.ts), four type pairings and a label face: Instrument Serif and its italic (editorial), Bricolage Grotesque (grotesk), Fraunces and its italic (classic), with Anton and Figtree reused (condensed), and JetBrains Mono for small labels:

- Instrument Serif: `https://fonts.gstatic.com/s/instrumentserif/v5/jizBRFtNs2ka5fXjeivQ4LroWlx-6zUTjg.woff2`
- Instrument Serif Italic: `https://fonts.gstatic.com/s/instrumentserif/v5/jizHRFtNs2ka5fXjeivQ4LroWlx-6zAjjH7M.woff2`
- Bricolage Grotesque: `https://fonts.gstatic.com/s/bricolagegrotesque/v9/3y9K6as8bTXq_nANBjzKo3IeZx8z6up5BeSl9D4dj_x9PpZBMlGIInE.woff2`
- Fraunces: `https://fonts.gstatic.com/s/fraunces/v38/6NU78FyLNQOQZAnv9bYEvDiIdE9Ea92uemAk_WBq8U_9v0c2Wa0KxC9TeA.woff2`
- Fraunces Italic: `https://fonts.gstatic.com/s/fraunces/v38/6NU58FyLNQOQZAnv9ZwNjucMHVn85Ni7emAe9lKqZTnbB-gzTK0K1ChjeveQ.woff2`
- JetBrains Mono: `https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbV2o-flEEny0FZhsfKu5WU4xD7OwE.woff2`

The composition loads them from its public folder, so renders never fetch fonts at runtime. The `OFL-*.txt` files contain the upstream licenses.

SHA-256 checksums:

- TikTok Sans: `20e09f0a631bccb3e848f6f5f18a7fcb09df5a4f7576cc4dc22aa1dad51d9f4a`
- Inter: `3100e775e8616cd2611beecfa23a4263d7037586789b43f035236a2e6fbd4c62`
- Playfair Display: `e0c764a8e9e1cce92163c55bac4b2ad6cd4cf8c696ce2289ab5c41565e65b7e2`
- Figtree: `4ba7d3d096695818fe0686be4f1e82c6b05134e18a22260336130335027462dd`
- Anton: `d0fa07ff63dd60cbc0e2f58e29c802dca2a5ae0276c999f59c6111ab7bbaec3b`
- Playfair Display Italic: `54af24bd0f911f0fd7399d5445ea2023ff501d6a69f2d728f1213072f977ab14`
- Instrument Serif: `5eb09b5ac0e28b67c2f041c8ba6d244604ca0c0980d65912ab2d47fed84ddc31`
- Instrument Serif Italic: `5a51946dfffa82972bc98745359c46761515641fda557c25116459a9f83da4a7`
- Bricolage Grotesque: `a79fdb52d4a5c76552452f69202add96e287401fff03d3e8c0e38b4dcb5a99cd`
- Fraunces: `7234ed860a9cc83045413c4faee63c960a8f2d1917adcf728119307d56e0d783`
- Fraunces Italic: `066710ce7ed235a339d3d6cdcc8b55c0bea5632232662d83aacea25852108271`
- JetBrains Mono: `18be452724bfdc236c074ca94a249a7f41a86752c7d04ab258ce9ed5651f6a7e`
