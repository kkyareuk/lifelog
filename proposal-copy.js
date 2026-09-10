// Keep each proposal's subject explicit, including old stored proposals.
export function proposalCopy(p, t) {
 if(p.kind==='create-resident'){const name=p.sourceName||'',who=p.status==='pending'?p.senderDisplayName:p.responderDisplayName;const body=p.status==='pending'?t(`${who||'구성원'}님이 ${name}의 생성을 신청했어요. 관리자 한 명이 승인하면 생성됩니다.`,`${who||'A member'} requested creation of ${name}. One manager must approve.`,`${who||'メンバー'}さんが${name}の作成を申請しました。管理者1人の承認で作成されます。`):t(`${who||'관리자'}님이 ${name}의 생성 신청을 ${p.status==='accepted'?'수락':'거절'}했어요.`,`${who||'A manager'} ${p.status==='accepted'?'accepted':'declined'} the creation request for ${name}.`,`${who||'管理者'}さんが${name}の作成申請を${p.status==='accepted'?'承認':'辞退'}しました。`);return {title:body,body};}
 const who=(p.asResponse?p.responderDisplayName:p.senderDisplayName)||t('구성원','A member','メンバー');
 const a=p.sourceName||t('캐릭터','the character','キャラクター'),b=p.targetName||t('마을','the town','村');
 const people=[p.sourceName,p.targetName].filter(Boolean).join(' · ')||a;
 const patch=p.patch||{}, name=patch.type||patch.name||p.type||'', relation=name+(patch.stage?`(${patch.stage})`:'');
 const kind=p.kind||'relationship';
 const label=kind==='admission'?t('입주 신청','move-in application','入居申請'):kind==='cohabitation'?t('동거 제안','shared-home proposal','同居提案'):kind==='schedule'?t('일정 제안','schedule proposal','予定の提案'):kind==='characterGroup'?t('캐릭터 그룹 제안','character group proposal','キャラクターグループの提案'):t('관계 제안','relationship proposal','関係の提案');
 const subject=kind==='admission'||kind==='cohabitation'?a:people;
 if(p.asResponse){
  const reason=String(p.reason||'').trim(), accepted=p.status==='accepted';
  const title=t(`${who}님이 ${subject}의 ${label}을 ${accepted?'수락':'거절'}했습니다.`,`${who} ${accepted?'accepted':'declined'} the ${label} for ${subject}.`,`${who}さんが${subject}の${label}を${accepted?'承認':'辞退'}しました。`);
  return {title,body:!accepted&&reason?t(`${who}님이 ${subject}의 ${label}을 ‘${reason}’라는 이유로 거절했습니다.`,`${who} declined the ${label} for ${subject} because: “${reason}”.`,`${who}さんが${subject}の${label}を「${reason}」という理由で辞退しました。`):title};
 }
 if(kind==='admission'){
  const body=p.appliedByAuthority?t(`${who}님이 관리자 권한으로 ${a}의 ${b} 입주를 완료했습니다.`,`${who} moved ${a} into ${b} using administrator permissions.`,`${who}さんが管理者権限で${a}の${b}への入居を完了しました。`):t(`${who}님이 ${a}의 ${b} 입주를 신청했습니다.`,`${who} applied for ${a} to move into ${b}.`,`${who}さんが${a}の${b}への入居を申請しました。`);
  return {title:body,body};
 }
 const title=t(`${who}님이 ${label}을 보냈습니다.`,`${who} sent a ${label}.`,`${who}さんから${label}が届きました。`);
 const body=kind==='cohabitation'?t(`${who}님이 ${a}의 거주지를 ${b}로 정하고 함께 생활하는 것을 제안했습니다.`,`${who} proposed that ${a} live at ${b}.`,`${who}さんが${a}の住まいを${b}にすることを提案しました。`):kind==='schedule'?t(`${who}님이 ${people}의 일정 「${patch.title||name}」을 제안했습니다.`,`${who} proposed “${patch.title||name}” for ${people}.`,`${who}さんが${people}の予定「${patch.title||name}」を提案しました。`):kind==='characterGroup'?t(`${who}님이 ${people}을 캐릭터 그룹 「${patch.name||name}」의 구성원으로 설정하는 것을 제안했습니다.`,`${who} proposed adding ${people} to the character group “${patch.name||name}”.`,`${who}さんが${people}をキャラクターグループ「${patch.name||name}」のメンバーにすることを提案しました。`):t(`${who}님이 ${people}의 관계를 「${relation}」로 설정하는 것을 제안했습니다.`,`${who} proposed the relationship “${relation}” for ${people}.`,`${who}さんが${people}の関係を「${relation}」にすることを提案しました。`);
 return {title,body};
}
