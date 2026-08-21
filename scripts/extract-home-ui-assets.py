from pathlib import Path
from collections import deque

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "design-sources" / "home-ui-sprite.png"
OUTPUT = ROOT / "assets" / "home-ui"

# The source sheet is kept as a design reference.  Each box includes a small
# transparent margin so the hand-drawn black edge is not clipped.
ASSETS = {
    "red-tape.png": (30, 1988, 312, 2120),
    "red-tape-wide.png": (326, 1988, 708, 2120),
}

# The drawings were exported on an off-white canvas.  Removing only pure white
# left a pale rectangular fringe around buttons in Android WebView.  Clear only
# near-white pixels connected to the crop edge so cream details enclosed by the
# black drawing (for example the arrow inside the back button) stay intact.
EXISTING_ASSETS_TO_CLEAN = ("back.png", "pill.png")


def clear_connected_canvas(pixels: np.ndarray) -> np.ndarray:
    height, width = pixels.shape[:2]
    rgb = pixels[:, :, :3].astype(np.int16)
    candidate = (rgb.min(axis=2) >= 222) & ((rgb.max(axis=2) - rgb.min(axis=2)) <= 24)
    connected = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        if candidate[0, x]:
            queue.append((0, x))
        if candidate[height - 1, x]:
            queue.append((height - 1, x))
    for y in range(height):
        if candidate[y, 0]:
            queue.append((y, 0))
        if candidate[y, width - 1]:
            queue.append((y, width - 1))
    while queue:
        y, x = queue.popleft()
        if connected[y, x] or not candidate[y, x]:
            continue
        connected[y, x] = True
        if y:
            queue.append((y - 1, x))
        if y + 1 < height:
            queue.append((y + 1, x))
        if x:
            queue.append((y, x - 1))
        if x + 1 < width:
            queue.append((y, x + 1))
    pixels[connected, 3] = 0
    return pixels


def transparent_crop(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    pixels = np.array(image.crop(box).convert("RGBA"))
    pixels = clear_connected_canvas(pixels)
    alpha = pixels[:, :, 3]
    rows, columns = np.where(alpha > 0)
    return Image.fromarray(pixels[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1])


image = Image.open(SOURCE)
OUTPUT.mkdir(parents=True, exist_ok=True)
for name, box in ASSETS.items():
    asset = transparent_crop(image, box)
    asset.save(OUTPUT / name)
    print(name, asset.size)

for name in EXISTING_ASSETS_TO_CLEAN:
    path = OUTPUT / name
    if not path.exists():
        continue
    pixels = clear_connected_canvas(np.array(Image.open(path).convert("RGBA")))
    Image.fromarray(pixels).save(path)
    print(name, Image.open(path).size)
