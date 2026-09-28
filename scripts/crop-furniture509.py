from pathlib import Path
from PIL import Image
import json
src=Path.home()/'Downloads/Quick Share';out=Path('assets/furniture/wood');manifest={}
def crop(name,sheet,box,trim=False):
 im=Image.open(src/f'일러스트 20260829 ({sheet}).png').convert('RGBA').crop(box)
 if trim:im=im.crop(im.getbbox())
 im.save(out/(name+'.png'));manifest[name]={'source':sheet,'box':box,'size':im.size};print(name,im.size)
crop('counter-front',24,(905,1505,1205,1895),True)
# Matching canvases keep the front/back layers aligned without stretching.
for name,sheet,box in [('desk-front',24,(120,2070,575,2490)),('desk-side',24,(640,2070,900,2565)),('desk-side-frame',21,(640,2070,900,2565)),('desk-back',22,(955,2120,1415,2508)),('desk-back-frame',21,(955,2120,1415,2508)),('bathtub-front',25,(1570,2120,2260,2580)),('bathtub-back',24,(1570,2120,2260,2580)),('bathtub-frame',23,(1570,2120,2260,2580)),('bath-water-back',25,(1570,2610,2210,2860)),('bath-water-front',25,(1570,2920,2210,3110))]:crop(name,sheet,box)
(out/'crops509.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
