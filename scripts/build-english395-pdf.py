from pathlib import Path
from xml.sax.saxutils import escape
import json, re
from reportlab.pdfbase import ttfonts
# ReportLab CMaps must encode non-BMP characters as UTF-16 surrogate pairs.
_original_cmap = ttfonts.makeToUnicodeCMap
def unicode_cmap(fontname, subset):
 text = _original_cmap(fontname, subset)
 return re.sub(r"<([0-9A-F]{5,6})>", lambda m: "<"+chr(int(m[1],16)).encode("utf-16-be").hex().upper()+">", text)
ttfonts.makeToUnicodeCMap = unicode_cmap
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'
data=json.loads((OUT/'english-dialogue-395.json').read_text(encoding='utf-8'))
pdfmetrics.registerFont(TTFont('Korean','C:/Windows/Fonts/malgun.ttf'))
pdfmetrics.registerFont(TTFont('KoreanBold','C:/Windows/Fonts/malgunbd.ttf'))
pdfmetrics.registerFont(TTFont('English','C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('EnglishBold','C:/Windows/Fonts/arialbd.ttf'))
pdfmetrics.registerFont(TTFont('Emoji','C:/Windows/Fonts/seguiemj.ttf'))
pdfmetrics.registerFontFamily('Korean',normal='Korean',bold='KoreanBold')
ink=HexColor('#342b24');muted=HexColor('#8b755a');sage=HexColor('#526e5d')
styles={
 'title':ParagraphStyle('title',fontName='KoreanBold',fontSize=27,leading=38,textColor=ink,spaceAfter=20),
 'section':ParagraphStyle('section',fontName='KoreanBold',fontSize=18,leading=26,textColor=sage,spaceAfter=15),
 'heading':ParagraphStyle('heading',fontName='KoreanBold',fontSize=14,leading=21,textColor=ink,spaceAfter=10),
 'body':ParagraphStyle('body',fontName='Korean',fontSize=9.5,leading=16,textColor=ink,spaceAfter=8),
 'label':ParagraphStyle('label',fontName='Korean',fontSize=7.5,leading=11,textColor=muted,spaceAfter=2),
 'english':ParagraphStyle('english',fontName='Korean',fontSize=9.3,leading=13.8,textColor=ink,spaceAfter=7),
}
story=[]
def p(text,style='body'):
 return Paragraph(''.join('<font name="Emoji">'+escape(c)+'</font>' if ord(c)>0xffff else escape(c) for c in str(text)).replace('\n','<br/>'),styles[style])
def row(label,text):
 story.append(KeepTogether([p(label,'label'),p(text,'english')]))
def heading(text):story.append(p(text,'heading'))
def section(text):story.extend([PageBreak(),p(text,'section')])

story.extend([Spacer(1,48),p('DRAWER VILLAGE','label'),p('영어 대사 모음\n원문 대조본','title'),p('1.0.343 / 395','heading'),p('원고를 그대로 넣었나요?'),p('적용된 682개 중 677개는 원문 그대로, 5개는 수정했습니다. 아직 연결하지 않은 132개도 이 문서에 함께 실었습니다.'),Spacer(1,20)])
summary=Table([[p('677','heading'),p('5','heading'),p('132','heading')],[p('그대로 적용','body'),p('수정 후 적용','body'),p('미연결 원고','body')]],colWidths=[160]*3)
summary.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),HexColor('#f3eee3')),('BOX',(0,0),(-1,-1),.5,HexColor('#d7cbb9')),('TOPPADDING',(0,0),(-1,-1),10),('BOTTOMPADDING',(0,0),(-1,-1),8)]));story.extend([summary,Spacer(1,24)])
for text in [
 '범위: 첨부 영어 푸시 원고 37종 전체, 별도로 유지되는 영어 푸시, 기존 선택지 34종의 관계 편지 544개와 질문·계획·연락 예시입니다. 앱 전체 영어 UI나 모든 생활 로그를 모은 문서는 아닙니다.',
 '395는 대명사 설정 화면을 다듬은 버전입니다. 이 문서의 대사는 394와 동일하며, 실제 코드의 출력 함수로 추출했습니다.',
 '원고의 문장, 맞춤법과 기호를 그대로 기록했습니다. 이 문서 자체가 원어민 검수나 중세영어의 역사적 정확성을 인증하지는 않습니다.',
 '이름 삽입 전 형태를 볼 수 있도록 {상대}, {물건}, {음식}, {음료}를 남겼습니다. 사용자에게 실제 발송한 기록이 아니라 템플릿입니다. 캐릭터 자칭·문맥에 따라 최종 화면 문장은 달라질 수 있습니다.',
 '자동 말투는 성격에 따라 기존 유형을 선택하므로 별도 고정 대사로 중복 수록하지 않았습니다.'
]:story.append(p(text))
section('01  원고와 달라진 부분')
story.append(p('문장 수정은 아래 5개입니다. 표시 이름은 Rough & Unfiltered → Rough · censored, Moralizing Elder → Old-fashioned mentor로 바뀌었습니다.'))
for c in data['changes']:
 story.append(KeepTogether([p(c['name']+' / '+c['key'],'heading'),p('원문','label'),p(c['original'],'english'),p('적용 문장','label'),p(c['text'],'english'),Spacer(1,10)]))
section('02  목록과 적용 상태')
for g in data['groups']:
 row(('적용' if g['active'] else '미연결')+' / '+g['id'],g['name']+('  ·  '+g['style'] if g['style'] else ''))
for section_title,groups in [('03  적용된 영어 푸시 682개',[g for g in data['groups'] if g['active']]),('04  미연결 원고 132개',[g for g in data['groups'] if not g['active']])]:
 section(section_title)
 story.append(p('각 유형은 원고의 22개 상황 순서로 수록했습니다. 미연결 원고는 현재 캐릭터 선택지나 알림에 연결하지 않은 자료입니다.'))
 for index,g in enumerate(groups):
  if index:story.append(PageBreak())
  heading(g['name']);story.append(p((g['style'] or '아직 선택지에 연결되지 않음')+' / '+g['id'],'label'))
  for i,r in enumerate(g['rows']):row(f'{i+1:02d}  {r["key"]}'+('  [수정]' if r['changed'] and g['active'] else ''),r['text'])
section('05  별도로 유지되는 영어 푸시')
for index,g in enumerate(data['otherPush']):
 if index:story.append(PageBreak())
 heading(g['style'])
 for i,r in enumerate(g['rows']):row(f'{i+1:02d}  {r["key"]}',r['text'])
section('06  관계 편지와 말투 예시')
story.append(p('관계 편지는 우편함 표시 함수가 만든 본문입니다. 기존 말투별 문장과 덧붙는 표현까지 수록했습니다. 반복되는 문장도 누락 없이 남겼습니다. 끝의 연락 예시에서 {기본 문장}은 상황별 본문이 들어가는 위치입니다.'))
for index,v in enumerate(data['voices']):
 if index:story.append(PageBreak())
 heading(v['style']);story.append(p(v['name'],'label'))
 for r in v['letters']:row(r['kind'],r['text'])
 for label,text in v['examples']:row(label,text)

def decorate(c,doc):
 c.saveState();w,h=A4
 c.setStrokeColor(HexColor('#d7cbb9'));c.line(44,h-34,w-44,h-34)
 c.setFont('English',8);c.setFillColor(muted);c.drawString(44,h-26,'DRAWER VILLAGE  /  ENGLISH DIALOGUE')
 c.drawString(44,24,'395  |  Source comparison & runtime templates');c.drawRightString(w-44,24,str(doc.page));c.restoreState()
doc=SimpleDocTemplate(str(OUT/'english-dialogue-395.pdf'),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=49,bottomMargin=43,title='Drawer Village English Dialogue - 395',author='Drawer Village')
doc.build(story,onFirstPage=decorate,onLaterPages=decorate)
print('Created',OUT/'english-dialogue-395.pdf')
