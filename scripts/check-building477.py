from pathlib import Path
from PIL import Image
source=Path('C:/Users/김세은/Downloads/Quick Share')
box=(50,940,890,1710)
for number,stem in [(25,'suitcase-hotel-handdrawn'),(26,'suitcase-hotel-light')]:
 expected=Image.open(source/f'일러스트 20260830 ({number}).png').convert('RGBA').crop(box).resize((640,587),Image.Resampling.LANCZOS)
 for ext in ['png','webp']:
  actual=Image.open(Path('world-assets/building-types')/(stem+'.'+ext)).convert('RGBA')
  assert actual.size==expected.size
  if ext=='png':assert actual.tobytes()==expected.tobytes()
  assert actual.getchannel('A').getbbox() is not None
print('PASS477 supplied base/light exact aligned crop; no neighboring school region')
