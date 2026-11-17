import { createRequire as __kitRequire } from 'node:module'; const require = __kitRequire(import.meta.url);

// scripts/local-render.ts
import { spawn as spawn4 } from "node:child_process";
import { createHash as createHash3 } from "node:crypto";
import { existsSync as existsSync3 } from "node:fs";
import { copyFile, mkdir as mkdir2, mkdtemp, readdir, readFile as readFile2, rm, stat as stat2, writeFile as writeFile2 } from "node:fs/promises";
import { homedir as homedir2 } from "node:os";
import path3 from "node:path";
import { fileURLToPath } from "node:url";

// features/video-ads/engine/proxy.ts
var TAG = "infopros-original=";
var PROXY_SHORT_SIDE = 720;
function proxyComment(original) {
  return `${TAG}${Math.round(original.width)}x${Math.round(original.height)}`;
}
function proxySize(original, shortSide = PROXY_SHORT_SIDE) {
  const short = Math.min(original.width, original.height);
  const scale = short > shortSide ? shortSide / short : 1;
  const even = (n) => Math.max(2, Math.round(n * scale / 2) * 2);
  return { width: even(original.width), height: even(original.height) };
}

// features/video-ads/engine/long-slop.ts
var LONG_SLOP = [
  { id: "glow", rule: "No glowing, neon or blurred-shadow text, and no glow around cards or buttons.", enforced: "design" },
  { id: "glass", rule: "No frosted glass cards floating over the speaker; a page is a page, solid and flat.", enforced: "design" },
  { id: "outlined-numerals", rule: "No giant outlined numerals or number badges beside a line; number a list only when the speaker counts.", enforced: "design" },
  { id: "counters", rule: "No 01, 02 counters over cards or items: a number on a page counts something the speaker counts.", enforced: "design" },
  { id: "empty-boxes", rule: "No box bigger than what it holds: a card is as wide as its words, and two or three short figures (a value and a price) are set large on the page, never in cards.", enforced: "design" },
  { id: "cards-on-a-page", rule: "Cards only over the video itself, where they give words a ground; on a page with its own ground the same things are a list, each line under its item. Cards in a row are all one size.", enforced: "check" },
  { id: "small-in-space", rule: "Little to say is set large: a page with a few short words fills its room with oversized type, not small type in empty space.", enforced: "design" },
  { id: "thin-on-color", rule: "Only one statement or one number sits on the accent color, set large and heavy; lists, cards, steps and small text take the video's own page, and a fine serif never sits on a color.", enforced: "check" },
  { id: "fake-ui", rule: "No fake buttons, cursors, clicks or progress bars: the page the video sits on has the real button.", enforced: "design" },
  { id: "icon-filler", rule: "No icon next to every line: a line icon says nothing a word does not.", enforced: "design" },
  { id: "caption-echo", rule: "A page never repeats the caption under it: captions step aside while a page shows, so the page carries the words.", enforced: "design" },
  { id: "emoji", rule: "No emoji.", enforced: "check" },
  { id: "exclamation", rule: "No exclamation marks.", enforced: "check" },
  { id: "buzzwords", rule: "No marketing filler the speaker did not say: unlock, game-changer, elevate, supercharge, skyrocket, next level, secret sauce, journey, seamless, unleash, transform your.", enforced: "check" },
  { id: "invented-numbers", rule: "A number on a page is one the speaker says, as they say it; never a result, price or count they do not state.", enforced: "check" },
  { id: "wordy", rule: "A heading is at most 8 words and an item at most 8; a page is read in a glance while the speaker talks.", enforced: "check" },
  { id: "crowded", rule: "Talking with nothing on screen comes first: a third of the video or less carries a page; two pages less than 3 seconds apart become one move, never an exit and an entrance.", enforced: "check" },
  { id: "flash", rule: "No big page for a few seconds: a page that moves the speaker or covers the frame stays 6 seconds or more; a shorter moment sits beside the speaker (aside).", enforced: "check" },
  { id: "early-exit", rule: "A page never leaves while the speaker still talks about it: it stays for every section it carries.", enforced: "check" },
  { id: "cutout", rule: "The speaker cut out of their background at most once a video; a window is the default.", enforced: "check" },
  { id: "same-again", rule: "Vary the layout and the block from one page to the next; never the same layout three times in a row.", enforced: "prompt" },
  { id: "label-headings", rule: 'A heading says the point, not a label: "Most people quit in week two", not "Key Insight" or "Important".', enforced: "prompt" },
  { id: "shouting", rule: "No all-capital headings, and no Title Case On Every Word: write headings as sentences.", enforced: "prompt" }
];
var slopRules = () => LONG_SLOP.map((f) => `- ${f.rule}`).join("\n");

// features/video-ads/engine/types.ts
var isLong = (style) => style === "long";
var REEL_FRAME = { width: 1080, height: 1920 };
var LONG_FRAME = { width: 1920, height: 1080 };
var loudnessOf = (style) => isLong(style) ? -14 : -11;
var LONG_LAYOUTS = ["window", "split", "overlay", "cutout", "aside"];
var LONG_BLOCKS = ["heading", "list", "stat", "quote", "cards", "compare", "steps"];
var LONG_SURFACES = ["ink", "paper", "accent", "footage"];
var LONG_TYPES = ["editorial", "grotesk", "condensed", "classic"];
var LONG_MARKERS = ["number", "dash", "check"];

// features/video-ads/engine/long.ts
var LONG_PAGE_FIELDS = `A page is a designed page, set like a good editorial or product page, that the speaker shares the frame
with or steps out of. Its fields:
- layout: where the speaker goes.
  "window" their picture in a rounded frame on one side, the words on the other: the default while they explain
    or walk through a list, steps or the parts of something.
  "split" the frame in two halves, them in one: a comparison, a before and after.
  "aside" they stay full frame and the words sit in the room beside them: a short line, a moment where their face
    matters, the call to action at the end; with block compare, one column each side of them ("Business" left,
    "Hobby" right).
  "overlay" the page fills the frame and they are only heard: one statement or number that deserves the whole frame.
  "cutout" them cut out of their background and standing on the page: at most once a video.
  side = the side the speaker takes, "left" or "right"; the words take the other.
- block: what the page holds.
  heading: title = the line to remember, 2 to 8 of the speaker's own words, lightly trimmed, as a sentence.
  list: title = what the items are (a heading, often the name of the thing being walked through), lines = 2 to 5
    items of up to 6 words, as the speaker names them, others = a short line under each item (up to 8 words) or
    empty; marker "number" when the speaker counts them, else "dash" or "check".
  stat: title = one number exactly as the speaker says it ("$4,000", "3 weeks", "70%"), lines = [a label of up to
    6 words saying what it counts].
  quote: title = words someone says or said, up to 16 words, quoted as said; lines = [who said it] or empty.
  cards: only over the video itself (layout "overlay", surface "footage"), where a card gives its words a ground:
    title = a heading or empty, lines = 2 to 4 card titles of up to 4 words, others = one line under each card, up
    to 8 words, in the same order; every card is one size. On a page with its own ground use a list, with each
    card's line under its item. Two or three short figures (a value and then a price, a before and an
    after) are set large side by side with no boxes: give each a title of a few characters ("$1,000+", "$27") and
    its line under it; the last is in the accent color.
  compare: title = a heading or empty, lines = [the left column's label, then its items], others = [the right
    column's label, then its items], the same number in each (labels only is fine: "A business", "A hobby");
    lineWordIndexes = the word where each entry of lines and then of others is said, labels included.
  steps: title = a heading or empty, lines = 2 to 5 steps of up to 4 words, in order.
  lineWordIndexes = the word where each item is said, so it appears then.
- text: one to three words of the title to set in the accent color (copied exactly from title), or empty.
- kicker: a small label over the heading, up to 3 words ("Part two", "What you get", "The math"), or empty.
- surface: "ink" the video's own page (dark in the house look, light when the client's style or the look asked for
  is light), "paper" the opposite one for contrast, "accent" the accent color (at most once or twice a video, for
  the moment that matters most, and only for a heading or a stat: anything with more on it takes "ink"), "footage" the video itself blurred and darkened behind the words (overlay only).
- type: one look for the whole video: "editorial" a fine serif with italics, "grotesk" a modern sans, "condensed"
  tall poster capitals, "classic" a warm serif. When the video follows a style (a client's design system, or a
  website, screenshot or reel the person gave), pages are set in its fonts and colors whatever type says.
- marker: as above for a list; "dash" otherwise.
There is no button and no cursor: the page the video sits on has the real button.
Slop factors, which make graphics look cheap; never do any of these:
${slopRules()}
Never invent numbers, results or testimonials.
Choices: layout ${LONG_LAYOUTS.join(", ")}; block ${LONG_BLOCKS.join(", ")}; surface ${LONG_SURFACES.join(", ")};
type ${LONG_TYPES.join(", ")}; marker ${LONG_MARKERS.join(", ")}.`;
var LONG_BEAT_RULES = `Graphics: every graphic is a beat of kind "page". Anchor it on the word where its idea starts;
untilWordIndex = the first word after the speaker is done with it, so it stays while they still talk about it.
${LONG_PAGE_FIELDS}
Leave app as "messages", values empty, icons empty and sig empty. Captions are plain: leave highlights empty.`;
var LONG_GRAPHICS_RULES = `You plan the graphics of a long-form 16:9 talking-head video (a sales, welcome or thank-you page video)
from its finished script. Work in two steps, in this order.

1. sections: map the whole script, in order, into sections that together cover every word, each one idea:
   fromWordIndex and toWordIndex (inclusive), role, title (what it is about, up to 6 words), importance and named.
   roles: hook (the opening promise), story (an example, a student, the speaker's own), contrast (two kinds, this
   versus that, before and after), offer (the thing being sold or given, named), part (one part of the offer or of a
   method, a step, a bonus item; parent = the offer or method's section id), proof (a result, a number, a
   testimonial), bonus, objection, value (what it is worth), price, why (the reason behind it), cta (what to do
   now), close (the sign-off). parent = -1 unless the section is a part of another.
   importance: 3 = the viewer must remember it (the offer, every part of it, the price, the key contrast, the call to
   action), 2 = helps to see, 1 = plain talking.
   named: the things the section names that a viewer would want to see written (an offer's name, a part's name, the
   options, a number), each with the wordIndex where it is said and its text as said, lightly trimmed.

2. pages: the pages, from that map. Each page carries one or more consecutive sections (sectionIds) and stays on
   screen for all of them: it comes in at anchorWordIndex (inside its first section, on the word that names its idea)
   and leaves only when its last section ends. Pages never overlap and follow the script's order.
   - Every section of importance 3 is shown, on its own page or as an item on a page that spans it.
   - When the speaker names something and then walks through its parts (an offer and what is in it, a method and its
     steps, a call and what happens on it), one page carries it all: its heading the thing's name, its items the
     parts, each appearing on the word it is named (lineWordIndexes), staying up through every part. Over a long
     walkthrough, consecutive pages in the same layout and side may take turns (the parts, then one part's details);
     the speaker stays where they are between them.
   - A contrast is a compare page, often "aside" with one side each side of the speaker, or "split".
   - A big page (window, split, overlay, cutout) is for a stretch of 6 seconds or more; a shorter moment is "aside",
     or nothing.
   - Leave stories, warm-up and personal moments as plain talking, or "aside" at most: the speaker's face carries them.
   - About a third of the video or less carries a page; never two pages back to back that say the same thing.

${LONG_PAGE_FIELDS}`;

// features/video-ads/engine/cuts.ts
var FPS = 30;
var MIN_PIECE = 3 / FPS + 1e-3;

// features/video-ads/engine/stack.ts
var behindStackSpans = (stack, fps) => stack.filter((p) => p.behind).map((p) => ({ from: Math.floor(p.startMs / 1e3 * fps), to: Math.ceil(p.endMs / 1e3 * fps) }));

// features/video-ads/engine/effects.ts
var { width: W, height: H } = REEL_FRAME;
var FIGURE = { height: 680, minScale: 0.3, maxScale: 0.5, minFrames: 3 * FPS };
var EFFECT_HOLD = { word: Math.round(2.6 * FPS), shoulders: 6 * FPS, graph: 6 * FPS, tier: 12 * FPS, screen: 10 * FPS, split: 7 * FPS };
function behindSourceWindows(ads, pad = 6) {
  const spans = [];
  for (const ad of ads) {
    const behind = [
      ...ad.beats.filter((b) => b.placement === "behind" || b.placement === "figure").map((b) => ({ from: b.fromFrame, to: b.fromFrame + b.durationInFrames })),
      ...behindStackSpans(ad.stack ?? [], FPS)
    ];
    for (const span of behind) {
      const from = span.from - pad;
      const to = span.to + pad;
      for (const s of ad.segments) {
        const a = Math.max(from, s.outFromFrame);
        const b = Math.min(to, s.outFromFrame + s.durationInFrames);
        if (b > a) spans.push([Math.max(0, s.srcFromFrame + a - s.outFromFrame), s.srcFromFrame + b - s.outFromFrame]);
      }
    }
  }
  spans.sort((x, y) => x[0] - y[0]);
  const joined = [];
  for (const [a, b] of spans) {
    const last = joined.at(-1);
    if (last && a - last[1] < FPS) last[1] = Math.max(last[1], b);
    else joined.push([a, b]);
  }
  return joined;
}

// features/video-ads/server/cutout.ts
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, rename } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
var script = () => process.env.CUTOUT_SCRIPT || path.join(process.cwd(), "services/presentation-worker/cutout/cutout.py");
var python = () => process.env.CUTOUT_PYTHON || "python3";
var model = () => process.env.CUTOUT_MODEL || path.join(homedir(), ".cache/video-ad-cutout/rvm_mobilenetv3_fp32.onnx");
function run(command2, args2, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn(command2, args2, { signal, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    const err = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(Buffer.concat(out).toString());
      else reject(new Error(`${path.basename(command2)} failed (${code}): ${Buffer.concat(err).toString().slice(-500)}`));
    });
  });
}
async function frameSize(file, signal) {
  const out = await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height:stream_side_data=rotation", "-of", "json", file], signal);
  const stream = JSON.parse(out).streams?.[0];
  const turned = Math.abs(stream?.side_data_list?.find((d) => d.rotation !== void 0)?.rotation ?? 0) % 180 === 90;
  const width = Number(stream?.width);
  const height = Number(stream?.height);
  if (!width || !height) throw new Error("The take has no picture to cut the speaker out of.");
  return turned ? { width: height, height: width } : { width, height };
}
function onLongFrame(size, long) {
  const scale = long ? Math.min(1, LONG_FRAME.width / size.width, LONG_FRAME.height / size.height) : 1;
  const even = (n) => Math.max(2, Math.round(n * scale / 2) * 2);
  return scale === 1 ? size : { width: even(size.width), height: even(size.height) };
}
async function makeCutout(input) {
  const windows = behindSourceWindows(input.ads);
  if (!windows.length) return null;
  const key = createHash("sha256").update(JSON.stringify([input.sourceFile, windows])).digest("hex").slice(0, 16);
  const file = path.join(input.workDir, `cutout-${key}.webm`);
  if (existsSync(file)) return file;
  const make = async (note) => {
    if (!existsSync(model())) throw new Error("The matting model is not installed.");
    const size = onLongFrame(await frameSize(input.sourceFile, input.signal), input.ads.length > 0 && input.ads.every((ad) => ad.style === "long"));
    await mkdir(input.workDir, { recursive: true });
    const partial = `${file}.part.webm`;
    const out = await run(python(), ["-I", script(), model(), input.sourceFile, partial, String(size.width), String(size.height), JSON.stringify(windows)], input.signal);
    await rename(partial, file);
    const result = JSON.parse(out.trim().split("\n").at(-1) ?? "{}");
    note?.detail({ windows: windows.length, frames: result.matted, seconds: result.seconds });
    return file;
  };
  try {
    return input.log ? await input.log.step("cut out the speaker", make) : await make();
  } catch (error) {
    if (input.signal?.aborted) throw error;
    console.warn("[video-ads] The speaker could not be cut out; effects behind them render in front", error);
    return null;
  }
}

// features/video-ads/server/render.ts
import { createHash as createHash2, randomBytes } from "node:crypto";
import { createReadStream, existsSync as existsSync2 } from "node:fs";
import { readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { cpus } from "node:os";
import path2 from "node:path";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";

// features/video-ads/engine/threads.ts
var FFMPEG_THREADS = 2;
var cap = ["-threads", String(FFMPEG_THREADS)];
function capThreads(args2) {
  const capped = ["-filter_threads", String(FFMPEG_THREADS), "-filter_complex_threads", String(FFMPEG_THREADS)];
  args2.slice(0, -1).forEach((arg) => {
    if (arg === "-i") capped.push(...cap);
    capped.push(arg);
  });
  return [...capped, ...cap, ...args2.slice(-1)];
}

// features/video-ads/server/audio.ts
import { spawn as spawn2 } from "node:child_process";
function loudnormReport(args2, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn2("ffmpeg", ["-hide_banner", ...capThreads(args2)], { signal });
    let text = "";
    child.stderr.on("data", (chunk) => text += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`loudness pass failed (${code}): ${text.slice(-300)}`));
      resolve(JSON.parse(text.slice(text.lastIndexOf("{"), text.lastIndexOf("}") + 1)));
    });
  });
}
var loudness = (lufs) => `I=${lufs}:TP=-1.5:LRA=7`;
var VOICE_CLEANUP = "highpass=f=80,afftdn=nr=10:nf=-50:tn=1,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=200,deesser";
async function normalizeLoudness(input, output, signal, lufs = -11) {
  const LOUDNESS = loudness(lufs);
  const m = await loudnormReport(["-i", input, "-af", `${VOICE_CLEANUP},loudnorm=${LOUDNESS}:print_format=json`, "-f", "null", "-"], signal);
  const filter = `${VOICE_CLEANUP},loudnorm=${LOUDNESS}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true:print_format=json`;
  const applied = await loudnormReport(["-v", "info", "-y", "-i", input, "-c:v", "copy", "-af", filter, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart+negative_cts_offsets", "-use_editlist", "0", output], signal);
  return { integratedLufs: Number(applied.output_i) };
}

// features/video-ads/server/render-slots.ts
import { readFileSync } from "node:fs";
import { totalmem } from "node:os";
var GB = 1024 ** 3;
var PER_RENDER = 6 * GB;
var FRAME_CACHE_SHARE = 0.25;
function memoryLimit() {
  for (const [file, parse] of [
    ["/sys/fs/cgroup/memory.max", (text) => Number(text.trim())],
    ["/sys/fs/cgroup/memory/memory.limit_in_bytes", (text) => Number(text.trim())]
  ]) {
    try {
      const limit = parse(readFileSync(file, "utf8"));
      if (Number.isFinite(limit) && limit > 0 && limit < totalmem()) return limit;
    } catch {
    }
  }
  return totalmem();
}
function renderSlots(memory = memoryLimit()) {
  const configured = Number(process.env.VIDEO_AD_RENDER_SLOTS);
  if (Number.isInteger(configured) && configured > 0) return Math.min(configured, 8);
  return Math.max(1, Math.min(8, Math.floor(memory / PER_RENDER)));
}
function frameCacheBytes(memory = memoryLimit(), slots = renderSlots(memory)) {
  return Math.round(Math.min(2 * GB, memory / slots * FRAME_CACHE_SHARE));
}
var running = 0;
var waiting = [];
async function inRenderSlot(render2, signal) {
  const started = Date.now();
  if (running < renderSlots()) running++;
  else await new Promise((resolve, reject) => {
    const go = () => {
      signal?.removeEventListener("abort", stop);
      resolve();
    };
    const stop = () => {
      waiting.splice(waiting.indexOf(go), 1);
      reject(signal?.reason ?? new Error("Aborted"));
    };
    waiting.push(go);
    signal?.addEventListener("abort", stop, { once: true });
  });
  try {
    return { waitedMs: Date.now() - started, result: await render2() };
  } finally {
    const next = waiting.shift();
    if (next) next();
    else running--;
  }
}

// features/video-ads/server/qa.ts
import { spawn as spawn3 } from "node:child_process";

// features/video-ads/engine/framing.ts
var CAPTION_HALF = 50;
var LOWEST_CAPTION = 1550 - CAPTION_HALF;

// features/video-ads/engine/beats.ts
var APPS = {
  brand: "the advertiser's own product or business (a letter tile from the title)",
  messages: "a text message",
  mail: "an email",
  calendar: "a calendar invite or reminder",
  bank: "a bank",
  wallet: "a payment or card",
  chart: "stocks, analytics or growth",
  bell: "a generic alert",
  ai: "an AI assistant",
  video: "a video app",
  shop: "an online store or order",
  checklist: "a to-do list",
  notes: "a note",
  clock: "an alarm or timer",
  health: "health or fitness",
  home: "a home or property",
  star: "a review or rating",
  focus: "an iOS Focus such as Sleep or Do Not Disturb (for pills)"
};
var APP_IDS = Object.keys(APPS);
var MIN_HOLD = 2 * FPS;
var MAX_HOLD = 8 * FPS;
var MAX_SCENE_HOLD = 12 * FPS;
var LINE_STAGGER = Math.round(0.35 * FPS);
var LEAVE_EARLY = Math.round(0.04 * FPS);
var FILLER = new Set("a an the to of my your our in for and or i that this these from with on at is are be it what how you we they".split(" "));
var HOOK_FRAMES = Math.round(2.5 * FPS);
var EXTENDED_HOOK_FRAMES = Math.round(4.5 * FPS);

// features/video-ads/engine/reframe.ts
var OUT = { width: 1080, height: 1920 };
var SPLIT_GAP = 4;
var PANEL_HEIGHT = (OUT.height - SPLIT_GAP) / 2;

// features/video-ads/engine/qa.ts
function editListCount(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let count = 0;
  for (let at = 4; at + 4 <= bytes.length; at++) {
    if (bytes[at] !== 101 || bytes[at + 1] !== 108 || bytes[at + 2] !== 115 || bytes[at + 3] !== 116) continue;
    const size = view.getUint32(at - 4);
    if (size >= 16 && size < 4096) count++;
  }
  return count;
}

// features/video-ads/server/qa.ts
function run2(command2, args2, signal) {
  return new Promise((resolve, reject) => {
    const child = spawn3(command2, command2 === "ffmpeg" ? capThreads(args2) : args2, { signal, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => stdout += chunk.toString());
    child.stderr.on("data", (chunk) => stderr += chunk.toString());
    child.on("error", reject);
    child.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(`${command2} failed (${code}): ${stderr.slice(-300)}`)));
  });
}
async function measureRender(platform, file, bytes, signal) {
  const probe2 = JSON.parse((await run2("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate,pix_fmt,sample_rate", "-of", "json", file], signal)).stdout);
  const video = probe2.streams?.find((s) => s.codec_type === "video");
  const audio = probe2.streams?.find((s) => s.codec_type === "audio");
  const [num, den] = (video?.r_frame_rate ?? "0/1").split("/").map(Number);
  const { stderr } = await run2("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"], signal);
  const summary = stderr.slice(stderr.lastIndexOf("Summary:"));
  return {
    platform,
    videoCodec: video?.codec_name ?? "none",
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps: den ? num / den : 0,
    pixelFormat: video?.pix_fmt ?? "none",
    audioCodec: audio?.codec_name ?? "none",
    sampleRate: Number(audio?.sample_rate ?? 0),
    editLists: editListCount(bytes),
    durationSec: Number(probe2.format?.duration ?? 0),
    integratedLufs: Number(summary.match(/I:\s*(-?[\d.]+) LUFS/)?.[1] ?? NaN),
    truePeakDb: Number(summary.match(/Peak:\s*(-?[\d.]+) dBFS/)?.[1] ?? NaN)
  };
}

// features/video-ads/server/render.ts
var COMPOSITION_ID = "VideoAd";
var bundled = null;
function serveUrl() {
  const prebuilt = process.env.VIDEO_AD_COMPOSITION_DIR || path2.join(process.cwd(), "dist/video-ad-composition");
  if (existsSync2(path2.join(prebuilt, "index.html"))) return Promise.resolve(prebuilt);
  bundled ??= import("@remotion/bundler").then(({ bundle }) => bundle({
    entryPoint: path2.join(process.cwd(), "features/video-ads/composition/index.ts"),
    publicDir: path2.join(process.cwd(), "features/video-ads/composition/public")
  }));
  return bundled;
}
async function withLoopbackFiles(files, work) {
  const token = randomBytes(18).toString("hex");
  const sizes = new Map(await Promise.all(Object.entries(files).map(async ([name, file]) => [name, (await stat(file.path)).size])));
  const server = createServer((request, response) => {
    const name = request.url?.startsWith(`/${token}/`) ? decodeURIComponent(request.url.slice(token.length + 2)) : "";
    const file = files[name];
    const size = sizes.get(name);
    if (!file || size === void 0 || request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(404).end();
      return;
    }
    const range = /^bytes=(\d*)-(\d*)$/.exec(String(request.headers.range ?? ""));
    const start = range?.[1] ? Number(range[1]) : 0;
    const end = range?.[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (range && (start > end || start >= size)) {
      response.writeHead(416, { "content-range": `bytes */${size}` }).end();
      return;
    }
    response.writeHead(range ? 206 : 200, {
      "content-type": file.type,
      "accept-ranges": "bytes",
      "access-control-allow-origin": "*",
      "content-length": String(end - start + 1),
      ...range ? { "content-range": `bytes ${start}-${end}/${size}` } : {}
    });
    if (request.method === "HEAD") response.end();
    else createReadStream(file.path, { start, end }).on("error", () => response.destroy()).pipe(response);
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve());
  });
  try {
    const { port } = server.address();
    return await work(`http://127.0.0.1:${port}/${token}/`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(() => resolve()));
  }
}
function mediaType(bytes, declared) {
  const type = declared?.split(";")[0].trim().toLowerCase() ?? "";
  if (type.startsWith("image/") || type.startsWith("font/")) return type;
  const head = bytes.subarray(0, 16);
  if (head.subarray(0, 4).equals(Buffer.from([137, 80, 78, 71]))) return "image/png";
  if (head.subarray(0, 3).equals(Buffer.from([255, 216, 255]))) return "image/jpeg";
  if (head.toString("latin1", 0, 4) === "GIF8") return "image/gif";
  if (head.toString("latin1", 0, 4) === "RIFF" && head.toString("latin1", 8, 12) === "WEBP") return "image/webp";
  if (head.toString("latin1", 4, 12) === "ftypavif") return "image/avif";
  if (head.toString("latin1", 0, 4) === "wOF2") return "font/woff2";
  if (/^\s*(<\?xml[^>]*>\s*)?<svg/i.test(bytes.subarray(0, 512).toString("utf8"))) return "image/svg+xml";
  return null;
}
async function fetchAsset(url, name, workDir, files, signal) {
  try {
    const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(2e4)]) : AbortSignal.timeout(2e4) });
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    const type = mediaType(bytes, response.headers.get("content-type"));
    if (!type || bytes.byteLength > 15e6) return null;
    const file = path2.join(workDir, `brand-${name}`);
    await writeFile(file, bytes);
    files[name] = { path: file, type };
    return name;
  } catch (error) {
    if (signal?.aborted) throw error;
    console.warn(`[video-ads] Brand asset ${url} could not be downloaded`, error);
    return null;
  }
}
async function localChosenFonts(fonts, workDir, signal) {
  const files = {};
  if (!fonts) return { files, fonts: () => void 0 };
  const slots = ["caption", "hook"].filter((slot) => fonts[slot]);
  const got = await Promise.all(slots.map(async (slot) => {
    const font = fonts[slot];
    const [regular, bold] = await Promise.all([fetchAsset(font.url, `${slot}-font.woff2`, workDir, files, signal), font.bold ? fetchAsset(font.bold.url, `${slot}-font-bold.woff2`, workDir, files, signal) : null]);
    return { slot, font, regular, bold };
  }));
  return {
    files,
    fonts: (base) => Object.fromEntries(got.filter((g) => g.regular).map((g) => [g.slot, { ...g.font, url: base + g.regular, bold: g.font.bold && g.bold ? { ...g.font.bold, url: base + g.bold } : void 0 }]))
  };
}
async function localBrandAssets(brand, workDir, signal) {
  if (!brand) return { files: {}, brand: () => null };
  const files = {};
  const fetchTo = (url, name) => fetchAsset(url, name, workDir, files, signal);
  const [font, fontBold, body, bodyBold, ...images] = await Promise.all([
    brand.font ? fetchTo(brand.font.url, "font.woff2") : null,
    brand.font?.bold ? fetchTo(brand.font.bold.url, "font-bold.woff2") : null,
    brand.body ? fetchTo(brand.body.url, "body.woff2") : null,
    brand.body?.bold ? fetchTo(brand.body.bold.url, "body-bold.woff2") : null,
    ...brand.images.map((image, i) => fetchTo(image.url, `image-${i}`))
  ]);
  const local = (base, font2, file, bold) => {
    if (!font2 || !file) return null;
    return { ...font2, url: base + file, bold: font2.bold && bold ? { ...font2.bold, url: base + bold } : void 0 };
  };
  return {
    files,
    brand: (base) => ({
      ...brand,
      font: local(base, brand.font, font, fontBold),
      body: local(base, brand.body, body, bodyBold),
      // Images keep their positions, which image visuals refer to; one that failed shows as missing.
      images: brand.images.map((image, i) => ({ ...image, url: images[i] ? base + images[i] : "" }))
    })
  };
}
function renderConcurrency() {
  const configured = Number(process.env.VIDEO_AD_RENDER_CONCURRENCY);
  if (Number.isInteger(configured) && configured > 0) return Math.min(configured, 32);
  return Math.max(2, Math.min(8, Math.floor(cpus().length / 2 / renderSlots())));
}
async function renderVideoAd(input) {
  const url = await input.log.step("load composition", () => serveUrl());
  const brand = input.ads[0]?.edl.brand ?? null;
  const assets = brand ? await input.log.step("download brand assets", async (note) => {
    const local = await localBrandAssets(brand, input.workDir, input.signal);
    note.detail({ downloaded: Object.keys(local.files).length, wanted: [brand.font, brand.font?.bold, brand.body, brand.body?.bold].filter(Boolean).length + brand.images.length });
    return local;
  }) : await localBrandAssets(null, input.workDir);
  const chosen = await localChosenFonts(input.ads[0]?.edl.fonts, input.workDir, input.signal);
  const cutout = await makeCutout({ sourceFile: input.sourceFile, ads: input.ads.map((ad) => ad.edl), workDir: input.workDir, log: input.log, signal: input.signal });
  return withLoopbackFiles({ "take.mp4": { path: input.sourceFile, type: "video/mp4" }, ...cutoutFile(cutout), ...assets.files, ...chosen.files }, async (base) => {
    const results = [];
    for (const [n, ad] of input.ads.entries()) {
      const edl = { ...ad.edl, brand: assets.brand(base), ...ad.edl.fonts && { fonts: chosen.fonts(base) }, ...cutout && { cutout: `${base}cutout.webm` } };
      for (const platform of input.platforms) {
        results.push(await renderOne({ ...input, url, edl, platform, variant: ad.variant, base, label: n === 0 ? platform : `${ad.variant} ${platform}` }));
      }
    }
    return results;
  });
}
async function renderOne(input) {
  const { url, edl, platform } = input;
  const inputProps = { src: `${input.base}take.mp4`, edl, platform, guides: false };
  const raw = path2.join(input.workDir, `${input.variant}-${platform}.render.mp4`);
  const file = path2.join(input.workDir, `${input.variant}-${platform}.mp4`);
  await input.log.step(`render ${input.label}`, async (note) => {
    const composition = await selectComposition({ serveUrl: url, id: COMPOSITION_ID, inputProps, logLevel: "error" });
    const concurrency = input.lowMemory ? Math.max(1, Math.floor(renderConcurrency() / 4)) : renderConcurrency();
    const frameCache = frameCacheBytes();
    const { waitedMs } = await inRenderSlot(() => renderMedia({
      composition,
      serveUrl: url,
      codec: "h264",
      crf: 18,
      outputLocation: raw,
      inputProps,
      concurrency,
      // Remotion's own ffmpegs, decoding the take and encoding the frames, keep to the same thread cap.
      offthreadVideoThreads: FFMPEG_THREADS,
      offthreadVideoCacheSizeInBytes: frameCache,
      ffmpegOverride: ({ args: args2 }) => capThreads(args2),
      logLevel: "error",
      timeoutInMilliseconds: 12e4,
      browserExecutable: process.env.VIDEO_AD_BROWSER_EXECUTABLE || null,
      onProgress: ({ progress }) => input.onProgress?.(platform, progress),
      cancelSignal: input.signal ? signalToRemotion(input.signal) : void 0
    }), input.signal);
    note.detail({ frames: edl.durationInFrames, fps: edl.fps, concurrency, cpus: cpus().length, slots: renderSlots(), waitedMs, frameCacheMb: Math.round(frameCache / 1024 ** 2), graphics: edl.beats.length, bytes: (await stat(raw)).size });
  });
  const { integratedLufs } = await input.log.step(`loudness ${input.label}`, async (note) => {
    const result = await normalizeLoudness(raw, file, input.signal, loudnessOf(edl.style));
    note.detail({ integratedLufs: result.integratedLufs, bytes: (await stat(file)).size });
    return result;
  });
  const bytes = await readFile(file);
  const facts = await input.log.step(`check ${input.label} file`, async (note) => {
    const measured = await measureRender(platform, file, bytes, input.signal);
    note.detail({ codec: measured.videoCodec, size: `${measured.width}x${measured.height}`, editLists: measured.editLists, lufs: measured.integratedLufs, truePeak: measured.truePeakDb });
    return measured;
  });
  return {
    variant: input.variant,
    platform,
    file,
    byteSize: bytes.byteLength,
    sha256: createHash2("sha256").update(bytes).digest("hex"),
    durationSec: edl.durationInFrames / edl.fps,
    integratedLufs,
    facts
  };
}
var cutoutFile = (file) => file ? { "cutout.webm": { path: file, type: "video/webm" } } : {};
function signalToRemotion(signal) {
  return (callback) => {
    if (signal.aborted) callback();
    else signal.addEventListener("abort", callback, { once: true });
  };
}

// features/video-ads/server/run-log.ts
var RunLog = class {
  constructor(sink) {
    this.sink = sink;
    this.events = [];
  }
  /** Runs one step and records it, failed or not. A step that throws is recorded, then rethrown. */
  async step(step, work) {
    const startedAt = (/* @__PURE__ */ new Date()).toISOString();
    const started = performance.now();
    let usage2 = null;
    const detail = {};
    const note = {
      // A step that calls a model more than once (stills read in batches) adds them up, keeping the last call's ids.
      usage(reported) {
        const sum = (a, b) => a === null && b === null ? null : (a ?? 0) + (b ?? 0);
        usage2 = usage2 === null ? reported : {
          ...reported,
          inputTokens: sum(usage2.inputTokens, reported.inputTokens),
          outputTokens: sum(usage2.outputTokens, reported.outputTokens),
          reasoningTokens: sum(usage2.reasoningTokens, reported.reasoningTokens),
          cachedTokens: sum(usage2.cachedTokens, reported.cachedTokens),
          costUsd: usage2.costUsd === null || reported.costUsd === null ? null : usage2.costUsd + reported.costUsd
        };
      },
      detail(facts) {
        Object.assign(detail, facts);
      }
    };
    const finish = (status, message) => this.record({ step, status, startedAt, durationMs: Math.round(performance.now() - started), usage: usage2, detail, message });
    try {
      const result = await work(note);
      await finish("ok", null);
      return result;
    } catch (error) {
      await finish("failed", error instanceof Error ? error.message.slice(0, 2e3) : String(error).slice(0, 2e3));
      throw error;
    }
  }
  /** What the run has spent so far; `unpriced` counts model calls OpenRouter returned no cost for. */
  totals() {
    const calls = this.events.filter((e) => e.usage);
    return {
      costUsd: calls.reduce((sum, e) => sum + (e.usage?.costUsd ?? 0), 0),
      unpriced: calls.filter((e) => e.usage?.costUsd === null).length,
      modelCalls: calls.length
    };
  }
  // A sink that fails (the database is briefly unreachable) must never fail the edit it is recording.
  async record(event) {
    this.events.push(event);
    try {
      await this.sink(event);
    } catch (error) {
      console.error("[video-ads] Could not record a run step", event.step, error);
    }
  }
};

// scripts/local-render.ts
var here = path3.dirname(fileURLToPath(import.meta.url));
var CUTOUT_HOME = path3.join(homedir2(), ".infopros", "cutout");
var cutoutPython = () => process.platform === "win32" ? path3.join(CUTOUT_HOME, "Scripts", "python.exe") : path3.join(CUTOUT_HOME, "bin", "python");
var MODEL_URL = "https://github.com/PeterL1n/RobustVideoMatting/releases/download/v1.0.0/rvm_mobilenetv3_fp32.onnx";
var MODEL_SHA256 = "88d4531297118f595bf2fd60f6f566aec2e559393802d1f436c380f0cbbd2828";
var CUTOUT_PACKAGES = ["onnxruntime>=1.23.2,<2", "numpy>=2.3.4,<3"];
function run3(command2, args2, missing = "Install ffmpeg first.") {
  return new Promise((resolve, reject) => {
    const child = spawn4(command2, args2, { stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    const err = [];
    child.stdout.on("data", (chunk) => out.push(chunk));
    child.stderr.on("data", (chunk) => err.push(chunk));
    child.on("error", (error) => reject(new Error(`${command2} could not start (${error.message}). ${missing}`)));
    child.on("close", (code) => code === 0 ? resolve(Buffer.concat(out).toString()) : reject(new Error(`${command2} failed (${code}): ${Buffer.concat(err).toString().slice(-500)}`)));
  });
}
async function probe(file) {
  const parsed = JSON.parse(await run3("ffprobe", ["-v", "error", "-show_entries", "stream=codec_type,codec_name,width,height:stream_side_data=rotation", "-of", "json", file]));
  const video = parsed.streams?.find((s) => s.codec_type === "video");
  if (!video?.width || !video.height) throw new Error(`${file} has no video.`);
  const sideways = Math.abs(video.side_data_list?.find((d) => d.rotation !== void 0)?.rotation ?? 0) % 180 === 90;
  const audio = parsed.streams?.find((s) => s.codec_type === "audio");
  return { width: sideways ? video.height : video.width, height: sideways ? video.width : video.height, audio: audio?.codec_name ?? null };
}
async function makeProxy(original, out) {
  const facts = await probe(original);
  const size = proxySize(facts);
  const audio = facts.audio === null ? [] : facts.audio === "aac" ? ["-c:a", "copy"] : ["-c:a", "aac", "-b:a", "192k"];
  await run3("ffmpeg", [
    "-hide_banner",
    "-v",
    "error",
    "-y",
    "-i",
    original,
    "-map",
    "0:v:0",
    "-map",
    "0:a:0?",
    "-vf",
    `scale=${size.width}:${size.height}`,
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-pix_fmt",
    "yuv420p",
    ...audio,
    "-movflags",
    "+faststart",
    "-metadata",
    `comment=${proxyComment(facts)}`,
    out
  ]);
  console.log(JSON.stringify({ proxy: out, name: path3.basename(out), bytes: (await stat2(out)).size, original: { width: facts.width, height: facts.height }, size }));
}
var sha256 = (bytes) => createHash3("sha256").update(bytes).digest("hex");
async function setupCutout() {
  const needPython = "Install Python 3.10 or later first.";
  if (!existsSync3(cutoutPython())) {
    await mkdir2(path3.dirname(CUTOUT_HOME), { recursive: true });
    if (process.platform === "win32") await run3("py", ["-3", "-m", "venv", CUTOUT_HOME], needPython);
    else await run3("python3", ["-m", "venv", CUTOUT_HOME], needPython);
  }
  await run3(cutoutPython(), ["-m", "pip", "install", "--quiet", "--disable-pip-version-check", "--only-binary=:all:", ...CUTOUT_PACKAGES], needPython);
  const file = model();
  if (!existsSync3(file) || sha256(await readFile2(file)) !== MODEL_SHA256) {
    const response = await fetch(MODEL_URL);
    if (!response.ok) throw new Error(`The matting model could not be downloaded (${response.status}).`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (sha256(bytes) !== MODEL_SHA256) throw new Error("The matting model downloaded does not match its checksum.");
    await mkdir2(path3.dirname(file), { recursive: true });
    await writeFile2(file, bytes);
  }
  console.log(JSON.stringify({ cutout: "ready", python: cutoutPython(), model: file }));
}
async function ownVersion() {
  const file = path3.join(here, "version.json");
  return existsSync3(file) ? JSON.parse(await readFile2(file, "utf8")).version ?? null : null;
}
async function readEdit(from) {
  const text = /^https?:\/\//.test(from) ? await (await fetch(from).then((r) => r.ok ? r : Promise.reject(new Error(`The edit could not be downloaded (${r.status}). Ask for a fresh link.`)))).text() : await readFile2(from, "utf8");
  const parsed = JSON.parse(text);
  return "edl" in parsed ? parsed : { edl: parsed };
}
async function render(from, original, out) {
  process.env.VIDEO_AD_COMPOSITION_DIR ||= path3.join(here, "composition");
  process.env.CUTOUT_SCRIPT ||= path3.join(here, "cutout", "cutout.py");
  if (!process.env.CUTOUT_PYTHON && existsSync3(cutoutPython())) process.env.CUTOUT_PYTHON = cutoutPython();
  const edit = await readEdit(from);
  const own = await ownVersion();
  if (edit.kitVersion && own && edit.kitVersion !== own) {
    throw new Error(`This edit is for render kit ${edit.kitVersion}, and this computer's kit is ${own}. Update the InfoPros plugin (its local-editing skill carries the kit), install the kit again, then render again.`);
  }
  const needsCutout = behindSourceWindows([edit.edl]).length > 0;
  const platforms = edit.platforms?.length ? edit.platforms : ["meta"];
  await mkdir2(path3.dirname(out), { recursive: true });
  const workDir = await mkdtemp(path3.join(path3.dirname(out), ".infopros-render-"));
  const started = Date.now();
  let shown = -1;
  try {
    const log = new RunLog((event) => {
      if (event.status === "failed") console.error(`${event.step} failed: ${event.message}`);
    });
    const rendered = await renderVideoAd({
      sourceFile: original,
      ads: [{ variant: "hk01", edl: edit.edl }],
      platforms,
      workDir,
      log,
      onProgress: (platform, progress) => {
        const tenth = Math.floor(progress * 10);
        if (tenth > shown) console.error(`${platform}: ${tenth * 10}%`);
        shown = tenth;
      }
    });
    const files = [];
    for (const [i, video] of rendered.entries()) {
      const file = i === 0 ? out : out.replace(/(\.mp4)?$/i, `-${video.platform}.mp4`);
      await copyFile(video.file, file);
      files.push(file);
    }
    const main = rendered[0];
    const madeCutout = (await readdir(workDir)).some((name) => /^cutout-\w+\.webm$/.test(name));
    const cutout = !needsCutout ? "not needed" : madeCutout ? "made" : "missing: run setup-cutout once, then render again";
    console.log(JSON.stringify({ files, cutout, seconds: Math.round(main.durationSec * 10) / 10, bytes: main.byteSize, sha256: main.sha256, size: `${main.facts.width}x${main.facts.height}`, lufs: main.integratedLufs, renderSeconds: Math.round((Date.now() - started) / 1e3) }));
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
var [command, ...args] = process.argv.slice(2);
var usage = "usage: node render.mjs proxy <original> [<proxy.mp4>] | node render.mjs setup-cutout | node render.mjs render <edl.json|URL> <original> [<out.mp4>]";
try {
  if (command === "proxy" && args[0]) await makeProxy(args[0], args[1] ?? args[0].replace(/(\.[^./\\]+)?$/, "-proxy.mp4"));
  else if (command === "setup-cutout") await setupCutout();
  else if (command === "render" && args[0] && args[1]) await render(args[0], args[1], args[2] ?? args[1].replace(/(\.[^./\\]+)?$/, "-reel.mp4"));
  else {
    console.error(usage);
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
