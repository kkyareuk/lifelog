from pathlib import Path

import numpy as np
from PIL import Image


SOURCE = Path(r"C:\Users\김세은\Downloads\Quick Share\일러스트 20260820 (9).png")
OUTPUT = Path(__file__).resolve().parents[1] / "icons"
ASSETS = {
    "hud-profile-frame.png": (0, 0, 350, 390),
    "hud-character-card.png": (0, 390, 350, 660),
    "hud-catalog-book.png": (0, 670, 380, 1030),
    "mailbox.png": (0, 2550, 400, 3088),
    "town-map.png": (1010, 2550, 1440, 3088),
}


image = Image.open(SOURCE).convert("RGBA")
OUTPUT.mkdir(parents=True, exist_ok=True)
for name, box in ASSETS.items():
    pixels = np.array(image.crop(box))
    white = np.all(pixels[:, :, :3] > 247, axis=2)
    pixels[white, 3] = 0
    alpha = pixels[:, :, 3]
    rows, columns = np.where(alpha > 0)
    pixels = pixels[rows.min() : rows.max() + 1, columns.min() : columns.max() + 1]
    asset = Image.fromarray(pixels)
    asset.save(OUTPUT / name)
    print(name, asset.size)
