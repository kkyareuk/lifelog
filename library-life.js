import {ensureWallet,payActivity} from './character-money.js';
export const DAY=86400000,LOAN_DAYS=14;
const titles=[
 ['primer','서랍마을 이야기','Stories of Drawer Village','引き出し村の物語',true],
 ['garden','작은 정원의 사계절','Four Seasons in a Small Garden','小さな庭の四季',true],
 ['mystery','닫힌 방의 열쇠','The Key to the Locked Room','閉ざされた部屋の鍵',false],
 ['stars','별을 따라 걷는 밤','A Walk Beneath the Stars','星をたどる夜',false],
 ['travel','먼 항구에서 온 편지','Letters from a Distant Port','遠い港からの手紙',false],
 ['history','오래된 도시의 기록','Chronicles of an Old City','古い都市の記録',false]
];
export const libraryBooks=world=>[...titles.map(([id,ko,en,ja,basic])=>({id:'library-'+id,name:ko,names:{ko,en,ja},basic,price:15000})),...(world.catalog?.book||[]).filter(b=>!b.deleted).map(b=>({...b,id:'catalog-'+b.id,custom:true,price:15000}))];
export const bookName=(b,lang)=>b?.names?.[lang]||b?.name||'';
export function ownedBooks(world,c){const data=c.library||{};return libraryBooks(world).filter(b=>b.basic||b.custom||data.owned?.includes(b.id)||data.loans?.some(l=>l.bookId===b.id&&!l.returnedAt));}
export function bookAction(world,id,bookId,action,now=Date.now()){
 const c=world.characters?.[id],book=libraryBooks(world).find(b=>b.id===bookId);if(!c||!book)throw Error('book-missing');
 const data=c.library??={owned:[],loans:[]};data.owned??=[];data.loans??=[];
 const loan=data.loans.find(l=>l.bookId===bookId&&!l.returnedAt);
 if(action==='buy'){if(ownedBooks(world,c).some(b=>b.id===bookId))return;ensureWallet(c,now);if(!payActivity(world,[id],book.price,'book:'+bookId,now))throw Error('money-insufficient');data.owned.push(bookId);}
 else if(action==='borrow'){if(!(world.world?.places||[]).some(p=>/도서관|library/i.test([p.type,p.name].join(' '))))throw Error('library-missing');if(ownedBooks(world,c).some(b=>b.id===bookId))return;if(data.loans.filter(l=>!l.returnedAt).length>=5)throw Error('book-limit');data.loans=data.loans.filter(l=>!l.returnedAt);data.loans.push({bookId,borrowedAt:now,dueAt:now+LOAN_DAYS*DAY});}
 else if(action==='return'){if(!loan)throw Error('book-loan');loan.returnedAt=now;if(data.active?.bookId===bookId)delete data.active;}
 else if(action==='read'){if(!ownedBooks(world,c).some(b=>b.id===bookId))throw Error('book-unowned');if(c.cooking?.active||c.household?.active)throw Error('activity-busy');delete world.characterDirectives?.[id];data.active={bookId,explicit:true,startedAt:now,endsAt:now+180000};}
 else throw Error('book-action');
}
const copy=(lang,ko,en,ja)=>({ko,en,ja}[lang]||ko);
export function libraryScene(world,c,scene,now){
 const data=c.library??={owned:[],loans:[]},lang=world.uiLanguage||'ko';
 // Commands and appointments take precedence over automatic book handling.
 const busy=scene.manualDirective||scene.routineId||scene.transit||scene.sleeping||scene.needKey||scene.groupInteraction;
 const careful=Number(c.perceivingJudging)>=4||/계획|철저|질서|꼼꼼/.test([c.planningStyle,c.neatness,...(c.characterTraits||[])].join(' '));
 for(const loan of data.loans||[]){if(loan.returnedAt)continue;
  if(careful&&now>=loan.dueAt-DAY&&!busy){loan.returnedAt=now;data.notice={startedAt:now,endsAt:now+10000,returning:true,bookId:loan.bookId};}
  else if(now>=loan.dueAt+14*DAY&&now-(loan.lastCallAt||0)>=DAY&&!busy){loan.lastCallAt=now;data.notice={startedAt:now,endsAt:now+15000,bookId:loan.bookId};}
 }
 const notice=data.notice;if(notice&&now<notice.endsAt&&!busy){const title=notice.returning?copy(lang,'도서관에 책을 반납하고 있어요','Returning a library book','図書館の本を返しています'):copy(lang,'도서관의 연체 안내 전화를 받고 있어요','Taking a library overdue reminder call','図書館から延滞の連絡を受けています');return {...scene,title,desc:title,baseTitle:title,baseDesc:title,activityStartedAt:notice.startedAt,activityEndsAt:notice.endsAt};}
 if(data.active&&now>=data.active.endsAt){data.lastReadAt=data.active.endsAt;c.timelineResetAt=now;delete world.dailyPlans?.[c.id];delete data.active;delete data.picking;}
 if(data.active&&scene.manualDirective&&world.characterDirectives?.[c.id]?.startedAt>data.active.startedAt)delete data.active;
 if(!data.active&&scene.home&&!busy&&/읽을 책을 고르는|choosing.*book|本.*選/.test([scene.title,scene.baseTitle].join(' '))&&now-(data.lastReadAt||0)>60000){
  data.picking??={startedAt:now,endsAt:now+5000};
  if(now>=data.picking.endsAt){const books=ownedBooks(world,c),seed=[...c.id].reduce((n,x)=>n+x.charCodeAt(0),0)+Math.floor(now/DAY);if(books.length)data.active={bookId:books[seed%books.length].id,startedAt:data.picking.endsAt,endsAt:data.picking.endsAt+180000};delete data.picking;}
  else return {...scene,activityStartedAt:data.picking.startedAt,activityEndsAt:data.picking.endsAt};
 }
 if(data.active&&(!busy||data.active.explicit)){const book=libraryBooks(world).find(b=>b.id===data.active.bookId);if(!book){delete data.active;return scene;}const name=bookName(book,lang),title=copy(lang,name+' 읽는 중','Reading '+name,name+'を読んでいます'),desc=copy(lang,'책장을 넘기며 마음에 남는 구절을 천천히 읽고 있어요.','They turn the pages and linger over memorable passages.','ページをめくり、心に残る一節をゆっくり読んでいます。');return {...scene,sleeping:false,transit:false,groupInteraction:false,withId:undefined,withIds:[],needKey:undefined,recoveryStartedAt:undefined,recoveryEndsAt:undefined,furniture:undefined,meetingFurniture:undefined,home:true,visitHomeId:c.homeId,room:Object.entries(world.homes?.[c.homeId]?.rooms||{}).find(([k,r])=>r.type==='study'||k==='study')?.[0]||'living',title,desc,baseTitle:title,baseDesc:desc,activityFamily:'reading',actionKind:'read',activityStartedAt:data.active.startedAt,activityEndsAt:data.active.endsAt};}
 return scene;
}
