import fs from "node:fs";
import assert from "node:assert/strict";

const read=file=>fs.readFileSync(new URL(`../${file}`,import.meta.url),"utf8");
const achievementsSource=read("achievements.js"),stateSource=read("state.js"),views=read("views.js"),app=read("app.js"),css=read("app.css"),gradle=read("android/app/build.gradle"),manifest=read("android/app/src/main/AndroidManifest.xml"),strings=read("android/app/src/main/res/values/strings.xml"),main=read("android/app/src/main/java/com/drawervillage/app/MainActivity.java"),plugin=read("android/app/src/main/java/com/drawervillage/app/PlayGamesAchievementsPlugin.java"),application=read("android/app/src/main/java/com/drawervillage/app/DrawerVillageApplication.java"),sw=read("sw.js");

assert.match(gradle,/versionCode\s+(?:194|195)/);
assert.match(gradle,/versionName\s+["']1\.0\.(?:181|182)["']/);
assert.match(gradle,/play-services-games-v2:21\.0\.0/);
assert.match(manifest,/com\.google\.android\.gms\.games\.APP_ID/);
assert.match(manifest,/android:name="\.DrawerVillageApplication"/);
assert.match(application,/PlayGamesSdk\.initialize/);
assert.match(main,/registerPlugin\(PlayGamesAchievementsPlugin\.class\)/);
assert.match(plugin,/getGamesSignInClient/);
assert.match(plugin,/getAchievementsClient/);
assert.match(plugin,/\.unlock\(id\)/);
assert.match(plugin,/\.setSteps\(id, steps\)/);
assert.match(plugin,/getAchievementsIntent/);
assert.match(strings,/<bool name="play_games_configured">false<\/bool>/);
assert.equal((strings.match(/name="achievement_/g)||[]).length,8);
assert.match(views,/data-settings-pane="achievements"/);
assert.match(views,/data-open-google-achievements/);
assert.match(app,/parallel-city-saved/);
assert.match(css,/\.achievement-grid/);
assert.match(sw,/(?:taste-scroll-194|personality-home-195)/);
assert.match(stateSource,/userCreated:true/);
assert.match(achievementsSource,/profile_complete/);

const {ACHIEVEMENTS,achievementProgress,characterSetupSections,evaluateAchievements}=await import("../achievements.js");
assert.equal(ACHIEVEMENTS.length,8);
const empty={characters:{},relationships:{},homes:{},towns:[],world:{places:[]},catalog:{fashion:[]}};
assert.equal(achievementProgress(empty).first_character,0);
const character={id:"c1",name:"완성 캐릭터",icon:"icon",ldImage:"ld",gender:"여성",birthday:"0101",educationLevel:"대학",lifeAdaptation:"익숙함",bodyProfile:{heightCm:"170",weightKg:"60",bodySize:"보통",heightImpression:"보통",physicalTraits:["점"]},personalityTypes:["낙천적"],characterTraits:["다정함"],emotionalBaseline:"낙천적인 편",angerResponse:"차분히 이유를 확인함",flirtResponse:"은근히 받아줌",interests:["그림"],hobbies:["독서"],favorites:{food:["food1"]},inventory:{fashion:[]},savedOutfits:[{id:"outfit1"}]};
const completeWorld={characters:{c1:character},relationships:{r1:{id:"r1"}},homes:{h1:{id:"h1",userCreated:true}},towns:[{id:"t1",places:[]},{id:"t2",places:[]},{id:"t3",places:[]}],world:{places:[]},catalog:{fashion:[{id:"outfit1",userCreated:true}],food:[{id:"food1",userCreated:true}]}};
assert.deepEqual(characterSetupSections(character,completeWorld),{visual:true,profile:true,body:true,personality:true,taste:true,closet:true});
const evaluated=evaluateAchievements(completeWorld,1234);
assert.equal(evaluated.progress.profile_complete,6);
assert.equal(evaluated.unlockedAt.profile_complete,1234);
assert.equal(evaluated.unlockedAt.first_building,1234);
assert.equal(evaluated.unlockedAt.three_towns,1234);

console.log("Google Play 게임즈 업적 판정·저장·네이티브 연결 회귀 검증 완료");
