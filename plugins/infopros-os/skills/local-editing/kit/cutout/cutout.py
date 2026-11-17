"""Cuts the speaker out of a take where something sits behind them, for the video ad editor (features/video-ads/server/cutout.ts).

usage: python -I cutout.py <model.onnx> <take.mp4> <out.webm> <width> <height> <windows>
windows: JSON [[from, to], ...] in source frames at 30 a second, sorted and apart.
Writes a VP9 video with alpha at 30 frames a second and the take's size, from the start of the take to the end of the
last window: the speaker kept and everything else transparent inside the windows, fully transparent outside them.
Uses Robust Video Matting (MobileNetV3, GPL-3.0 weights), which carries its state from frame to frame so edges stay
steady; each window starts a few frames early so that state has settled by the first frame that shows.
Prints one JSON line: frames matted and seconds taken.
"""
import json
import os
import subprocess
import sys
import time

import numpy as np
import onnxruntime as ort

model, source, out, width, height, windows = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5]), json.loads(sys.argv[6])
FPS = 30
WARM = 8
total = max(to for _, to in windows)
spans = [(max(0, a - WARM), b) for a, b in windows]

options = ort.SessionOptions()
options.intra_op_num_threads = int(os.environ.get("CUTOUT_THREADS", "4"))
options.inter_op_num_threads = 1
session = ort.InferenceSession(model, sess_options=options, providers=["CPUExecutionProvider"])
# The model reads a smaller copy for the whole figure and refines the edges at full size: about 512 px tall.
ratio = np.array([min(1.0, 512 / max(width, height))], dtype=np.float32)

decode = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-threads", "2", "-i", source, "-t", f"{total / FPS:.3f}", "-vf", f"fps={FPS},scale={width}:{height}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
    stdout=subprocess.PIPE,
)
encode = subprocess.Popen(
    ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{width}x{height}", "-r", str(FPS), "-i", "-",
     "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-auto-alt-ref", "0", "-deadline", "realtime", "-cpu-used", "8",
     "-row-mt", "1", "-threads", "2", "-crf", "30", "-b:v", "0", out],
    stdin=subprocess.PIPE,
)
blank = np.zeros((height, width, 4), dtype=np.uint8).tobytes()
size = width * height * 3
state = None
started = time.time()
matted = 0
for f in range(total):
    raw = decode.stdout.read(size)
    inside = any(a <= f < b for a, b in spans)
    if len(raw) < size or not inside:
        state = None
        encode.stdin.write(blank)
        continue
    rgb = np.frombuffer(raw, dtype=np.uint8).reshape(height, width, 3)
    src = (rgb.astype(np.float32) / 255).transpose(2, 0, 1)[None]
    if state is None:
        state = [np.zeros((1, 1, 1, 1), dtype=np.float32)] * 4
    fgr, pha, *state = session.run(None, {"src": src, "r1i": state[0], "r2i": state[1], "r3i": state[2], "r4i": state[3], "downsample_ratio": ratio})
    alpha = (np.clip(pha[0, 0], 0, 1) * 255).astype(np.uint8)
    encode.stdin.write(np.dstack([rgb, alpha]).tobytes())
    matted += 1
encode.stdin.close()
code = encode.wait()
decode.stdout.close()
decode.wait()
if code != 0:
    sys.exit(f"encoding the cutout failed ({code})")
print(json.dumps({"matted": matted, "seconds": round(time.time() - started, 1)}))
