from pathlib import Path

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


def transparent_crop(image: Image.Image, box: tuple[int, int, int, int]) -> Image.Image:
    pixels = np.array(image.crop(box).convert("RGBA"))
    nearly_white = np.all(pixels[:, :, :3] > 247, axis=2)
    pixels[nearly_white, 3] = 0
    alpha = pixels[:, :, 3]
    rows, columns = np.where(alpha > 0)
    return Image.fromarray(pixels[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1])


image = Image.open(SOURCE)
OUTPUT.mkdir(parents=True, exist_ok=True)
for name, box in ASSETS.items():
    asset = transparent_crop(image, box)
    asset.save(OUTPUT / name)
    print(name, asset.size)
