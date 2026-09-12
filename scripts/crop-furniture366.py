"""Extract supplied transparent art. No resizing, recoloring or alpha changes."""
from pathlib import Path
from PIL import Image
import json

source = Path.home() / 'Downloads' / 'Quick Share'
target = Path(__file__).resolve().parents[1] / 'assets/furniture/wood'
target.mkdir(parents=True, exist_ok=True)
sheet = Image.open(source / '일러스트 20260829 (10).png')
regions = {
    'bed-front': (0,0,650,660), 'bed-side': (650,0,1250,660),
    'chair-front': (1260,50,1500,450), 'chair-side': (1500,50,1720,450),
    'chair-back': (1720,50,1980,450), 'table-front': (2020,50,2480,600),
    'sofa-side': (0,670,320,1170), 'sofa-front': (330,670,830,990),
    'sofa-back': (330,995,830,1260),
}
manifest = {}
for name, rect in regions.items():
    region = sheet.crop(rect)
    bbox = region.getchannel('A').getbbox()
    box = [rect[0]+bbox[0],rect[1]+bbox[1],rect[0]+bbox[2],rect[1]+bbox[3]]
    image = sheet.crop(box)
    image.save(target / (name+'.png'))
    manifest[name] = {'source': '(10)', 'crop': box, 'size': list(image.size)}
# Composite pieces share the same canvas origin so their pixels align exactly.
box = [1740,88,1935,415]
for name, number in [('chair-seat',6),('chair-frame',9),('chair-upper',7)]:
    image = Image.open(source / f'일러스트 20260829 ({number}).png').crop(box)
    image.save(target / (name+'.png'))
    manifest[name] = {'source': f'({number})', 'crop': box, 'size': list(image.size)}
(target/'crops.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps(manifest,indent=2))
