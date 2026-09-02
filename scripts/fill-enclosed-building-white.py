"""Restore white surfaces enclosed by building line art.

The supplied PNG exports use transparent pixels both for the page background and
for white building surfaces.  Only transparent pixels connected to the outer
canvas are background; enclosed transparent regions are painted opaque white.
"""

from collections import deque
from pathlib import Path

from PIL import Image


ASSET_NAMES = (
    "cafe-handdrawn.png",
    "hospital-handdrawn.png",
    "piano-hall-handdrawn.png",
    "dress-shop-handdrawn.png",
    "stadium-handdrawn.png",
    "office-handdrawn.png",
    "graduation-school-handdrawn.png",
    "suitcase-hotel-handdrawn.png",
    "clock-school-handdrawn.png",
    "library-handdrawn.png",
    "generic-building-handdrawn.png",
    "red-roof-home-handdrawn.png",
    "park-handdrawn.png",
)


def restore_enclosed_white(path: Path) -> int:
    image = Image.open(path).convert("RGBA")
    width, height = image.size
    pixels = image.load()
    outside = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if outside[index] or pixels[x, y][3] != 0:
            return
        outside[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    restored = 0
    for y in range(height):
        for x in range(width):
            index = y * width + x
            if pixels[x, y][3] == 0 and not outside[index]:
                pixels[x, y] = (255, 255, 255, 255)
                restored += 1

    image.save(path, optimize=True)
    return restored


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1] / "world-assets" / "building-types"
    for name in ASSET_NAMES:
        asset = root / name
        print(f"{name}: restored {restore_enclosed_white(asset)} white pixels")
