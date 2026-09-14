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
story.extend([Spacer(1,75),p('서랍마을\n말투별 대사 검수본',head),p('경상도 · 전라도 · 하오체 · 하게체',sub),p('한국어 / English / 日本語'),p('2026.09.14 · 내부 테스트 1.0.339 · 391',small),Spacer(1,30),p('이번에 다듬은 네 말투의 푸시 문구 22종과 관계 편지 16종을 언어별로 수록했습니다. 총 456개 문구입니다.'),p('지역 말투는 언어별로 다르게 현지화했습니다. 경상도 말투는 영어 Scottish accent, 일본어 오사카벤으로, 전라도 말투는 영어 Southern US accent, 일본어 히로시마벤으로 표시합니다. 지역 어휘와 표현을 가볍게 사용하며 모든 문장에 방언 어미를 붙이지는 않습니다.'),p('하오체는 예의를 갖춘 고전적인 어조, 하게체는 차분하게 조언하는 어조로 구분했습니다. 영어는 고전적인 연설체와 옛스러운 조언체로, 일본어는 고풍스러운 정중체와 이야기체로 구분합니다.'),p('{상대}, {물건}, {음식}, {음료} 등은 실제 캐릭터 이름과 선택한 내용이 들어가는 대사 변수입니다. 원본의 작성 도구나 작성자는 파일만으로 확인할 수 없습니다.',small),p('관계 편지의 문구 목록과 게임의 발생 조건은 구분됩니다. 모든 상황이 자동 발생하는 것은 아니며, 주거·가족 설정은 기존 관계 편집에서 확인합니다.',small),PageBreak()])
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
output='output/pdf/drawer-village-dialogues-391.pdf'
def footer(c,doc):
 c.setStrokeColor(HexColor('#d8c8b6'));c.line(45,42,550,42);c.setFont('K',8);c.setFillColor(HexColor('#796b62'));c.drawString(45,28,'서랍마을 · 말투별 대사 검수본');c.drawRightString(550,28,str(doc.page))
SimpleDocTemplate(output,pagesize=(595.28,841.89),rightMargin=45,leftMargin=45,topMargin=45,bottomMargin=60,title='서랍마을 말투별 대사 검수본',author='서랍마을').build(story,onFirstPage=footer,onLaterPages=footer)
print(output)
