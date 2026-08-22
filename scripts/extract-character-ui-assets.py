"""Extract the exact raster pieces referenced by the character-screen SVG.

The Figma SVG embeds a 4096x2654 transparent sprite sheet and samples each
piece through SVG patterns.  These crop boxes are the inverse of those pattern
matrices, so the exported PNGs are pixel-identical to the supplied design.
"""

from __future__ import annotations

import base64
import io
import re
import sys
from pathlib import Path

from PIL import Image


def crop(image: Image.Image, box: tuple[int, int, int, int], *, flip=False) -> Image.Image:
    piece = image.crop(box)
    return piece.transpose(Image.Transpose.FLIP_LEFT_RIGHT) if flip else piece


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract-character-ui-assets.py <character.svg> <output-dir>")
    svg_path, output_dir = Path(sys.argv[1]), Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    source = svg_path.read_text(encoding="utf-8")
    payloads = re.findall(r'<image[^>]+href="data:image/png;base64,([^\"]+)', source)
    if len(payloads) < 3:
        raise SystemExit("character SVG did not contain the expected embedded PNGs")
    sheets = [Image.open(io.BytesIO(base64.b64decode(value))).convert("RGBA") for value in payloads[:3]]

    crops = {
        "paper.png": (sheets[0], (2752, 142, 3958, 1948), False),
        "wallet.png": (sheets[1], (1280, 103, 2701, 1073), False),
        "registration-card.png": (sheets[1], (1368, 1130, 1944, 1489), False),
        "ribbon-profile.png": (sheets[1], (1324, 1559, 2445, 1678), False),
        "ribbon-body.png": (sheets[1], (1327, 1742, 2437, 1860), True),
        "ribbon-personality.png": (sheets[1], (1328, 1921, 2449, 2040), False),
        "ribbon-taste.png": (sheets[1], (1325, 2092, 2446, 2211), False),
        "ribbon-world.png": (sheets[1], (1314, 2267, 2440, 2387), True),
        "ribbon-manage.png": (sheets[1], (1305, 2456, 2427, 2575), False),
        "add.png": (sheets[2], (47, 1877, 271, 2101), False),
        "back.png": (sheets[2], (359, 1273, 583, 1496), False),
    }
    for filename, (image, box, flip) in crops.items():
        crop(image, box, flip=flip).save(output_dir / filename, optimize=True)


if __name__ == "__main__":
    main()
