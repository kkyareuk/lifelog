export function hairGrooming(c,language='ko'){
 const a=c.bodyProfile?.appearance||{},length=a.hairLength||'',style=(a.hairStyles||[]).join(' '),texture=a.hairTexture||'',condition=a.hairCondition||'',i=['ko','en','ja'].indexOf(language);
 const short=/삭발|대머리|매우 짧|짧은|귀 위|숏컷|픽시/.test(length),long=/가슴|허리|어깨|장발/.test(length);
 let line;
 if(/대머리|머리카락 없음|민머리/.test(length))line=['거울을 보며 두피를 부드럽게 닦고 건조한 곳을 살피고 있어요.','They gently wipe their scalp and check for dry spots in the mirror.','鏡を見ながら頭皮を優しく拭き、乾燥した所を確かめています。'];
 else if(/삭발/.test(length))line=['아주 짧게 남은 머리를 손바닥으로 쓸어 보고 두피를 정돈하고 있어요.','They smooth a palm over their closely shaved hair and tend to their scalp.','短く刈った髪を手のひらでなで、頭皮を整えています。'];
 else if(!short&&(long||!length||length==='설정하지 않음')&&/땋|브레이드/.test(style))line=['머리를 몇 가닥으로 나누어 차례로 교차시키고, 당기는 곳이 없도록 땋은 부분을 조금씩 느슨하게 하고 있어요.','They divide their hair into sections and braid them, loosening any spots that pull.','髪を束に分けて順に編み、引っ張られる所を少しずつ緩めています。'];
 else if(!short&&(long||!length||length==='설정하지 않음')&&/포니테일|묶|트윈테일/.test(style))line=['길게 내려온 머리를 모아 평소 묶는 위치에 고정하고, 당겨 올라간 잔머리를 손끝으로 풀어 주고 있어요.','They gather their long hair at its usual tying position and ease tight flyaways with their fingertips.','長い髪をいつもの位置で結び、引っ張られた後れ毛を指先で緩めています。'];
 else if(!short&&(long||!length||length==='설정하지 않음')&&/번|올림/.test(style))line=['긴 머리를 돌려 감아 올리고, 고정한 부분이 무겁게 당기지 않는지 고개를 움직여 확인하고 있어요.','They twist their long hair into an updo and move their head to check that it does not pull.','長い髪をねじってまとめ、頭を動かして引っ張られないか確かめています。'];
 else if(/곱슬/.test(texture))line=['빗으로 억지로 펴지 않고 곱슬진 가닥을 손끝으로 나누며, 엉킨 부분부터 천천히 풀고 있어요.','They separate their curls with their fingertips, gently loosening tangles without brushing them straight.','無理に伸ばさず、巻いた髪を指先で分けて絡んだ所からゆっくりほどいています。'];
 else if(short)line=['짧은 머리에서 눌린 부분을 손끝으로 세우고, 옆으로 뜬 가닥은 결을 따라 눌러 주고 있어요.','They lift flattened sections of their short hair and smooth stray strands along the grain.','短い髪のつぶれた所を指先で起こし、浮いた毛を流れに沿って押さえています。'];
 else if(/앞머리/.test(style)&&!/앞머리 없음/.test(style))line=['앞머리가 평소 내려오는 방향을 따라 가닥을 나누고, 눈가에 걸린 끝을 조금씩 정리하고 있어요.','They separate their fringe along its usual direction and tidy the ends near their eyes.','前髪をいつもの流れに沿って分け、目元にかかる毛先を少しずつ整えています。'];
 else if(/올백|슬릭백/.test(style))line=['머리를 뒤로 넘기며 가르마와 옆선을 맞추고, 다시 흘러내린 가닥을 손바닥으로 눌러 주고 있어요.','They sweep their hair back, align the part and sides, and smooth down strands that fall forward.','髪を後ろへ流して分け目と横の線をそろえ、落ちてきた毛を手のひらで押さえています。'];
 else if(long)line=['긴 머리끝의 엉킨 곳부터 풀어 낸 뒤 위쪽으로 조금씩 빗어 올라가며 흐트러진 결을 정돈하고 있어요.','They untangle the ends of their long hair first, then gradually work the comb upward.','長い髪の毛先の絡まりからほどき、少しずつ上へくしを進めて整えています。'];
 else if(length==='단발')line=['턱 주변으로 떨어지는 머리끝을 나누어 빗고, 양옆이 자연스럽게 이어지도록 모양을 맞추고 있어요.','They comb the ends of their bob in sections and shape both sides to fall naturally.','あごの周りに落ちる毛先を分けてとかし、両側が自然につながるよう整えています。'];
 else line=['거울 속 모습을 살피며 흐트러진 부분을 손끝으로 가볍게 정돈하고 있어요.','They check the mirror and lightly tidy the unsettled parts with their fingertips.','鏡を見ながら、乱れた所を指先で軽く整えています。'];
 if(!/대머리|삭발|민머리/.test(length)&&/건조|손상|푸석/.test(condition))line=line.map((s,j)=>s+' '+['푸석한 끝은 세게 잡아당기지 않고 조금씩 풀어 주고 있어요.','They loosen the dry ends gently without pulling.','ぱさついた毛先は強く引かず、少しずつほどいています。'][j]);
 return line[i<0?0:i];
}
