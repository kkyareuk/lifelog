from pathlib import Path
import json
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
pdfmetrics.registerFont(TTFont('K','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('KB','C:/Windows/Fonts/malgunbd.ttf'))
pdfmetrics.registerFont(TTFont('J','C:/Windows/Fonts/meiryo.ttc',subfontIndex=0))
import subprocess
d=json.loads(subprocess.check_output(['E:/node.exe','--input-type=module','-e',"import * as d from './speech-reviewed.js';console.log(JSON.stringify(d))"],encoding='utf-8'))
body=ParagraphStyle('body',fontName='K',fontSize=10,leading=17,spaceAfter=7,wordWrap='CJK',textColor=HexColor('#352d29'))
head=ParagraphStyle('head',parent=body,fontName='KB',fontSize=23,leading=33,spaceAfter=20)
sub=ParagraphStyle('sub',parent=body,fontName='KB',fontSize=12,leading=19,spaceBefore=12,spaceAfter=8,textColor=HexColor('#876348'))
small=ParagraphStyle('small',parent=body,fontSize=8,leading=12,textColor=HexColor('#796b62'))
styles={'ko':body,'en':body,'ja':ParagraphStyle('jp',parent=body,fontName='J')}
story=[]
def p(t,style=body):return Paragraph(escape(str(t)).replace('\n','<br/>'),style)
story.extend([Spacer(1,75),p('서랍마을\n말투별 대사 검수본',head),p('경상도 · 전라도 · 하오체 · 풍류 선비체 · 재상 선비체',sub),p('한국어 / English / 日本語'),p('2026.09.14 · 내부 테스트 1.0.338 · 390',small),Spacer(1,30),p('이번에 다듬은 다섯 말투의 푸시 문구 22종과 관계 편지 16종을 언어별로 수록했습니다. 총 570개 문구입니다.'),p('지역 말투는 종결어미를 기계적으로 반복하지 않고 상황과 감정에 맞춰 강약을 조절했습니다. 영어는 말의 속도와 친근함을, 일본어는 가벼운 지역 구어의 느낌을 살린 창작 현지화입니다. 한국의 지역과 해외 특정 지역이 정확히 대응한다는 뜻은 아닙니다.'),p('하오체는 담백한 예의, 풍류 선비체는 느긋한 정취와 익살, 재상 선비체는 신중하고 책임 있는 태도로 구분했습니다.'),p('{상대}, {물건}, {음식}, {음료} 등은 실제 캐릭터 이름과 선택한 내용이 들어가는 대사 변수입니다. 원본의 작성 도구나 작성자는 파일만으로 확인할 수 없습니다.',small),p('관계 편지의 문구 목록과 게임의 발생 조건은 구분됩니다. 모든 상황이 자동 발생하는 것은 아니며, 주거·가족 설정은 기존 관계 편집에서 확인합니다.',small),PageBreak()])
for name in d['REVIEWED_STYLE_NAMES']:
 story+=[p(name,head)]
 for typ,title,keys in [('REVIEWED_PUSH','일상 연락',d['PUSH_KEYS']),('REVIEWED_LETTERS','관계 변화 편지',d['LETTER_KEYS'])]:
  story.append(p(title,sub))
  for i,key in enumerate(keys):
   block=[p(f'{i+1:02d}  {key}',sub)]
   for lang in ['ko','en','ja']:
    block+=[p({'ko':'한국어','en':'English','ja':'日本語'}[lang],small),p(d[typ][name][lang][i] if lang!='ja' else d[typ][name][lang][i].replace('{상대}','{相手}').replace('{물건}','{品物}').replace('{음식}','{料理}').replace('{음료}','{飲み物}'),styles[lang])]
   story.append(KeepTogether(block));story.append(Spacer(1,8))
 story.append(PageBreak())
story=story[:-1]
Path('output/pdf').mkdir(parents=True,exist_ok=True)
output='output/pdf/drawer-village-dialogues-390.pdf'
def footer(c,doc):
 c.setStrokeColor(HexColor('#d8c8b6'));c.line(45,42,550,42);c.setFont('K',8);c.setFillColor(HexColor('#796b62'));c.drawString(45,28,'서랍마을 · 말투별 대사 검수본');c.drawRightString(550,28,str(doc.page))
SimpleDocTemplate(output,pagesize=(595.28,841.89),rightMargin=45,leftMargin=45,topMargin=45,bottomMargin=60,title='서랍마을 말투별 대사 검수본',author='서랍마을').build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
