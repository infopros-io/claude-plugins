# Word timings on the person's computer, for local editing when OS can't transcribe (docs/local-editing.md): a small
# Whisper model (faster-whisper, "base" by default, about 150 MB, downloaded once to the Hugging Face cache) on the
# CPU. Writes the words as OS's transcribe tool does (words.json: text, start, end, confidence). The render kit ships
# it as whisper/transcribe.py and render.mjs transcribe runs it in ~/.infopros/whisper.
# The sound comes in as 16 kHz mono 32-bit floats (render.mjs decodes it with ffmpeg), so no audio library is needed.
# usage: python transcribe.py <sound.f32> <words.json> [model] [language]
import json
import sys

import numpy as np

from faster_whisper import WhisperModel


def main() -> None:
    source, out = sys.argv[1], sys.argv[2]
    size = sys.argv[3] if len(sys.argv) > 3 and sys.argv[3] else "base"
    language = sys.argv[4] if len(sys.argv) > 4 and sys.argv[4] else None
    model = WhisperModel(size, device="cpu", compute_type="int8")
    audio = np.fromfile(source, dtype=np.float32)
    segments, info = model.transcribe(audio, language=language, word_timestamps=True, vad_filter=False, beam_size=5)
    words = []
    for segment in segments:
        for word in segment.words or []:
            text = word.word.strip()
            if text:
                words.append({"text": text, "start": round(word.start, 3), "end": round(word.end, 3), "confidence": round(word.probability, 3)})
    with open(out, "w", encoding="utf-8") as handle:
        json.dump(words, handle)
    print(json.dumps({"words": len(words), "language": info.language, "seconds": round(info.duration, 1), "model": size, "file": out}))


if __name__ == "__main__":
    main()
