"""Repair hand-drawn building cutouts without flattening semantic holes.

The source sheet uses transparency for both the page background and many white
building surfaces.  This repair keeps enclosed white surfaces opaque, removes
only exterior-connected white fringe, trims neighbouring drawings accidentally
captured below a building, and reopens explicitly configured holes.
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

PAIRED_LIGHTS = {
    "cafe-handdrawn.png": "cafe-light.png",
    "hospital-handdrawn.png": "hospital-light.png",
}
TRIM_VERTICAL_NEIGHBOURS = {"cafe-handdrawn.png", "hospital-handdrawn.png"}
TRANSPARENT_HOLE_RATIOS = {"cafe-handdrawn.png": ((0.86, 0.22),)}


def near_white(pixel: tuple[int, int, int, int], threshold: int = 250) -> bool:
    return pixel[3] > 0 and min(pixel[:3]) >= threshold


def primary_vertical_crop(image: Image.Image, gap: int = 12, padding: int = 4):
    """Return a crop around the largest alpha row group, excluding neighbours."""
    image = image.convert("RGBA")
    alpha = image.getchannel("A")
    width, height = image.size
    occupied = [sum(1 for value in alpha.crop((0, y, width, y + 1)).getdata() if value) for y in range(height)]
    groups: list[tuple[int, int]] = []
    start = previous = None
    for y, count in enumerate(occupied):
        if not count:
            continue
        if start is None or y - previous > gap:
            if start is not None:
                groups.append((start, previous))
            start = y
        previous = y
    if start is not None:
        groups.append((start, previous))
    if not groups:
        return image, (0, 0, width, height)
    top, bottom = max(groups, key=lambda group: sum(occupied[group[0] : group[1] + 1]))
    isolated = Image.new("RGBA", image.size)
    isolated.paste(image.crop((0, top, width, bottom + 1)), (0, top))
    bbox = isolated.getbbox() or (0, top, width, bottom + 1)
    box = (
        max(0, bbox[0] - padding),
        max(0, bbox[1] - padding),
        min(width, bbox[2] + padding),
        min(height, bbox[3] + padding),
    )
    return isolated.crop(box), box


def crop_pair(base: Image.Image, light: Image.Image, box: tuple[int, int, int, int]):
    base = base.crop(box)
    light = light.crop(box)
    target_width = 640
    target_height = max(1, round(base.height * target_width / base.width))
    size = (target_width, target_height)
    return base.resize(size, Image.Resampling.LANCZOS), light.resize(size, Image.Resampling.LANCZOS)


def restore_enclosed_white(image: Image.Image) -> tuple[Image.Image, int]:
    image = image.convert("RGBA")
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
    return image, restored


def remove_exterior_white_fringe(image: Image.Image) -> tuple[Image.Image, int]:
    """Clear only transparent/near-white pixels reachable from the canvas edge."""
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    seen = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if seen[index]:
            return
        pixel = pixels[x, y]
        if pixel[3] and not near_white(pixel):
            return
        seen[index] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)
    cleared = 0
    while queue:
        x, y = queue.popleft()
        if pixels[x, y][3]:
            pixels[x, y] = (0, 0, 0, 0)
            cleared += 1
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)
    return image, cleared


def clear_white_hole(image: Image.Image, ratio: tuple[float, float]) -> tuple[Image.Image, int]:
    """Reopen a known white hole, such as the inside of the cafe cup handle."""
    image = image.convert("RGBA")
    width, height = image.size
    pixels = image.load()
    origin = (round(width * ratio[0]), round(height * ratio[1]))
    seed = None
    for radius in range(0, 28):
        for y in range(max(0, origin[1] - radius), min(height, origin[1] + radius + 1)):
            for x in range(max(0, origin[0] - radius), min(width, origin[0] + radius + 1)):
                if min(pixels[x, y][:3]) >= 245 and pixels[x, y][3]:
                    seed = (x, y)
                    break
            if seed:
                break
        if seed:
            break
    if not seed:
        return image, 0
    queue = deque([seed])
    seen = {seed}
    component: list[tuple[int, int]] = []
    while queue:
        x, y = queue.popleft()
        pixel = pixels[x, y]
        if not (pixel[3] and min(pixel[:3]) >= 245):
            continue
        component.append((x, y))
        for point in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
            if 0 <= point[0] < width and 0 <= point[1] < height and point not in seen:
                seen.add(point)
                queue.append(point)
    for x, y in component:
        pixels[x, y] = (0, 0, 0, 0)
    return image, len(component)


def repair_asset(root: Path, name: str) -> tuple[int, int, tuple[int, int]]:
    path = root / name
    image = Image.open(path).convert("RGBA")
    if name in TRIM_VERTICAL_NEIGHBOURS:
        isolated, box = primary_vertical_crop(image)
        light_path = root / PAIRED_LIGHTS[name]
        light = Image.open(light_path).convert("RGBA")
        image, light = crop_pair(image, light, box)
        light.save(light_path, optimize=True)
    image, restored = restore_enclosed_white(image)
    image, fringe = remove_exterior_white_fringe(image)
    holes = 0
    for ratio in TRANSPARENT_HOLE_RATIOS.get(name, ()):
        image, cleared = clear_white_hole(image, ratio)
        holes += cleared
    image.save(path, optimize=True)
    return restored, fringe + holes, image.size


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1] / "world-assets" / "building-types"
    for name in ASSET_NAMES:
        restored, cleared, size = repair_asset(root, name)
        print(f"{name}: restored {restored}, cleared {cleared}, size {size[0]}x{size[1]}")
