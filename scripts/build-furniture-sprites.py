"""Build transparent, per-item furniture sprites from 5x4 redraw atlases.

The game consumes 256x256 PNG files in assets/home-furniture/sprites.  Artists can
paint directly over the transparent atlases in assets/home-furniture/source and
run this script again without touching application code.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path

from PIL import Image


ATLAS_ITEMS = [
    [
        "소파", "TV", "책장", "오디오", "안마의자",
        "게임기", "캣타워", "턴테이블", "보드게임장", "홈시어터",
        "프로젝터", "악기 진열장", "수집품 진열장", "독서 의자", "반려동물 장난감",
        "러닝머신", "냉장고", "조리대", "식탁", "오븐",
    ],
    [
        "커피머신", "식기세척기", "티 세트", "제빵 도구", "칵테일 바",
        "와인 냉장고", "향신료 선반", "요리책 선반", "신발장", "전신거울",
        "우산꽂이", "자전거 보관대", "운동 장비 선반", "캠핑 장비", "샤워부스",
        "욕조", "세면대", "세탁기", "건조기", "입욕제 선반",
    ],
    [
        "침대", "커플 침대", "옷장", "화장대", "협탁",
        "독서등", "레코드 플레이어", "작은 게임기", "봉제인형", "책상",
        "컴퓨터", "피아노", "기타", "그림 도구", "재봉틀",
        "운동기구", "디지털 드로잉 장비", "촬영 장비", "보드게임 선반", "공예 도구",
    ],
    [
        "뜨개 도구", "프라모델 작업대", "천체망원경", "악기", "의자",
        "찬장", "티 테이블", "와인장", "수납장", "놀이 매트",
        "기저귀 교환대", "옷걸이", "작은 책상", "작업대", "화분",
        "야외 의자", "작은 테이블", "빨래 건조대", "원예 도구", "캠핑 의자",
    ],
]

ALIASES = {
    "에스프레소 머신": "커피머신", "반려동물 산책용품": "반려동물 장난감",
    "운동 장비": "운동 장비 선반", "향수 선반": "입욕제 선반",
    "스킨케어 선반": "입욕제 선반", "향수 진열대": "입욕제 선반",
    "빔프로젝터": "프로젝터", "선반": "책장", "보관 상자": "수납장",
    "수집품 상자": "수집품 진열장", "아기 침대": "침대",
}


def is_checker_pixel(pixel: tuple[int, int, int]) -> bool:
    """Return True for the light, near-neutral generated checker background."""
    low, high = min(pixel), max(pixel)
    return low >= 224 and high - low <= 15


def remove_connected_checker(image: Image.Image) -> Image.Image:
    """Remove only checker pixels connected to an atlas edge.

    Pale furniture surfaces remain because their ink outline separates them from
    the canvas.  This avoids the white-object damage caused by plain chroma-key.
    """
    rgb = image.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    background = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue(x: int, y: int) -> None:
        index = y * width + x
        if background[index] or not is_checker_pixel(pixels[x, y]):
            return
        background[index] = 1
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

    rgba = rgb.convert("RGBA")
    rgba_pixels = rgba.load()
    for y in range(height):
        for x in range(width):
            if background[y * width + x]:
                r, g, b, _ = rgba_pixels[x, y]
                rgba_pixels[x, y] = (r, g, b, 0)
    return rgba


def trim_and_square(cell: Image.Image, size: int = 256) -> Image.Image:
    alpha = cell.getchannel("A")
    bounds = alpha.getbbox()
    if not bounds:
        return Image.new("RGBA", (size, size))
    art = cell.crop(bounds)
    max_side = int(size * 0.9)
    ratio = min(max_side / art.width, max_side / art.height)
    resized = art.resize(
        (max(1, round(art.width * ratio)), max(1, round(art.height * ratio))),
        Image.Resampling.LANCZOS,
    )
    output = Image.new("RGBA", (size, size))
    output.alpha_composite(resized, ((size - resized.width) // 2, (size - resized.height) // 2))
    return output


def build(inputs: list[Path], source_dir: Path, sprite_dir: Path) -> dict[str, str]:
    source_dir.mkdir(parents=True, exist_ok=True)
    sprite_dir.mkdir(parents=True, exist_ok=True)
    manifest: dict[str, str] = {}

    for atlas_index, (path, items) in enumerate(zip(inputs, ATLAS_ITEMS), start=1):
        original = Image.open(path)
        cleaned = original if original.mode == "RGBA" and original.getchannel("A").getextrema()[0] == 0 else remove_connected_checker(original)
        source_path = source_dir / f"furniture-redraw-atlas-{atlas_index:02d}.png"
        cleaned.save(source_path, optimize=True)
        width, height = cleaned.size
        for item_index, item in enumerate(items):
            row, column = divmod(item_index, 5)
            left, top = round(width * column / 5), round(height * row / 4)
            right, bottom = round(width * (column + 1) / 5), round(height * (row + 1) / 4)
            filename = f"furniture-{atlas_index:02d}-{item_index + 1:02d}.png"
            trim_and_square(cleaned.crop((left, top, right, bottom))).save(sprite_dir / filename, optimize=True)
            manifest[item] = f"./assets/home-furniture/sprites/{filename}"

    manifest.update({alias: manifest[source] for alias, source in ALIASES.items()})
    manifest_path = source_dir.parent / "furniture-sprite-manifest.json"
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("inputs", nargs=4, type=Path, help="Four 5x4 atlas PNG paths")
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    asset_root = args.root / "assets" / "home-furniture"
    manifest = build(args.inputs, asset_root / "source", asset_root / "sprites")
    print(f"Built {len(manifest)} furniture sprites in {asset_root}")


if __name__ == "__main__":
    main()
