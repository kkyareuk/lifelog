"""Extract the relationship mosaic from the supplied hand-drawn UI sheet.

The crop keeps the original paper texture and checker pattern. It is reduced
to a little over the largest rendered size so Android does not decode the
entire 4766 x 5301 source sheet for every relationship screen.
"""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image


MOSAIC_CROP = (3196, 52, 4575, 2141)
OUTPUT_SIZE = (690, 1045)


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit(
            "usage: extract-relationship-background.py <ui-sheet.png> <output.png>"
        )

    source_path, output_path = map(Path, sys.argv[1:])
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as source:
        mosaic = source.convert("RGB").crop(MOSAIC_CROP)
        mosaic = mosaic.resize(OUTPUT_SIZE, Image.Resampling.LANCZOS)
        mosaic.save(output_path, "PNG", optimize=True)


if __name__ == "__main__":
    main()
