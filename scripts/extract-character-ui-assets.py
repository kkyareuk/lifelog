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


def trim_alpha(image: Image.Image, padding: int = 8) -> Image.Image:
    bounds = image.getchannel("A").getbbox()
    if not bounds:
        return image
    left, top, right, bottom = bounds
    return image.crop((
        max(0, left - padding),
        max(0, top - padding),
        min(image.width, right + padding),
        min(image.height, bottom + padding),
    ))


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: extract-character-ui-assets.py <character.svg> <output-dir>")
    svg_path, output_dir = Path(sys.argv[1]), Path(sys.argv[2])
    output_dir.mkdir(parents=True, exist_ok=True)
    if svg_path.suffix.lower() == ".png":
        sheet = Image.open(svg_path).convert("RGBA")
        # Bounds are deliberately generous; trim_alpha removes only the fully
        # transparent outer canvas and preserves the hand-drawn soft edges.
        crops = {
            "post-it.png": (2330, 1320, 2910, 1710),
            "book.png": (1500, 1760, 3040, 3025),
            "notebook.png": (3150, 2210, 3745, 3035),
            "clip.png": (715, 2020, 1040, 2430),
        }
        for filename, box in crops.items():
            piece = trim_alpha(sheet.crop(box))
            if filename == "book.png":
                piece.thumbnail((820, 820), Image.Resampling.LANCZOS)
            piece.save(output_dir / filename, optimize=True)
        return
    source = svg_path.read_text(encoding="utf-8")
    image_matches = re.findall(
        r'<image\s+id="([^\"]+)"[^>]+href="data:image/png;base64,([^\"]+)',
        source,
    )
    if len(image_matches) < 5:
        raise SystemExit("character SVG did not contain the expected embedded PNGs")
    sheets = {
        image_id: Image.open(io.BytesIO(base64.b64decode(value))).convert("RGBA")
        for image_id, value in image_matches
    }

    crops = {
        # Exact inverse crops from 캐릭터1.svg pattern matrices.
        "character-background.webp": (sheets["image0_42_47"], (3073, 252, 3684, 1613), False),
        "character-cloth.png": (sheets["image1_42_47"], (85, 2448, 775, 3119), False),
        "registration-card.png": (sheets["image2_42_47"], (1368, 1130, 1944, 1489), False),
        "wallet.png": (sheets["image2_42_47"], (1280, 103, 2701, 1073), False),
        "key.png": (sheets["image1_42_47"], (825, 1726, 1185, 1887), False),
        "book.png": (sheets["image0_42_47"], (1347, 1545, 2577, 2577), False),
        "tape.png": (sheets["image3_42_47"], (313, 1857, 466, 2101), False),
        "clip.png": (sheets["image3_42_47"], (629, 1746, 875, 2069), False),
        "back.png": (sheets["image4_42_47"], (359, 1273, 583, 1496), False),
    }
    for filename, (image, box, flip) in crops.items():
        piece = crop(image, box, flip=flip)
        if filename.endswith(".webp"):
            piece.save(output_dir / filename, "WEBP", lossless=True, method=6, exact=True)
        else:
            piece.save(output_dir / filename, optimize=True)


if __name__ == "__main__":
    main()
