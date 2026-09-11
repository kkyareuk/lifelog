"""Create pixel-preserving game assets; retain originals for saved URL compatibility."""
import io
import json
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FOLDERS = ('assets/', 'world-assets/', 'theme-assets/', 'shop-assets/')
paths = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
entries = []
for name in paths:
    if not name.startswith(FOLDERS) or Path(name).suffix.lower() not in ('.png', '.jpg', '.jpeg'):
        continue
    path = ROOT / name
    raw = path.read_bytes()
    with Image.open(io.BytesIO(raw)) as source:
        if getattr(source, 'n_frames', 1) != 1:
            continue
        rgba = source.convert('RGBA')
        buffer = io.BytesIO()
        rgba.save(buffer, 'WEBP', lossless=True, exact=True, method=6,
                  **({'icc_profile': source.info['icc_profile']} if 'icc_profile' in source.info else {}))
        encoded = buffer.getvalue()
        with Image.open(io.BytesIO(encoded)) as decoded:
            assert decoded.convert('RGBA').tobytes() == rgba.tobytes(), name
        target = path.with_suffix('.webp')
        if target.exists() and target.read_bytes() != encoded:
            target = path.with_name(path.stem + '-lossless.webp')
        target.write_bytes(encoded)
        entries.append(dict(source=name, webp=target.relative_to(ROOT).as_posix(),
                            originalBytes=len(raw), webpBytes=len(encoded),
                            preferred=len(encoded) < len(raw), width=rgba.width, height=rgba.height))
manifest = dict(mode='lossless-rgba-exact', assets=entries)
(ROOT / 'game-webp-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(json.dumps(dict(count=len(entries), originalBytes=sum(e['originalBytes'] for e in entries),
                     webpBytes=sum(e['webpBytes'] for e in entries),
                     preferredBytes=sum(min(e['originalBytes'], e['webpBytes']) for e in entries))))
