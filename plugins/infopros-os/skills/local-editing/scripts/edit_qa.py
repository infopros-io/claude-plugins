"""Sound-first checks and fixes for local edits (the local editing SOP, steps 4, 10 and 11).

  pauses  <recording> [--from S] [--to S]   real pauses (>=150 ms under -45 dB) and the cut points to use
  lut     <log clip> --at S --neutral X,Y,W,H <out.cube>   S-Log3 to Rec.709 grade, white-balanced off a neutral surface
  skin    <file> --at S[,S..] [--lut F] [--box X,Y,W,H] [--neutral X,Y,W,H]   skin and neutral in Lab
  resound <work> <rendered.mp4> <out.mp4>  rebuild the speech audio from the take (as the approved rebuild did, without
                                           the kit's voice cleanup): crossfades through room tone at every cut, bleeps
  sound   <work> <final.mp4>               the sound gate: holes, chopped tails, join gaps, room tone, loudness, sync
  cuts    <work> <final.mp4> [--model F]   the picture audit per cut: face jump, pose change, transitions, punch-ins

Needs ffmpeg and ffprobe, and Python 3.10+ with numpy (opencv-python-headless too for skin without --box, and cuts).
Exit code 1 means a check failed; the lines marked FAIL say which."""
import argparse, json, os, subprocess, sys, urllib.request
import numpy as np

SR = 48000
YUNET = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"


def run(cmd, data=None):
    return subprocess.run(cmd, input=data, capture_output=True, check=True).stdout


def decode(f, t0=None, dur=None, ch=1):
    cmd = ["ffmpeg", "-v", "error", *(["-ss", f"{t0:.4f}"] if t0 is not None else []), *(["-t", f"{dur:.4f}"] if dur else []),
           "-i", f, "-map", "0:a:0", "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(run(cmd), np.float32)
    return x.reshape(-1, ch).copy() if ch > 1 else x.copy()


def levels(x, ms):  # dBFS of consecutive windows of `ms`
    w = int(SR * ms / 1000); n = len(x) // w
    return 20 * np.log10(np.sqrt(np.mean(x[:n * w].reshape(n, w) ** 2, 1)) + 1e-9)


def runs(mask):  # [start, end) index pairs of True runs
    d = np.diff(np.r_[0, mask.astype(np.int8), 0]); return list(zip(np.flatnonzero(d == 1), np.flatnonzero(d == -1)))


def duration(f, kind):
    out = run(["ffprobe", "-v", "error", "-select_streams", f"{kind}:0", "-show_entries", "stream=duration", "-of", "csv=p=0", f]).decode().strip()
    return float(out) if out and out != "N/A" else float(run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]))


def loudness(f):
    err = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    return json.loads(err[err.rindex("{"):err.rindex("}") + 1])


def work_edit(work):
    edl = json.load(open(os.path.join(work, "edit.json")))["edl"]
    job = json.load(open(os.path.join(work, "job.json")))
    return edl, job["original"]


def frame_rgb(f, t, lut=None, box=None):
    raw = run(["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", f, "-frames:v", "1", *(["-vf", f"lut3d='{lut}'"] if lut else []),
               "-f", "rawvideo", "-pix_fmt", "rgb48le", "-"])
    w, h = [int(v) for v in run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
                                 "-of", "csv=p=0", f]).decode().split(",")[:2]]
    img = np.frombuffer(raw, np.uint16).reshape(h, w, 3).astype(np.float64) / 65535
    return img[box[1]:box[1] + box[3], box[0]:box[0] + box[2]] if box else img  # cropped here: ffmpeg rounds odd crops


def lab(rgb):  # display Rec.709 (gamma 2.4) -> CIE Lab D65
    lin = np.clip(rgb, 0, 1) ** 2.4
    xyz = lin @ np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]]).T / [0.95047, 1.0, 1.08883]
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L, a, b = 116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])
    return float(np.median(L)), float(np.median(a)), float(np.median(b))


def box_arg(s):
    return [int(v) for v in s.split(",")] if s else None


def face_model(path):
    path = path or (os.path.join(os.environ["REFRAME_DIR"], "face_detection_yunet_2023mar.onnx") if os.environ.get("REFRAME_DIR") else None)
    if path and os.path.exists(path): return path
    path = os.path.join(".infopros", "models", "face_detection_yunet_2023mar.onnx")
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True); urllib.request.urlretrieve(YUNET, path)
    return path


def faces(img_bgr, model):
    import cv2
    cv2.utils.logging.setLogLevel(cv2.utils.logging.LOG_LEVEL_ERROR)
    h, w = img_bgr.shape[:2]; d = cv2.FaceDetectorYN.create(model, "", (w, h), 0.6); _, f = d.detect(img_bgr)
    return None if f is None or not len(f) else max(f, key=lambda r: r[2] * r[3])[:4]


# ---------------------------------------------------------------- pauses
def cmd_pauses(a):
    x = decode(a.file, a.start, (a.end - a.start) if a.end else None); t0 = a.start or 0
    lv = levels(x, 5); quiet = lv < a.floor
    gaps = [(s, e) for s, e in runs(quiet) if (e - s) * 5 >= a.min_ms and s > 0 and e < len(lv)]
    if not gaps: print("No real pauses: never join this stretch."); return 0
    print(f"{len(gaps)} real pauses (>= {a.min_ms:.0f} ms under {a.floor:.0f} dB). Join only here; a join keeps "
          f"{a.tail * 1000:.0f} ms after the outgoing word and {a.pre * 1000:.0f} ms before the incoming one.")
    print("speech ends  speech starts  pause ms  cut out at  cut in at")
    for s, e in gaps:
        end, start = t0 + s * 0.005, t0 + e * 0.005
        print(f"{end:11.3f}  {start:13.3f}  {(e - s) * 5:8.0f}  {end + a.tail:10.3f}  {start - a.pre:9.3f}")
    return 0


# ---------------------------------------------------------------- grade
M709 = np.array([[1.6269474, -0.5401385, -0.0868089], [-0.1785155, 1.4179409, -0.2394254], [-0.0444361, -0.1959199, 1.2403560]])


def slog3_lin(x):
    c = x * 1023.0
    return np.where(c >= 171.2102946929, (10 ** ((c - 420.0) / 261.5)) * 0.19 - 0.01, (c - 95.0) * 0.01125 / (171.2102946929 - 95.0))


def to_display(log_rgb, gains, contrast):
    lin = np.maximum(slog3_lin(log_rgb) @ M709.T, 0) * gains
    A, B, C, D, E, F = 0.22, 0.30, 0.10, 0.20, 0.01, 0.30
    h = lambda v: ((v * (A * v + C * B) + D * E) / (v * (A * v + B) + D * F)) - E / F
    disp = np.clip(h(lin * 4.0) / h(11.2), 0, 1) ** (1 / 2.4)
    return np.clip(0.5 + (disp - 0.5) * contrast, 0, 1)


def cmd_lut(a):
    patch = frame_rgb(a.file, a.at, box=box_arg(a.neutral)).reshape(-1, 3)
    lin = np.maximum(slog3_lin(np.median(patch, 0)) @ M709.T, 1e-6)
    gains = (lin[1] / lin) ** a.strength  # green stays, red and blue move toward it
    before = lab(to_display(np.median(patch, 0)[None], np.ones(3), 1.0))
    after = lab(to_display(np.median(patch, 0)[None], gains, a.contrast))
    g = np.linspace(0, 1, 33); b, gg, r = np.meshgrid(g, g, g, indexing="ij")
    disp = to_display(np.stack([r, gg, b], -1).reshape(-1, 3), gains, a.contrast)
    with open(a.out, "w") as f:
        f.write(f'TITLE "slog3-709 wb{int(a.strength * 100)} c{int(a.contrast * 100)}"\nLUT_3D_SIZE 33\n')
        f.writelines(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n" for v in disp)
    print(f"Wrote {a.out}. Neutral a*/b*: {before[1]:+.1f}/{before[2]:+.1f} without balance, {after[1]:+.1f}/{after[2]:+.1f} with it "
          f"(gains R {gains[0]:.3f} B {gains[2]:.3f}). Now run `skin` with --lut on a frame of the face.")
    return 0


def cmd_skin(a):
    bad = 0
    for t in [float(v) for v in a.at.split(",")]:
        img = frame_rgb(a.file, t, a.lut)
        box = box_arg(a.box)
        if not box:
            f = faces((img[..., ::-1] * 255).astype(np.uint8), face_model(a.model))
            if f is None: print(f"{t:.2f}s: no face found; pass --box"); bad = 1; continue
            x, y, w, h = [int(v) for v in f]; box = [x + w // 5, y + h // 2, w * 3 // 5, h // 5]  # cheeks and nose, under the eyes
        x, y, w, h = box; L, A, B = lab(img[y:y + h, x:x + w].reshape(-1, 3)); C = float(np.hypot(A, B))
        aim = 60 <= L <= 70 and 18 <= C <= 24; ok = 58 <= L <= 72 and 16 <= C <= 26  # the aim, and the gate with a margin
        bad |= not ok
        if aim: verdict = "ok"
        elif ok: verdict = "near the aim"
        else: verdict = "FAIL"
        line = (f"{t:.2f}s skin L* {L:.0f} a* {A:.1f} b* {B:.1f} chroma {C:.1f}: {verdict}"
                " (light-medium skin: L* 60-70, chroma 18-24)")
        if a.neutral:  # information: a 60% balance leaves a little of the cast on purpose
            nx, ny, nw, nh = box_arg(a.neutral); _, na, nb = lab(img[ny:ny + nh, nx:nx + nw].reshape(-1, 3))
            line += f"; neutral a*/b* {na:+.1f}/{nb:+.1f}"
        print(line)
    return int(bad)


# ---------------------------------------------------------------- resound
def cmd_resound(a):
    edl, original = work_edit(a.work)
    if edl.get("sfx") or edl.get("music"):
        print("FAIL: this edit has sound effects or music; resound rebuilds speech only. Use energy light or natural."); return 1
    fps, segs = edl["fps"], edl["segments"]
    aud = decode(original, ch=2); h = int(a.xfade / 2 * SR)
    t = np.linspace(0, np.pi / 2, 2 * h)[:, None]; fo, fi = np.cos(t), np.sin(t)  # equal power
    out = None
    for k, s in enumerate(segs):
        i0 = int(round(s["srcFromFrame"] / fps * SR)); n = int(round(s["durationInFrames"] / fps * SR))
        lo, hi = i0 - (h if k else 0), i0 + n + (h if k < len(segs) - 1 else 0)
        piece = aud[max(lo, 0):hi]
        if lo < 0: piece = np.vstack([np.zeros((-lo, 2), np.float32), piece])
        if len(piece) < hi - lo: piece = np.vstack([piece, np.zeros((hi - lo - len(piece), 2), np.float32)])
        if out is None: out = piece.copy(); continue
        out[-2 * h:] = out[-2 * h:] * fo + piece[:2 * h] * fi
        out = np.vstack([out, piece[2 * h:]])
    for m in edl.get("mutes", []):  # the kit mutes a swear to silence; a bleep keeps it audible
        s, e = int(m["fromFrame"] / fps * SR), int(m["toFrame"] / fps * SR); r = int(0.005 * SR); n = e - s
        if n <= 2 * r: continue
        g = np.r_[np.linspace(0, 1, r), np.ones(n - 2 * r), np.linspace(1, 0, r)][:, None]
        out[s:e] = out[s:e] * (1 - g) + 0.08 * np.sin(2 * np.pi * 1000 * np.arange(n) / SR)[:, None] * g
    L = int(round(duration(a.rendered, "v") * SR)); out = np.vstack([out[:L], np.zeros((max(0, L - len(out)), 2), np.float32)])
    fa, fz = int(0.010 * SR), int(0.080 * SR); out[:fa] *= np.linspace(0, 1, fa)[:, None]; out[-fz:] *= np.linspace(1, 0, fz)[:, None]
    wav = a.out + ".wav"
    run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", wav], out.astype(np.float32).tobytes())
    m = loudness(wav)
    af = (f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}"
          f":measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample={SR}")
    run(["ffmpeg", "-v", "error", "-y", "-i", a.rendered, "-i", wav, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-af", af,
         "-c:a", "aac", "-b:a", "256k", "-ar", str(SR), "-shortest", "-movflags", "+faststart", a.out])
    os.remove(wav)
    print(f"Wrote {a.out}: {len(segs) - 1} cuts crossfaded over {a.xfade * 1000:.0f} ms, {len(edl.get('mutes', []))} bleeps. Run `sound` on it.")
    return 0


# ---------------------------------------------------------------- sound gate
def raw_pause(original, t, floor):  # ms of the real pause around source time t, 0 when t is inside a word
    x = decode(original, max(t - 1.5, 0), 3.0); lv = levels(x, 5); i = int((t - max(t - 1.5, 0)) / 0.005)
    if i >= len(lv) or lv[i] >= floor: return 0
    s = i; e = i
    while s > 0 and lv[s - 1] < floor: s -= 1
    while e < len(lv) - 1 and lv[e + 1] < floor: e += 1
    return (e - s + 1) * 5


def cmd_sound(a):
    edl, original = work_edit(a.work); fps, segs = edl["fps"], edl["segments"]
    cuts = [s["outFromFrame"] / fps for s in segs[1:]]
    x = decode(a.final); fails = []
    # 0. every cut sits in a real pause of the raw take, on both sides (>= 150 ms under -45 dB)
    for k in range(1, len(segs)):
        out_t = (segs[k - 1]["srcFromFrame"] + segs[k - 1]["durationInFrames"]) / fps; in_t = segs[k]["srcFromFrame"] / fps
        if 0 <= in_t - out_t < 0.1: continue  # removes almost nothing: the speech runs on as recorded, not a join
        po, pi = raw_pause(original, out_t, a.floor), raw_pause(original, in_t, a.floor)
        for side, ms, t in (("outgoing", po, out_t), ("incoming", pi, in_t)):
            if ms >= a.min_ms: continue
            found = f"only {ms} ms of pause" if ms else "no pause, the cut is inside a word"
            fails.append(f"join {cuts[k - 1]:.2f}s: the {side} take has {found} at raw {t:.2f}s; the speaker runs on there, so join elsewhere")
    l1 = levels(x, 1); l5 = levels(x, 5)
    loud = np.flatnonzero(l5 > -40); s0, s1 = (loud[0] * 5, loud[-1] * 5 + 5) if len(loud) else (0, len(l1))
    # 1. holes: 1 ms windows under -70 dB inside speech. Room tone never goes that low.
    holes = []
    for s, e in runs(l1 < -70):
        if s < s0 or e > s1: continue
        if holes and s - holes[-1][1] < 5: holes[-1] = (holes[-1][0], e)
        else: holes.append((s, e))
    for s, e in holes: fails.append(f"hole {s / 1000:.3f}s, {e - s} ms of digital silence")
    # 2. chopped tails: speech (> -30 dB) within 10 ms of a hole, or a level cliff (a 30 dB drop within 3 ms)
    for s, e in holes:
        if l1[max(0, s - 10):s].max(initial=-120) > -30: fails.append(f"chopped tail into the hole at {s / 1000:.3f}s")
        if l1[e:e + 10].max(initial=-120) > -30: fails.append(f"chopped onset out of the hole at {s / 1000:.3f}s")
    drop = np.array([l1[i + 3:i + 8].max() for i in range(len(l1) - 8)])  # stays down for 5 ms, so not a plosive
    for i in np.flatnonzero((l1[:len(drop)] > -30) & (drop < l1[:len(drop)] - 30)):
        if s0 <= i <= s1 and not any(s - 12 <= i <= s for s, _ in holes): fails.append(f"chopped word at {i / 1000:.3f}s (level cliff)")
    # 3. gaps and room tone at joins, against the speaker's own pauses kept inside takes
    floor = np.percentile(l5[s0 // 5:s1 // 5], 10); thr = floor + 9
    pauses = [(s * 0.005, e * 0.005) for s, e in runs(l5 < thr) if 0.12 <= (e - s) * 0.005 <= 1.5 and s * 5 > s0 and e * 5 < s1]
    inside = [e - s for s, e in pauses if not any(s - 0.03 <= c <= e + 0.03 for c in cuts)]
    natural = float(np.median(inside)) if inside else 0.24
    rows = []
    for c in cuts:
        p = next(((s, e) for s, e in pauses if s - 0.03 <= c <= e + 0.03), None)
        gap = (p[1] - p[0]) if p else 0.0
        if abs(gap - natural) > 0.06: fails.append(f"join {c:.2f}s: gap {gap * 1000:.0f} ms vs natural {natural * 1000:.0f} ms")
        side = lambda lo, hi: l5[int(lo / 0.005):int(hi / 0.005)]
        qb = side(p[0], c - 0.015) if p else np.array([]); qa = side(c + 0.015, p[1]) if p else np.array([])
        qb, qa = qb[qb > -70], qa[qa > -70]  # room tone only, not the hole
        delta = float(np.median(qa) - np.median(qb)) if len(qb) >= 2 and len(qa) >= 2 else None
        if delta is not None and abs(delta) > 3: fails.append(f"join {c:.2f}s: room tone {delta:+.1f} dB across the cut")
        rows.append(f"join {c:6.2f}s  gap {gap * 1000:4.0f} ms  room tone {'n/a (cut at the edge of the pause)' if delta is None else f'{delta:+.1f} dB'}")
    # 4. each muted swear is bleeped, not silent
    for m in edl.get("mutes", []):
        lo, hi = m["fromFrame"] / fps, m["toFrame"] / fps
        if l5[int(lo / 0.005) + 2:int(hi / 0.005) - 2].mean() < -35: fails.append(f"swear at {lo:.2f}s is muted to silence, not bleeped (run resound)")
    # 5. loudness and sync
    m = loudness(a.final); I, TP = float(m["input_i"]), float(m["input_tp"])
    if abs(I + 14) > 1: fails.append(f"loudness {I:.1f} LUFS (target -14)")
    if TP > -1: fails.append(f"true peak {TP:.1f} dBTP (max -1)")
    da, dv = duration(a.final, "a"), duration(a.final, "v")
    if abs(da - dv) > 1.0 / fps: fails.append(f"audio {da:.3f}s vs video {dv:.3f}s")
    print("\n".join(rows))
    print(f"natural pause {natural * 1000:.0f} ms; {I:.1f} LUFS, {TP:.1f} dBTP; audio {da:.2f}s, video {dv:.2f}s")
    print("\n".join(f"FAIL {f}" for f in fails) if fails else "PASS: no holes, no chopped words, joins match his pauses and room tone.")
    return int(bool(fails))


# ---------------------------------------------------------------- picture audit
def cmd_cuts(a):
    import cv2
    edl, _ = work_edit(a.work); fps, segs = edl["fps"], edl["segments"]; model = face_model(a.model)
    trans = {t["atFrame"]: t["kind"] for t in edl.get("transitions", [])}
    motion = edl.get("motion") or {}
    push_ends = {p["fromFrame"] + p["durationInFrames"] for p in motion.get("pushes", []) if abs(p.get("scale", 1) - 1) > 0.01}
    vw, vh = (360, 640) if edl.get("height", 1920) > edl.get("width", 1080) else (640, 360)

    def grab(t, n):
        raw = run(["ffmpeg", "-v", "error", "-ss", f"{max(0, t):.3f}", "-i", a.final, "-frames:v", str(n), "-vf", f"scale={vw}:{vh}",
                   "-f", "rawvideo", "-pix_fmt", "bgr24", "-"])
        return np.frombuffer(raw, np.uint8).reshape(-1, vh, vw, 3)
    os.makedirs(a.out, exist_ok=True); fails = []; print("cut   time   face jump  size  pose  transition")
    for k in range(1, len(segs)):
        at = segs[k]["outFromFrame"]; t = at / fps
        before, after = grab(t - 4 / fps, 4), grab(t, 4)
        if len(before) < 4 or len(after) < 4: continue
        normal = max(np.mean([np.abs(f[i + 1].astype(float) - f[i].astype(float)).mean() for f in (before, after) for i in range(3)]), 0.5)
        pose = np.abs(before[-1].astype(float) - after[0].astype(float)).mean() / normal
        fa, fb, settled = faces(before[-1], model), faces(after[0], model), faces(after[2], model)  # settled: 2 frames on
        jump = size = None
        if fa is not None and settled is not None:
            jump = 100 * np.hypot(fa[0] + fa[2] / 2 - settled[0] - settled[2] / 2, fa[1] + fa[3] / 2 - settled[1] - settled[3] / 2) / fa[2]
            size = 100 * abs(settled[2] - fa[2]) / fa[2]
        tr = trans.get(at, "") + (" push-in ends here" if at in push_ends else "")
        flags = []
        if tr.strip(): flags.append(f"transition/zoom at the cut ({tr.strip()})")
        if size is not None and size >= 8 and fb is not None and abs(fb[2] - fa[2]) / fa[2] < 0.04:
            flags.append("the punch-in lands a frame or two after the cut, so the new take flashes at the old framing first")
        if size is not None and size < 8 and segs[k]["srcFromFrame"] != segs[k - 1]["srcFromFrame"] + segs[k - 1]["durationInFrames"]:
            flags.append(f"framing changes only {size:.0f}% (want 10-15%: alternate 100/110%)")
        if jump is not None and jump > 10 and (size or 0) < 8: flags.append(f"face jumps {jump:.0f}% with no punch-in")
        if pose > 3 and (size or 0) < 8: flags.append(f"pose changes {pose:.1f}x the normal frame change")
        print(f"{k:3d}  {t:6.2f}s  {'-' if jump is None else f'{jump:5.0f}%'}  {'-' if size is None else f'{size:4.0f}%'}  {pose:4.1f}  {tr or '-'}")
        if flags:
            fails += [f"cut {k} at {t:.2f}s: {f}" for f in flags]
            cv2.imwrite(os.path.join(a.out, f"cut{k:02d}.jpg"), np.hstack([before[-1], np.full((vh, 6, 3), 255, np.uint8), after[0]]))
    print("\n".join(f"FAIL {f}" for f in fails) if fails else "PASS: straight cuts, every take change reframed.")
    if fails: print(f"Look at {a.out}/cut*.jpg (before | after), then listen to every join.")
    return int(bool(fails))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter); sub = p.add_subparsers(dest="cmd", required=True)
    q = sub.add_parser("pauses"); q.add_argument("file"); q.add_argument("--from", dest="start", type=float); q.add_argument("--to", dest="end", type=float)
    q.add_argument("--min-ms", type=float, default=150); q.add_argument("--floor", type=float, default=-45)
    q.add_argument("--tail", type=float, default=0.12); q.add_argument("--pre", type=float, default=0.11)
    q = sub.add_parser("lut"); q.add_argument("file"); q.add_argument("out"); q.add_argument("--at", type=float, required=True)
    q.add_argument("--neutral", required=True); q.add_argument("--strength", type=float, default=0.6); q.add_argument("--contrast", type=float, default=1.06)
    q = sub.add_parser("skin"); q.add_argument("file"); q.add_argument("--at", required=True); q.add_argument("--lut"); q.add_argument("--box")
    q.add_argument("--neutral"); q.add_argument("--model")
    q = sub.add_parser("resound"); q.add_argument("work"); q.add_argument("rendered"); q.add_argument("out"); q.add_argument("--xfade", type=float, default=0.06)
    q = sub.add_parser("sound"); q.add_argument("work"); q.add_argument("final")
    q.add_argument("--min-ms", type=float, default=150); q.add_argument("--floor", type=float, default=-45)
    q = sub.add_parser("cuts"); q.add_argument("work"); q.add_argument("final"); q.add_argument("--model"); q.add_argument("--out", default=None)
    a = p.parse_args()
    if a.cmd == "pauses" and a.start is None: a.start = 0.0
    if a.cmd == "cuts" and not a.out: a.out = os.path.join(a.work, "cut-audit")
    sys.exit({"pauses": cmd_pauses, "lut": cmd_lut, "skin": cmd_skin, "resound": cmd_resound, "sound": cmd_sound, "cuts": cmd_cuts}[a.cmd](a))


if __name__ == "__main__":
    main()
