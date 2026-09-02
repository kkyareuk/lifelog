"""Regression checks for the repaired cafe and hospital PNG cutouts."""

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1] / "world-assets" / "building-types"


def alpha_row_groups(image: Image.Image, gap: int = 12) -> list[tuple[int, int]]:
    alpha = image.getchannel("A")
    width, height = image.size
    rows = [any(alpha.getpixel((x, y)) for x in range(width)) for y in range(height)]
    groups: list[tuple[int, int]] = []
    start = previous = None
    for y, occupied in enumerate(rows):
        if not occupied:
            continue
        if start is None or y - previous > gap:
            if start is not None:
                groups.append((start, previous))
            start = y
        previous = y
    if start is not None:
        groups.append((start, previous))
    return groups


def exterior_white_count(image: Image.Image) -> int:
    width, height = image.size
    pixels = image.load()
    seen: set[tuple[int, int]] = set()
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        point = (x, y)
        if point in seen:
            return
        pixel = pixels[x, y]
        if pixel[3] and min(pixel[:3]) < 250:
            return
        seen.add(point)
        queue.append(point)

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)
    count = 0
    while queue:
        x, y = queue.popleft()
        if pixels[x, y][3]:
            count += 1
        for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= nx < width and 0 <= ny < height:
                enqueue(nx, ny)
    return count


expected = {"cafe": (640, 652), "hospital": (640, 640)}
for name, size in expected.items():
    base = Image.open(ROOT / f"{name}-handdrawn.png").convert("RGBA")
    light = Image.open(ROOT / f"{name}-light.png").convert("RGBA")
    assert base.size == size, f"{name} base size changed: {base.size}"
    assert light.size == size, f"{name} light layer is misaligned: {light.size}"
    assert len(alpha_row_groups(base)) == 1, f"{name} still contains a neighbouring drawing"
    assert exterior_white_count(base) == 0, f"{name} still has exterior-connected white fringe"

cafe = Image.open(ROOT / "cafe-handdrawn.png").convert("RGBA")
handle_center = (round(cafe.width * 0.86), round(cafe.height * 0.22))
assert cafe.getpixel(handle_center)[3] == 0, "cafe cup handle opening is not transparent"

print("building cutouts: crop, aligned lighting, transparent handle, and fringe checks passed")
