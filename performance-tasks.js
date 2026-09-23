export const PERFORMANCE_TASKS=[
 {id:'play_piano',kind:'music',group:'hobby',room:'hobby',minutes:30,labels:['피아노 연주하기','Play the piano','ピアノを弾く'],details:['건반을 누르는 힘과 박자를 맞추며 피아노를 연주하고 있어요.','They play the piano, controlling touch and rhythm.','タッチと拍子を整えながらピアノを弾いています。']},
 {id:'play_instrument',kind:'music',group:'hobby',room:'hobby',minutes:30,labels:['악기 연주하기','Play an instrument','楽器を演奏する'],details:['악기의 음을 맞추고 선율을 이어 연주하고 있어요.','They tune the instrument and play through the melody.','楽器の音を合わせ、旋律をつないで演奏しています。']}
];
const rows=[
 ['공연 준비','악보와 공연 순서를 확인하고 무대에 가져갈 물건을 챙기고 있어요.','Preparing for the performance','Checking the set list and gathering stage essentials.','公演の準備中','曲順を確認し、ステージに持っていく物を用意しています。'],
 ['발성 연습','호흡을 고르게 내쉬며 낮은 음부터 천천히 목을 풀고 있어요.','Vocal warm-up','Warming up from low notes with steady breathing.','発声練習中','息を整え、低い音からゆっくり声を出しています。'],
 ['마이크 점검','짧은 구절을 부르며 마이크 음량과 반주 균형을 맞추고 있어요.','Sound check','Singing a short phrase to balance the microphone and accompaniment.','音響確認中','短いフレーズを歌い、マイクと伴奏のバランスを整えています。'],
 ['후렴 연습','후렴의 긴 음을 유지하고 끝 음정이 흔들리지 않는지 확인하고 있어요.','Practising the chorus','Holding the chorus notes and checking the final pitch.','サビの練習中','サビの長い音を伸ばし、最後の音程を確認しています。'],
 ['동선 리허설','무대 표시를 따라 움직이며 노래와 이동 타이밍을 맞추고 있어요.','Stage rehearsal','Following stage marks and matching movement to the song.','立ち位置のリハーサル中','舞台の印をたどり、歌と移動のタイミングを合わせています。'],
 ['노래 부르는 중','반주에 맞춰 노래를 부르며 관객석 쪽으로 시선을 보내고 있어요.','Singing on stage','Singing with the accompaniment while facing the audience.','歌唱中','伴奏に合わせて歌いながら客席に視線を向けています。'],
 ['안무 연습','박자를 세며 발동작과 손끝의 방향을 반복해서 맞추고 있어요.','Dance practice','Counting beats and refining steps and hand movements.','ダンスの練習中','拍子を数え、足運びと指先の向きを繰り返し合わせています。'],
 ['공연 마무리','마이크를 반납하고 무대에 남은 소품을 대기실로 옮기고 있어요.','Wrapping up the show','Returning the microphone and carrying props backstage.','公演の片付け中','マイクを返し、舞台に残った小道具を楽屋に運んでいます。']
];
export function performanceDuty(c,job,date,start,end,language){
 const minute=date.getHours()*60+date.getMinutes(),hash=[...String(c.id)].reduce((n,x)=>n+x.charCodeAt(0),0),slot=Math.floor((minute-start)/35);
 const sequence=job.jobId==='builtin-idol'?[1,2,6,4,5,3]:[1,2,3,4,5];
 const index=minute<start+10?0:minute>=end-10?7:sequence[(slot+hash)%sequence.length],row=rows[index],offset=language==='en'?2:language==='ja'?4:0;
 return {title:row[offset],desc:row[offset+1],officeTaskId:job.jobId+':'+index,officeRole:job.jobId,officeRoom:index===0||index===7?'backstage':'stage',economyWork:true};
}
