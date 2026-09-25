// Localized counterparts of the supplied work decks; ordering is tested.
export const JOB_LOG_COPY={};
function deck(key,phase,rows){(JOB_LOG_COPY[key]??={})[phase]=rows.trim().split('\n').map(line=>line.split('|'));}
deck('janitor','work',`
Sweeping the alley|They gather leaflets and leaves around the drain.|路地を掃いているところ|排水口の周りの紙と落ち葉を集めています。
Scrubbing a stain|They scrub a dried drink stain with detergent.|汚れを落としているところ|洗剤とブラシで飲み物の跡をこすっています。
Emptying a bin|They remove the full bag and fit a fresh one.|ごみ箱を空にしているところ|満杯の袋を取り、新しい袋を入れています。
Picking up litter|They collect cigarette ends around the stop.|ごみを拾っているところ|停留所の吸い殻を拾っています。
Mopping the stairs|They wipe each step from the top down.|階段を拭いているところ|上から一段ずつ水拭きしています。
Cleaning a glass door|They remove fingerprints with a squeegee.|ガラスを清掃中|スクイージーで指の跡を拭き取っています。
Sorting recycling|They separate mixed cans and plastics.|資源ごみを分別中|缶とプラスチックを分けています。
Cleaning the restroom|They wipe the sink and refill paper and soap.|トイレを掃除中|洗面台を拭き、紙と石けんを補充しています。
Waxing the floor|They spread a thin coat and let it dry.|床にワックスを塗っているところ|薄く塗り、乾くのを待っています。
Polishing the floor|They slowly push the floor polisher.|床を磨いているところ|ポリッシャーをゆっくり押しています。
Treating a carpet stain|They dab cleaner into the stained patch.|カーペットを手入れ中|染みに専用洗剤をなじませています。
Checking bulky waste|They look for a collection label on discarded furniture.|粗大ごみを確認中|捨てられた家具の回収シールを確認しています。
Making a collection round|They gather bags along the assigned route.|回収区域を巡回中|決められた経路で袋を集めています。
Emptying food-waste bins|They empty the container and rinse it.|生ごみ容器を清掃中|中を空にして水ですすいでいます。
Collecting leaves|They gather scattered leaves into a sack.|落ち葉を集めているところ|一か所に集めて袋に入れています。
Clearing snow|They clear the pavement and spread de-icer.|除雪中|歩道の雪をよけ、融雪剤をまいています。
Disinfecting handles|They wipe buttons and door handles.|接触面を消毒中|ボタンとドアノブを拭いています。
Writing the work log|They record cleaned areas and unusual findings.|作業日誌を記入中|清掃区域と気づいた点を記録しています。
`);
deck('innkeeper','work',`
Welcoming a guest|They hand over a key and explain the facilities.|客を迎えているところ|鍵を渡し、利用方法を説明しています。
Preparing a room|They strip the bed and put on fresh sheets.|客室を整えているところ|使った寝具を外し、新しいシーツを敷いています。
Setting breakfast|They lay out dishes for the guests.|朝食の準備中|宿泊人数に合わせて食器を並べています。
Hanging laundry|They hang towels and sheets in the sun.|洗濯物を干しているところ|庭にタオルとシーツを干しています。
Updating the ledger|They record today's lodging payments.|帳簿を記入中|今日の宿泊費を書き込んでいます。
Fixing a door|They oil a squeaking hinge.|扉を直しているところ|きしむ蝶番に油を差しています。
Giving directions|They draw a village map for a guest.|道を案内中|客に村の地図を描いています。
Receiving ingredients|They carry delivered boxes into the kitchen.|食材を運んでいるところ|届いた箱を厨房へ運んでいます。
Checking reservations|They compare bookings with available rooms.|予約を照合中|日付ごとの予約と空室を比べています。
Settling a checkout|They calculate the stay and extra charges.|宿泊費を精算中|泊数と追加料金を計算しています。
Inspecting rooms|They check towels and supplies after cleaning.|客室を点検中|清掃後のタオルと備品を確認しています。
Sorting lost property|They date and store items left behind.|忘れ物を整理中|日付をつけて保管しています。
Checking the boiler|They inspect hot-water temperature and pipes.|給湯設備を点検中|温水の温度と配管を確認しています。
Planning breakfasts|They plan the week's menu around the stock.|献立を考えているところ|在庫に合わせて朝食を決めています。
Preparing for a regular guest|They reserve the guest's favorite room.|常連客の部屋を準備中|いつもの部屋を空けておいています。
Arranging shifts|They adjust staff coverage for busy days.|勤務表を作成中|忙しい日に人手が足りるよう調整しています。
Reading the guestbook|They note feedback and concerns.|宿帳の感想を読んでいるところ|客の意見と不便だった点を控えています。
Preparing a fireplace|They add fuel and inspect the flue.|暖炉を準備中|燃料を補充し、煙道を確認しています。
`);
deck('selfEmployed','work',`
Helping a customer|They greet the customer and ask what they need.|接客中|挨拶し、探している物を聞いています。
Tidying a display|They straighten goods along the shelves.|陳列を整理中|商品を手前に揃えて並べています。
Checking stock|They list goods running low in the storeroom.|在庫を確認中|少なくなった商品を控えています。
Placing an order|They call the supplier with the required quantities.|発注中|取引先に必要な数量を伝えています。
Serving at the till|They check each item and take payment.|会計中|商品を確認して精算しています。
Cleaning the shop|They sweep and wipe glass between customers.|店を掃除中|客の少ない間に床とガラスを清掃しています。
Calculating sales|They total today's takings.|売上を整理中|今日の売上を計算しています。
Updating a sign|They rewrite the sign for the entrance.|看板を書き直し中|店先に置く案内文を整えています。
Preparing tax records|They sort invoices and receipts by quarter.|税務資料を整理中|請求書と領収書を四半期ごとに分けています。
Calculating margins|They compare buying and selling prices.|利益を計算中|仕入れ値と販売価格を比べています。
Displaying new stock|They put new goods where customers can see them.|新商品を陳列中|目につきやすい場所に並べています。
Negotiating prices|They discuss the unit price for a larger order.|単価を交渉中|注文量に応じた価格を相談しています。
Writing a promotion|They photograph the shop and post today's news.|案内を投稿中|店の写真と今日のお知らせを用意しています。
Preparing for a regular|They set aside something a regular customer likes.|常連客に備えているところ|好みに合う物を取り置きしています。
Training a new employee|They demonstrate how to use the till.|従業員を指導中|レジの使い方を教えています。
Checking delivery orders|They review incoming orders and packing order.|配達注文を確認中|入った注文を見て梱包の順番を決めています。
Handling an exchange|They check the returned item's condition.|交換に対応中|持ち込まれた商品の状態を確認しています。
Rearranging the shop|They move displays based on customer traffic.|売場を調整中|客の動きを見て陳列台を移しています。
`);
deck('clergy','work',`
Reading scripture|They slowly read a passage aloud.|経典を読んでいるところ|一節をゆっくり声に出しています。
Preparing a talk|They revise the words they will share.|話を準備中|人々に伝える原稿を推敲しています。
Listening to a concern|They listen patiently to the person opposite them.|相談を受けているところ|相手の悩みを最後まで聞いています。
Preparing a ceremony|They put ceremonial objects in place.|儀式を準備中|祭壇と道具を整えています。
Volunteering|They pack food to share with neighbors.|奉仕活動中|近所に配る食べ物を包んでいます。
Cleaning the meeting space|They wipe the places where people sit.|場所を清掃中|人々の座る場所を拭いています。
Visiting a neighbor|They check on a neighbor who is unwell.|近所を訪問中|体調の悪い人に様子を尋ねています。
Meditating|They sit upright and focus on breathing.|瞑想中|姿勢を正し、呼吸に集中しています。
Studying scripture|They compare interpretations in commentaries.|経典を研究中|注釈書で解釈を比べています。
Leading a ceremony|They guide the ceremony in a calm voice.|儀式を進めているところ|順序に沿って落ち着いた声で導いています。
Teaching beliefs|They explain basic teachings to newcomers.|教えを伝えているところ|初めて来た人に分かりやすく説明しています。
Meeting volunteers|They plan preparations for the next event.|奉仕者と会議中|次の行事の準備を分担しています。
Updating the register|They organize membership and event records.|名簿を整理中|構成員と行事の記録を整えています。
Preparing a memorial|They quietly discuss the order with the family.|追悼の準備中|遺族と式の順番を相談しています。
Leading singing practice|They rehearse songs for the ceremony.|歌の練習を指導中|儀式で歌う曲を一緒に練習しています。
Visiting a patient|They listen beside a hospitalized member.|見舞い中|入院中の人のそばで話を聞いています。
Recording donations|They record gifts and check their use.|寄付の帳簿を整理中|入金と使い道を確認しています。
Practicing reflection|They spend a quiet period in contemplation.|修養中|言葉を控え、静かに心を整えています。
`);
deck('barista','work',`
Pulling an espresso|They fill and tamp the portafilter before brewing.|コーヒーを抽出中|粉を均一に詰め、抽出しています。
Steaming milk|They tilt the pitcher to refine the foam.|ミルクを温め中|ピッチャーを傾け、泡を整えています。
Making latte art|They pour milk into the tilted cup.|ラテアート中|カップを傾け、ミルクで模様を描いています。
Taking an order|They repeat the order while entering it in the till.|注文を受けているところ|注文を復唱し、レジに入力しています。
Clearing tables|They remove cups and wipe the table.|テーブルを整理中|カップを下げ、テーブルを拭いています。
Refilling syrup|They fill the bottles and put them back.|シロップを補充中|瓶を補充して元に戻しています。
Displaying desserts|They arrange cakes in the showcase.|デザートを陳列中|ショーケースにケーキを並べています。
Tasting beans|They compare the aroma and taste of new beans.|豆を試飲中|新しい豆の香りと味を比べています。
Adjusting the recipe|They weigh coffee and time extraction to balance flavor.|抽出を調整中|粉量と時間を測り、味を整えています。
Making pour-over coffee|They bloom the grounds and pour in stages.|ドリップ中|蒸らしてから少しずつ湯を注いでいます。
Tasting an espresso|They check the balance of acidity and bitterness.|エスプレッソを味見中|酸味と苦味のバランスを確認しています。
Checking milk stock|They check expiry dates on milk and alternatives.|ミルクを確認中|牛乳と代替ミルクの期限を確認しています。
Preparing cold brew|They add cold water to coarsely ground beans.|水出しを準備中|粗く挽いた豆に冷水を注いでいます。
Wiping the steam wand|They wipe off milk before it dries.|ノズルを清掃中|ミルクが固まる前に拭き取っています。
Rotating the beans|They put older roast dates at the front.|豆の順番を整理中|焙煎日を見て先に使う袋を手前に置いています。
Testing a new drink|They try several syrup ratios.|新メニューを試作中|シロップの比率を変えて作っています。
Working through orders|They prepare drinks in ticket order.|注文を順に作っているところ|伝票の順番で飲み物を用意しています。
Teaching a junior barista|They demonstrate tamping posture and pressure.|後輩を指導中|タンピングの姿勢と力加減を見せています。
`);
deck('unemployed','day',`
Sleeping in|They silence the alarm and pull the covers closer.|寝坊中|アラームを止め、布団を引き寄せています。
Browsing job listings|They read the conditions in new job adverts.|求人を見ているところ|新しい募集の条件を読んでいます。
Revising a resume|They rework the personal statement.|履歴書を修正中|自己紹介の文章を書き直しています。
Doing housework|They put laundry on and tidy the floor.|家事をしているところ|洗濯を始め、床を片付けています。
Walking around the neighborhood|They look at shop signs on a casual stroll.|近所を散歩中|店の看板を眺めながら歩いています。
Shopping for groceries|They browse shelves with a short shopping list.|買物中|メモを見ながら売場を回っています。
Catching up on a drama|They continue the episode they left unfinished.|ドラマを見ているところ|途中だった話の続きを見ています。
Studying for a qualification|They revisit problems they got wrong.|資格の勉強中|間違えた問題を解き直しています。
Contacting a friend|They send a message to an old friend.|友達に連絡中|久しぶりの相手に挨拶を送っています。
Lying back and thinking|They gaze at the ceiling and consider today's plans.|のんびりしているところ|天井を見て今日の予定を考えています。
Shortlisting jobs|They compare requirements and deadlines.|求人を絞っているところ|応募条件と締切を表にまとめています。
Revising an application|They describe past experience within the word limit.|応募文を推敲中|字数に合わせ、経験を具体的に書いています。
Preparing a portfolio|They select finished work and add a short summary.|作品集を準備中|完成した作品を選び、概要を添えています。
Practicing an interview|They record answers to likely questions.|面接を練習中|想定質問への答えを録音しています。
Waiting for career advice|They hold a number ticket at the employment office.|相談を待っているところ|就職相談の番号札を持って待っています。
Taking an online course|They note key points from a professional course.|講座を受講中|オンライン講座の要点をメモしています。
Recording household expenses|They look for spending they can reduce.|家計簿を記入中|支出を分け、減らせる項目を探しています。
Looking for short-term work|They mark available dates on job adverts.|短期の仕事を探しているところ|募集を見て働ける日を確認しています。
Contacting an old colleague|They send greetings to former coworkers.|元同僚に連絡中|連絡先を見て近況を尋ねています。
Tidying a drawer|They sort out items they no longer use.|引出しを整理中|使わない物を選び出しています。
`);
deck('singer','work',`
Recording vocals|They repeat the same phrase through headphones.|歌を録音中|ヘッドホンをつけ、同じフレーズを歌い直しています。
Interpreting lyrics|They mark where to emphasize the words.|歌詞を解釈中|歌詞を読み、強調する箇所に印をつけています。
Rehearsing with the band|They check their entrances with the musicians.|合奏中|バンドと歌い始めるタイミングを合わせています。
Listening to a recording|They note passages they want to improve.|録音を確認中|気になる箇所をメモしながら聞いています。
Rehearsing on stage|They sing while following the stage route.|リハーサル中|舞台の動線を歩きながら歌っています。
Developing a song|They hum a new melody into their phone.|曲を作っているところ|浮かんだ旋律を口ずさみ、録音しています。
Appearing on radio|They chat with the presenter at the microphone.|ラジオに出演中|マイクの前で司会者と話しています。
Practicing breathing|They sustain a phrase on one breath.|呼吸を練習中|一息でフレーズを歌う練習をしています。
Receiving vocal direction|They try a passage with different expressions.|歌唱指導を受けているところ|同じ箇所を違う表現で歌っています。
Recording harmonies|They layer harmonies over the main melody.|コーラスを録音中|主旋律に和音を重ねています。
Checking the mix|They listen to the balance of vocals and accompaniment.|ミックスを確認中|声と伴奏のバランスを聞いています。
Adjusting the key|They test keys to find a comfortable range.|キーを調整中|半音ずつ変え、歌いやすい高さを探しています。
Checking in-ear monitors|They check how clearly they hear the music.|イヤーモニターを点検中|自分の声と伴奏の聞こえ方を確認しています。
Planning a set list|They rearrange songs to improve the flow.|曲順を考えているところ|公演全体の流れに合わせて並べ替えています。
Writing lyrics|They count syllables against the melody.|作詞中|旋律に合わせて音節を数えています。
Doing a sound check|They sing short phrases with the sound team.|サウンドチェック中|音響担当と短い歌で音を合わせています。
Refining pronunciation|They practice consonants slowly for clarity.|発音を練習中|歌詞が明瞭に聞こえるようゆっくり練習しています。
Discussing an arrangement|They discuss the opening instruments with the arranger.|編曲を相談中|導入部分に使う楽器を話し合っています。
`);
deck('idol','work',`
Practicing choreography|They repeat movements to the beat in the mirror.|振付を練習中|鏡を見て拍子に合わせて動いています。
Aligning formations|They change positions with the other members.|立ち位置を調整中|メンバーと位置を入れ替えて隊形を合わせています。
Taking a vocal lesson|They repeat a high passage to piano accompaniment.|ボーカルレッスン中|ピアノに合わせて高音部分を繰り返しています。
Reviewing practice footage|They look for movements that are out of sync.|練習映像を確認中|動きがずれた箇所を探しています。
Doing a photo shoot|They adjust expressions to the photographer's directions.|撮影中|カメラマンの指示に合わせて表情を変えています。
Having makeup done|They close their eyes while the makeup is applied.|メイク中|椅子に座り、目を閉じて待っています。
Talking with fans|They read fan messages and write replies.|ファンと交流中|メッセージを読み、返事を書いています。
Waiting backstage|They mentally rehearse while waiting for the music show.|出演を待っているところ|出番を待ちながら動きを思い返しています。
Practicing camera marks|They rehearse where to look on stage.|カメラ位置を確認中|舞台のカメラに合わせて視線を練習しています。
Learning their parts|They memorize their sections of the new song.|パートを覚えているところ|新曲の担当部分を覚えています。
Practicing live singing|They steady their breathing while dancing.|ライブの練習中|踊りながら歌が揺れないよう呼吸を合わせています。
Refining the key move|They repeat the signature move in front of the mirror.|ポイント振付を調整中|鏡の前で短い動きを磨いています。
Pre-recording a performance|They repeat the stage performance for filming.|事前収録中|同じステージを何度か撮影しています。
Filming a group show|They play games with members for a video.|企画動画を撮影中|メンバーとゲームをしながら撮影しています。
Signing albums|They greet each fan while signing.|サイン会中|一人ずつ目を合わせてアルバムにサインしています。
Training their fitness|They work on core exercises with a trainer.|体力づくり中|トレーナーと体幹を鍛えています。
Learning a language|They practice greetings for overseas appearances.|外国語を学習中|海外で使う挨拶の発音を練習しています。
Filming a vlog|They record today's practice with a camera.|ブログ動画を撮影中|今日の練習の様子を記録しています。
`);
deck('artist','work',`
Sketching|They try several compositions in pencil.|スケッチ中|鉛筆で構図を何度も描いています。
Painting|They mix colors to find the right tone.|彩色中|パレットで色を混ぜ、求める色調を探しています。
Studying the artwork|They step back to examine the work.|作品を眺めているところ|少し離れ、制作中の絵を見つめています。
Organizing materials|They wash brushes and check paint supplies.|画材を整理中|筆を洗い、絵の具の残量を確認しています。
Collecting references|They arrange photos and images on the wall.|資料を集めているところ|参考画像を集めて壁に貼っています。
Preparing an exhibition|They measure and mark hanging positions.|展示を準備中|作品を掛ける位置を測って印をつけています。
Recording their work|They photograph the piece and consider a title.|作品を記録中|写真を撮り、題名を考えています。
Repainting a section|They cover an unsatisfying passage and start again.|描き直し中|気になる部分を塗り直しています。
Drawing quick studies|They capture the figure's movement in a short sketch.|クロッキー中|短時間で人体の流れを描いています。
Applying an underpainting|They spread a thin base color over the canvas.|下塗り中|キャンバスに薄く地色を塗っています。
Stretching a canvas|They pull the fabric taut over its wooden frame.|キャンバスを張っているところ|木枠に布を張って固定しています。
Building shadows|They establish the light direction and darker areas.|陰影を描いているところ|光の方向を決め、暗い部分から重ねています。
Varnishing a painting|They apply a thin protective coat to the dry painting.|保護剤を塗っているところ|乾いた絵にワニスを薄く塗っています。
Writing an artist statement|They describe the intent behind the series.|制作ノートを執筆中|連作の意図を短い文章にまとめています。
Photographing artwork|They adjust lights for a straight-on photograph.|作品を撮影中|照明を合わせ、正面から撮影しています。
Meeting a curator|They discuss the exhibition layout and number of works.|学芸員と打合せ中|展示構成と作品数を相談しています。
Testing materials|They compare the new paint's color and drying time.|画材を試しているところ|発色と乾く速さを比べています。
Working on a commission|They sketch with the client's requirements beside them.|依頼作品を制作中|依頼内容を確認しながらラフを描いています。
`);
deck('pirate','work',`
Scrubbing the deck|They scrub the planks with a wet brush.|甲板を磨いているところ|濡らしたブラシで板をこすっています。
Securing ropes|They retie a loosened rope firmly.|縄を結んでいるところ|緩んだ縄をしっかり結び直しています。
Mending a sail|They stitch a hole with a thick needle.|帆を繕っているところ|太い針で穴を縫っています。
Keeping lookout|They scan the horizon from the mast.|見張り中|マストから水平線を見渡しています。
Reading a chart|They trace the route on an old map.|海図を確認中|古い地図で航路をたどっています。
Recording loot|They list the contents of a chest in a ledger.|荷品を整理中|箱の中身を帳簿に書いています。
Cleaning a cannon|They wipe salt from the barrel.|大砲を手入れ中|砲身についた塩分を拭き取っています。
Singing a sea shanty|They pull the anchor rope to the crew's rhythm.|船歌を歌っているところ|仲間と拍子を合わせて錨綱を引いています。
Measuring depth|They lower a weighted line into the water.|水深を測っているところ|重りのついた綱を水中に下ろしています。
Measuring the ship's speed|They count the knots on a trailing line.|船速を測っているところ|流した綱の結び目を数えています。
Steering|They hold the wheel and check the compass.|舵を取っているところ|羅針盤を見ながら進路を合わせています。
Adjusting the sails|They pull the lines to match the wind.|帆を調整中|風に合わせて帆綱を引いています。
Sealing hull seams|They fill gaps between the planks.|船体を補修中|板の隙間を埋めています。
Sharing drinking water|They check the supply and portion it out.|水を分けているところ|残量を確認して船員に配っています。
Navigating by the stars|They measure a star's height to estimate position.|星で位置を測定中|星の高度から船の位置を計算しています。
Writing the ship's log|They record weather, course and distance.|航海日誌を記入中|天気と航路、移動距離を記録しています。
Meeting the crew|They discuss the next destination.|船員と相談中|次の目的地について意見を交わしています。
Balancing the cargo|They rearrange the hold to distribute weight.|船倉を整理中|重さが偏らないよう積み直しています。
`);
deck('soldier','work',`
Training|They march in formation to the commands.|訓練中|号令に合わせて隊列を揃えて行進しています。
Exercising|They run around the grounds and steady their breathing.|体力づくり中|広場を走り、呼吸を整えています。
Standing guard|They watch the surroundings from the post.|警戒勤務中|持ち場で周囲を確認しています。
Checking equipment|They compare issued items with the inventory.|装備を点検中|支給品の数量と状態を一覧と照合しています。
Maintaining the grounds|They clear weeds and drainage channels.|敷地を整備中|草を刈り、排水路を整理しています。
Attending a lesson|They take notes in the hall.|講習中|講堂で内容を手帳に書いています。
Doing administrative work|They complete the required report forms.|事務作業中|書式に合わせて報告書を作っています。
Tidying the quarters|They fold blankets and organize their locker.|居室を整理中|毛布を畳み、ロッカーを整えています。
Attending a training briefing|They listen to today's training plan.|訓練説明を受けているところ|状況板の前で計画を聞いています。
Practicing map reading|They locate themselves with a map and compass.|地図の読取り訓練中|地図と方位磁針で現在地を確認しています。
Making a radio report|They give a short status report.|無線で報告中|決められた呼び方で状況を伝えています。
Marching|They carry their pack and keep their spacing.|行軍中|荷物を背負い、前の人との間隔を保っています。
Taking a fitness test|They complete push-ups on the signal.|体力測定中|合図に合わせて腕立て伏せをしています。
Maintaining a vehicle|They check tire pressure and oil.|車両を整備中|タイヤの空気圧とオイルを点検しています。
Learning first aid|They practice applying a bandage.|応急手当を練習中|包帯を巻く練習をしています。
Serving on duty|They record patrol times and answer calls.|当直中|巡回時刻を記録し、電話に応答しています。
Reporting training results|They present the completed report.|訓練結果を報告中|まとめた報告書で結果を伝えています。
Practicing drill|They repeat turns and salutes on command.|基本動作を訓練中|号令に合わせて敬礼と方向転換を繰り返しています。
`);
deck('criminal','work',`
Keeping watch|They watch the alley through the curtain.|見張り中|カーテンの隙間から路地を見ています。
Checking a ledger|They compare the ledger's cryptic figures.|帳簿を確認中|記号で書かれた数字を照合しています。
Waiting for a call|They watch the phone on the table.|連絡を待っているところ|机の上の電話を見ています。
Talking quietly|They speak in low voices over a map.|小声で相談中|広げた地図を前に話しています。
Listening to rumors|They listen to local talk at a small shop.|噂を聞いているところ|路地の店で最近の話を聞いています。
Discarding notes|They tear up a note they no longer need.|メモを片付け中|不要になった紙を破って捨てています。
Meeting someone|They exchange a few words in a quiet place.|人と会っているところ|人けの少ない場所で短く話しています。
Trying a different look|They adjust a hat in front of the mirror.|身なりを変えているところ|鏡の前で帽子を深くかぶっています。
Gathering local news|They arrange clippings and rumors on the wall.|情報を整理中|新聞と噂を壁にまとめています。
Agreeing on code words|They memorize the group's new expressions.|合言葉を確認中|仲間で決めた表現を覚えています。
Considering an offer|They think over the terms without answering yet.|条件を考えているところ|提示された条件を吟味しています。
Packing to move|They pack only their essential belongings.|移る準備中|必要な物だけをかばんに入れています。
Discussing shares|They sit around the table and discuss each share.|取り分を相談中|机を囲んで話しています。
Reporting back|They give a brief update and wait for a reply.|状況を報告中|最近の様子を伝え、返事を待っています。
Waiting for a contact|They watch the window from a nearby cafe.|待合せ中|近くのカフェで窓の外を見ています。
Checking behind them|They glance back while taking a longer route.|後ろを確認中|遠回りしながら後ろを見ています。
Talking to a newcomer|They ask questions and watch the response.|新入りと会話中|質問をして反応を見ています。
Comparing stories|They discuss where they were that day.|話を確認中|その日の居場所について仲間と話しています。
`);
deck('politician','work',`
Attending a meeting|They read agenda papers and listen to speakers.|会議に出席中|議案資料を読み、発言を聞いています。
Revising a speech|They read the draft aloud and smooth awkward phrases.|演説を推敲中|原稿を声に出して読み、表現を直しています。
Hearing a petition|They listen to a resident and ask an aide to take notes.|陳情を聞いているところ|住民の話を聞き、補佐役に記録を頼んでいます。
Giving an interview|They choose their words before answering.|取材に答えているところ|質問への答えを考えて言葉を選んでいます。
Visiting the community|They greet traders while walking through the market.|地域を訪問中|市場を回り、商店の人々に挨拶しています。
Reviewing a bill|They underline clauses that need attention.|法案を検討中|条文を読み、気になる箇所に線を引いています。
Making calls|They contact people whose cooperation is needed.|連絡を取っているところ|協力が必要な相手に順に電話しています。
Attending a local event|They give a short greeting on stage.|地域行事に出席中|舞台に上がり、短い挨拶をしています。
Preparing questions|They organize committee questions from official papers.|質疑を準備中|資料を読み、委員会での質問を整理しています。
Reviewing a budget|They compare changes and flag items needing explanation.|予算案を検討中|増減を比べ、説明が必要な項目に印をつけています。
Meeting aides|They discuss responses to this week's issues.|補佐役と会議中|今週の課題への対応を相談しています。
Holding a policy discussion|They listen to stakeholders and take notes.|政策懇談中|関係者の意見を聞き、要点を記録しています。
Checking a press release|They review the wording before publication.|発表資料を確認中|公開前の文面を一行ずつ確認しています。
Visiting the district office|They hear staff reports on resident requests.|地域事務所を訪問中|受け付けた陳情の状況を職員から聞いています。
Preparing for a vote|They review the issues on the plenary agenda.|採決の準備中|本会議の議案と論点を読み直しています。
Attending a debate|They note points to address after each speaker.|討論会に出席中|発言を聞き、意見を述べる点をメモしています。
Requesting statistics|They send an official request for needed data.|資料を請求中|必要な統計を関係機関に正式に依頼しています。
Signing documents|They read each document before signing.|書類に署名中|提出された書類を読んで署名しています。
`);
deck('reporter','work',`
Gathering information|They record people's accounts in a notebook.|取材中|現場の人々の話を手帳に記録しています。
Conducting an interview|They record the conversation and ask prepared questions.|インタビュー中|録音しながら用意した質問をしています。
Writing an article|They revise the opening while watching the deadline.|記事を執筆中|締切を確認しながら冒頭を書き直しています。
Checking facts|They verify the figures against source material.|事実を確認中|記事の数字を資料と照合しています。
Transcribing an interview|They replay the recording and write key passages.|録音を書き起こし中|録音を聞き、必要な箇所を書き出しています。
Checking a tip|They read the message and note whom to contact.|情報提供を確認中|届いた情報を読み、確認先を控えています。
Calling the editor|They discuss the article's direction and take notes.|編集者と通話中|記事の方向性を相談し、メモしています。
Choosing a photo|They compare images for the clearest shot.|写真を選んでいるところ|記事に使う鮮明な写真を選んでいます。
Visiting the press room|They check the day's planned announcements.|記者室を訪問中|今日予定されている発表を確認しています。
Comparing press materials|They compare published figures with the original.|発表資料を照合中|配布資料の数値を原文と比べています。
Covering a press conference|They take notes and prepare a question.|記者会見を取材中|発言を記録し、質問する機会を待っています。
Structuring a feature|They arrange their reporting into an outline.|特集を構成中|取材内容を並べ、記事の骨組みを作っています。
Calling an expert|They ask an expert about the central issue.|専門家に取材中|電話で論点についての見解を聞いています。
Seeking a response|They contact the subject of the article for comment.|当事者に確認中|記事に登場する当事者の見解を求めています。
Searching public records|They compare published statistics and disclosures.|公開資料を調査中|統計や開示資料を集めて比較しています。
Checking copy edits|They ensure revisions preserve the intended meaning.|校閲を確認中|修正後の文章が元の意味と合うか確認しています。
Writing headlines|They draft several one-line summaries.|見出しを考えているところ|記事を一行で表す案を書き出しています。
Planning follow-up reporting|They list unanswered questions from the story.|続報を計画中|今回の記事で未解決の点を整理しています。
`);
deck('chef','work',`
Preparing vegetables|They slice onions and leeks evenly into containers.|野菜を仕込み中|玉ねぎとねぎを揃えて切り、容器に分けています。
Making stock|They skim foam from the large pot.|だしを取っているところ|大鍋に浮いたあくを取り除いています。
Making sauce|They stir over low heat and check the seasoning.|ソースを作っているところ|弱火で混ぜながら味を確認しています。
Cooking orders|They check tickets and work with two pans.|注文の料理を調理中|注文票を見ながら二つのフライパンを使っています。
Plating food|They wipe the rim and add the final garnish.|盛り付け中|皿の縁を拭き、最後の飾りを添えています。
Helping wash up|They rinse utensils and leave them to dry.|洗い物を手伝い中|調理道具をすすぎ、乾かしています。
Sharpening a knife|They maintain a steady angle against the whetstone.|包丁を研いでいるところ|砥石に当てる角度を保ちながら研いでいます。
Tasting a new dish|They sample the dish and adjust its seasoning.|新メニューを試食中|一口味見して調味を整えています。
Measuring ingredients|They portion ingredients into small containers.|材料を計量中|営業前の材料を量り、小さな容器に分けています。
Dicing vegetables|They cut carrots and celery into even cubes.|野菜を刻んでいるところ|にんじんとセロリを均一な角切りにしています。
Trimming meat|They remove sinew and cut even slices.|肉を下処理中|筋と脂を取り、厚さを揃えて切っています。
Preparing fish|They remove scales and fillet along the bones.|魚を下処理中|うろこを取り、骨に沿って身を外しています。
Reducing sauce|They simmer the sauce to the right thickness.|ソースを煮詰め中|好みの濃度になるまで煮詰めています。
Checking core temperature|They use a probe to check the meat's center.|中心温度を確認中|温度計で肉の中心温度を測っています。
Organizing the fridge|They move older ingredients to the front.|冷蔵庫を整理中|先に使う食材を手前に移しています。
Calculating food costs|They total the ingredient cost per plate.|原価を計算中|一皿に使う食材の費用を計算しています。
Teaching a junior cook|They demonstrate the grip and preparation sequence.|後輩を指導中|包丁の持ち方と下処理の順序を見せています。
Checking a finished plate|They check temperature and appearance before serving.|料理の最終確認中|提供前に温度と盛り付けを確認しています。
`);
deck('programmer','work',`
Writing code|They write functions for a new feature.|コードを作成中|新機能に必要な関数を書いています。
Debugging|They follow logs to narrow down an error.|バグを調査中|ログをたどり、原因の範囲を絞っています。
Reviewing code|They comment on a colleague's changes.|コードをレビュー中|同僚の変更を読み、コメントを残しています。
Running tests|They watch the test progress.|テストを実行中|テストの進行状況を確認しています。
Writing documentation|They record how the feature works.|文書を整理中|後で分かるよう機能の説明を残しています。
Preparing a release|They check each item on the release checklist.|リリースの準備中|公開前の確認項目を一つずつ確認しています。
Discussing the design|They draw boxes and arrows on the whiteboard.|設計を相談中|ホワイトボードに構造を描いて説明しています。
Researching an error|They look for similar reports of the error.|エラーを調べているところ|同じエラーの事例を探しています。
Requesting a review|They describe the change and how to test it.|レビューを依頼中|変更理由とテスト方法を記入しています。
Refactoring|They combine repeated code into one function.|リファクタリング中|重複した処理を一つの関数にまとめています。
Analyzing logs|They find recurring patterns in error records.|ログを分析中|エラーを時系列に並べ、共通点を探しています。
Connecting an API|They compare requests and responses with the documentation.|APIを接続中|送受信の形式を仕様書と照合しています。
Optimizing a query|They inspect the execution plan and indexes.|クエリを最適化中|実行計画を確認し、索引を見直しています。
Writing tests|They add cases for unusual conditions.|テストを作成中|例外的な条件の確認項目を追加しています。
Resolving a merge conflict|They compare conflicting lines during a merge.|競合を解消中|統合で衝突した行を比較しています。
Measuring performance|They time the screen load and find slow sections.|性能を測定中|画面の表示時間を測り、遅い部分を調べています。
Reviewing bug reports|They reproduce reported issues and set priorities.|不具合報告を整理中|問題を再現し、優先順位をつけています。
Planning work|They break next week's tasks into estimates.|作業を計画中|来週の作業を分け、所要時間を見積もっています。
`);
deck('researcher','work',`
Running an experiment|They put on gloves and transfer samples carefully.|実験中|手袋をつけ、試料を慎重に移しています。
Analyzing data|They graph results and look for outliers.|データを分析中|結果をグラフにし、外れ値を探しています。
Calibrating equipment|They compare readings with the reference values.|機器を点検中|測定値を基準に合わせて校正しています。
Reviewing literature|They read summaries of related research.|文献を調査中|関連する先行研究の要旨を読んでいます。
Writing lab notes|They record changed conditions and results.|実験ノートを記入中|変更した条件と結果を記録しています。
Attending a research meeting|They present weekly results and answer questions.|研究会議中|今週の結果を発表し、質問を受けています。
Writing a report|They add graphs and refine the explanation.|報告書を作成中|グラフを添え、結果の説明を整えています。
Checking reagents|They check expiry dates on the shelves.|試薬を整理中|棚の試薬の有効期限を確認しています。
Preparing samples|They dilute samples for the analysis.|試料を前処理中|分析に備え、決められた比率で希釈しています。
Designing a control group|They tabulate conditions for comparison.|対照群を設計中|比較する条件を表にまとめています。
Repeating an experiment|They check whether the results can be reproduced.|再現実験中|同じ条件で結果が再現するか確認しています。
Running statistical analysis|They check whether differences are significant.|統計を分析中|データを解析し、有意な差を確認しています。
Preparing a figure|They check axis units and error bars.|図を調整中|軸の単位と誤差棒を揃えています。
Drafting a paper|They describe the methods for other researchers.|論文を執筆中|他の人が再現できるよう方法を書いています。
Reviewing lab notes|They fill in omissions with the lead researcher.|研究ノートを確認中|責任者と記録を見て不足を補っています。
Booking equipment|They reserve an available slot on shared equipment.|機器を予約中|共用機器の空き時間を探しています。
Checking lab safety|They inspect the fume hood and waste containers.|安全を点検中|ドラフトと廃液容器を確認しています。
Writing an abstract|They condense the findings within the word limit.|要旨を作成中|字数制限に合わせて研究結果をまとめています。
`);
deck('student','work',`
Attending class|They copy the board into their notebook.|授業を受けているところ|黒板の内容をノートに書き写しています。
Organizing notes|They mark missing sections with a colored pen.|ノートを整理中|書き漏らした部分に色ペンで印をつけています。
Solving exercises|They circle the questions they find difficult.|問題を解いているところ|難しい問題に丸をつけながら解いています。
Preparing a presentation|They rehearse their part of the group presentation.|発表の準備中|グループ発表で担当する部分を練習しています。
Warming up for PE|They stretch on the school field.|体育の授業中|校庭で準備運動をしています。
Taking a quiz|They start with the questions they know.|小テスト中|分かる問題から解答しています。
Finding library books|They look through the shelves for their assignment.|本を探しているところ|課題に使う本を書架で探しています。
Doing classroom cleaning|They lift chairs onto desks and sweep.|教室を掃除中|椅子を机に上げ、床を掃いています。
Reviewing mistakes|They note why each wrong answer was incorrect.|間違いを復習中|誤答の理由を一つずつノートに書いています。
Preparing an assessment|They compare their work with the marking criteria.|課題の準備中|評価基準と照らし合わせ、抜けを確認しています。
Doing a lab lesson|They record measurements and compare group results.|実験の授業中|測定値を記録し、班の結果と比べています。
Learning vocabulary|They cover the definitions and test their memory.|単語を暗記中|意味を隠して思い出し、間違いに印をつけています。
Studying independently|They set a timer and focus on one subject.|自習中|タイマーをセットし、一教科ずつ集中しています。
Doing club activities|They plan the next activity in the clubroom.|部活動中|部室で次の活動の計画を立てています。
Planning group work|They assign roles and work backward from the deadline.|班の課題を相談中|役割を分け、締切から逆算して予定を組んでいます。
Discussing future studies|They ask their teacher which subjects they need.|進路相談中|希望の進路に必要な科目を先生と相談しています。
Preparing for the next lesson|They underline unfamiliar terms in the next chapter.|予習中|次の単元を読み、知らない用語に線を引いています。
Helping serve lunch|They put on an apron and serve classmates.|配膳を手伝っているところ|エプロンをつけ、並んだ友達におかずを配っています。
`);
deck('office','work',`
Writing a report|They check figures while filling in the report.|報告書を作成中|数字を照合しながら報告書を埋めています。
Attending a meeting|They take notes on the agenda.|会議に出席中|話し合われる議題をメモしています。
Answering a call|They write a client's requests on a sticky note.|電話対応中|取引先の要望を付箋に書き留めています。
Filing documents|They sort approved documents by date.|書類を整理中|決裁済みの書類を日付順に綴じています。
Printing materials|They wait for the meeting handouts to finish printing.|資料を印刷中|会議資料が印刷されるのを待っています。
Coordinating schedules|They check the calendar to arrange next week's meeting.|日程を調整中|カレンダーを見て来週の会議を調整しています。
Making coffee|They take a short break to brew coffee.|コーヒーを淹れているところ|給湯室でコーヒーを淹れ、一息ついています。
Submitting an approval request|They reread the proposal before submitting it.|決裁を申請中|起案書を読み直して申請しています。
Compiling results|They summarize department results and check formulas.|実績を集計中|部署別の実績をまとめ、数式の誤りを確認しています。
Writing a purchase request|They enter the reason and budget for a purchase.|稟議書を作成中|購入理由と予算項目を記入しています。
Writing meeting minutes|They list decisions, owners and deadlines.|議事録を整理中|決定事項、担当者、期限をまとめています。
Meeting a client|They discuss prices and delivery dates over a quotation.|取引先と打合せ中|見積書を見ながら単価と納期を調整しています。
Preparing slides|They condense each slide's main message.|発表資料を作成中|スライドごとに要点を一行にまとめています。
Claiming expenses|They sort receipts and enter expense categories.|経費を精算中|領収書を日付順に並べ、勘定科目を入力しています。
Writing a weekly report|They summarize progress and outstanding issues.|週報を作成中|今週の進捗と課題を項目別に整理しています。
Reviewing a contract|They highlight the term and termination clauses.|契約書を確認中|契約期間と解約条項に印をつけています。
Receiving a handover|They ask about unclear parts of the handover document.|引継ぎを受けているところ|引継ぎ資料を読み、不明な点を質問しています。
Taking staff training|They watch the required course and answer its quiz.|社内研修中|必修動画を見て確認問題に答えています。
`);
deck('doctor','work',`
Making ward rounds|They ask patients how they feel and record changes.|回診中|患者の状態を尋ね、変化を記録しています。
Seeing a patient|They listen to symptoms and update the chart.|診察中|症状を聞き、診療録に書き込んでいます。
Reviewing test results|They enlarge medical images to examine them.|検査結果を確認中|画像を拡大しながら確認しています。
Entering a prescription|They recheck the chart while entering the order.|処方を入力中|診療録を再確認しながら処方を入力しています。
Explaining the treatment plan|They explain the next steps to the family.|治療方針を説明中|家族に今後の治療計画を説明しています。
Preparing for surgery|They wash thoroughly and prepare for the operating room.|手術の準備中|手を丁寧に洗い、手術室に入る準備をしています。
Writing medical records|They complete records for today's patients.|診療録を作成中|今日診た患者の記録を漏れなく整理しています。
Consulting another department|They discuss a patient's condition with another doctor.|他科と相談中|別の科の医師と患者の状態を相談しています。
Reviewing outpatient charts|They read previous records before appointments.|外来の記録を確認中|予約患者の過去の診療録を読んでいます。
Using a stethoscope|They listen to breathing and heart sounds.|聴診中|呼吸音と心音を順に確認しています。
Examining an ultrasound|They adjust the probe angle while studying the screen.|超音波を確認中|プローブの角度を変えながら画面を見ています。
Attending a case conference|They note questions about the diagnostic process.|症例検討会に出席中|診断過程についての質問をメモしています。
Explaining an operation|They explain the procedure and possible complications.|手術を説明中|手術の流れと起こり得る合併症を説明しています。
Supervising a resident|They review progress notes and suggest improvements.|研修医を指導中|経過記録を一緒に見て改善点を伝えています。
Reading an imaging report|They reconsider the care plan after reading the report.|読影報告を確認中|報告を読み、診療計画を検討しています。
Reviewing an emergency referral|They check the referred patient's test results.|救急の相談に対応中|紹介された患者の検査結果を確認しています。
Writing a discharge summary|They summarize the hospital stay and follow-up plan.|退院要約を作成中|入院中の経過と外来予定をまとめています。
Preparing conference slides|They arrange case images and clinical progress.|学会資料を準備中|症例の画像と経過をスライドに整理しています。
`);
deck('nurse','work',`
Checking vital signs|They measure and record temperature and blood pressure.|バイタルを測定中|体温と血圧を測り、記録しています。
Preparing medication|They compare each patient's medication with the orders.|投薬の準備中|患者ごとの薬を処方と照合しています。
Checking an infusion|They check the flow and remaining fluid.|点滴を確認中|滴下の様子と残量を確認しています。
Responding to a call bell|They listen to the patient's concern.|ナースコールに対応中|呼び出した患者の困り事を聞いています。
Changing a dressing|They explain first and carefully replace the dressing.|ドレッシングを交換中|患者に説明してから丁寧に交換しています。
Writing nursing notes|They record observations in time order.|看護記録を作成中|観察した内容を時刻順に記録しています。
Restocking supplies|They refill the gauze and gloves on the shelves.|物品を補充中|棚のガーゼや手袋を補充しています。
Helping a patient move|They push a wheelchair toward the examination room.|移動を介助中|検査室へ向かう患者の車椅子を押しています。
Checking before medication|They compare the wristband with the prescription.|投薬前の確認中|リストバンドと処方を照合しています。
Measuring blood glucose|They record the pre-meal reading.|血糖を測定中|食前の測定値を記録しています。
Recording intake and output|They total fluid intake and output by time.|水分出納を記録中|時間帯ごとの摂取量と排出量を計算しています。
Assessing fall risk|They score each item on the assessment form.|転倒リスクを評価中|評価表の項目を確認し、点数をつけています。
Preparing for an operation|They check fasting, consent and test results.|術前の準備中|絶食、同意書、検査結果を確認しています。
Explaining discharge care|They explain home care to the patient and family.|退院指導中|患者と家族に自宅での注意点を説明しています。
Helping a patient reposition|They change the patient's position and check their skin.|体位を変えているところ|患者の姿勢を変え、皮膚の状態を確認しています。
Sending a specimen|They label samples for the laboratory.|検体を送る準備中|検体にラベルを貼り、検査室へ送る準備をしています。
Checking ward stock|They check quantities and expiry dates against the ledger.|病棟の備品を点検中|数量と有効期限を台帳と照合しています。
Training a new nurse|They explain each step beside a new colleague.|新人を指導中|新人の隣で処置の順序を説明しています。
`);
deck('teacher','work',`
Teaching a lesson|They explain key points and check students' reactions.|授業中|要点を説明し、学生の反応を見ています。
Answering a question|They listen fully before explaining again.|質問に答えているところ|質問を最後まで聞いて説明し直しています。
Marking tests|They turn the pages and mark answers in red.|採点中|答案をめくり、赤ペンで採点しています。
Preparing worksheets|They prepare handouts for the next class.|教材を作成中|次の授業で配るプリントを作っています。
Talking with a student|They listen to a student's recent worries.|面談中|学生の最近の悩みを聞いています。
Supervising the corridor|They remind running students to slow down.|廊下を見回り中|走っている学生に声をかけています。
Attending a staff meeting|They take notes on the school calendar.|職員会議中|学校行事の予定をメモしています。
Writing student records|They choose comments for each student.|生徒の記録を作成中|一人ずつ思い浮かべながら文章を考えています。
Writing a lesson plan|They divide the lesson into goals and timed activities.|授業計画を作成中|目標と活動時間を分けて計画を立てています。
Setting assessment questions|They match questions to learning goals.|試験問題を作成中|到達目標に合わせて問題と難易度を調整しています。
Marking an assessment|They use the rubric to score each item.|課題を採点中|基準表を見ながら項目別に採点しています。
Calling a parent|They discuss the student's school life.|保護者と相談中|電話で学生の学校生活を伝えています。
Preparing an open lesson|They organize materials for visiting teachers.|公開授業の準備中|参観する先生に配る資料を整理しています。
Giving extra help|They work through a problem again with a small group.|補習中|少人数で同じ問題をもう一度解いています。
Handling official paperwork|They read a notice and complete the reply form.|公文書を処理中|通知を読み、回答書式を記入しています。
Advising a club|They review club plans and give suggestions.|部活動を指導中|活動計画を見て助言しています。
Meeting subject teachers|They coordinate progress and assessment methods.|教科会議中|授業の進度と評価方法を調整しています。
Updating attendance records|They check absence notes and supporting documents.|出欠を整理中|欠席届と証明書を確認して記録しています。
`);
deck('professor','work',`
Giving a lecture|They explain concepts while moving through slides.|講義中|スライドを進めながら概念を説明しています。
Reading a paper|They write questions in the margins.|論文を読んでいるところ|余白に疑問を書き込んでいます。
Writing a paper|They rearrange paragraphs in the draft.|論文を執筆中|下書きの段落構成を練り直しています。
Advising a graduate student|They discuss the results and next direction.|院生を指導中|結果を一緒に見て次の方針を話しています。
Meeting a student|They listen carefully to a visiting student.|学生と面談中|訪ねてきた学生の話を聞いています。
Grading assignments|They read each submission and add a comment.|課題を採点中|提出物を読み、短い講評を添えています。
Writing research paperwork|They fill in the project report.|研究書類を作成中|研究課題の報告書を記入しています。
Attending a department meeting|They discuss department matters with colleagues.|学科会議中|同僚と学科の議題について話しています。
Reviewing a paper|They assess methods and write a review.|論文を査読中|研究方法を検討し、査読意見を書いています。
Applying for a research grant|They refine the aims and expected outcomes.|研究申請書を作成中|研究目標と期待される成果を整理しています。
Advising on a thesis|They help restructure the thesis chapters.|学位論文を指導中|章ごとの構成を一緒に練り直しています。
Writing exam questions|They choose essay questions from the course material.|試験問題を作成中|講義範囲から記述問題を選んでいます。
Writing a recommendation|They describe the student's research experience.|推薦状を作成中|学生の研究経験を思い出しながら書いています。
Leading a seminar|They raise questions after the presentation.|ゼミを進行中|発表後に討論のための質問を出しています。
Meeting research partners|They share progress with another university online.|共同研究の会議中|他大学の研究者と進捗を共有しています。
Writing a syllabus|They assign topics and tasks by week.|シラバスを作成中|週ごとのテーマと課題を決めています。
Revising a manuscript|They respond to each reviewer's comment.|原稿を修正中|査読者の指摘に一つずつ回答しています。
Leading a lab meeting|They listen to each student's weekly progress.|研究室の会議中|学生の週間進捗を順に聞いています。
`);
const stages = `
student.arrive
Arriving at school|They collect today's books from the locker.|登校中|ロッカーから今日の教科書を出しています。
Preparing their desk|They lay out stationery and check the timetable.|席を整えているところ|文具を出し、時間割を確認しています。
student.leave
Preparing to leave school|They pack their bag for the journey home.|下校の準備中|帰るためにかばんを整えています。
student.surprise
Being called on|They stand up, startled by the teacher calling their name.|指名されたところ|突然名前を呼ばれ、驚いて立っています。
Sheltering from rain|They take shelter from a sudden shower.|雨を避けているところ|急な雨を避けています。
office.arrive
Arriving at work|They tap their staff card and wait for the lift.|出勤中|社員証をかざし、エレベーターを待っています。
Checking email|They flag the most important overnight messages.|メールを確認中|届いたメールの重要なものに印をつけています。
office.leave
Preparing to leave work|They switch off the monitor and put documents away.|退勤の準備中|画面を消し、書類をしまっています。
office.surprise
Handling an urgent request|They reopen their email after a last-minute request.|急な依頼に対応中|突然の依頼でメールを開き直しています。
Recovering a document|They try to recover work after the program closes.|文書を復元中|突然終了したソフトの文書を復元しています。
doctor.arrive
Putting on a coat|They gather a pen and stethoscope.|白衣を着ているところ|ペンと聴診器を用意しています。
Receiving a handover|They read records of overnight changes.|引継ぎを受けているところ|夜間の患者の記録を読んでいます。
doctor.leave
Handing over care|They highlight patients needing attention for the next shift.|引継ぎ中|次の担当者に注意点を伝えています。
doctor.surprise
Responding to an urgent call|They stop what they were doing to answer the call.|緊急の呼出しに対応中|作業を止め、呼出しに対応しています。
nurse.arrive
Changing into uniform|They prepare their badge and pen.|制服に着替え中|名札とペンを用意しています。
Receiving a handover|They note the previous shift's ward updates.|引継ぎを受けているところ|前の担当者から病室ごとの注意点を聞いています。
nurse.leave
Handing over the ward|They describe each patient's condition to the next shift.|引継ぎ中|病室ごとの状態を次の担当者に伝えています。
nurse.surprise
Responding to several calls|They decide which simultaneous call needs attention first.|呼出しに対応中|重なった呼出しの優先順位を判断しています。
teacher.arrive
Arriving in the staffroom|They put down their bag and check the lessons.|職員室に出勤中|かばんを置き、授業順を確認しています。
Taking morning attendance|They call names and share announcements.|朝の会を進行中|出席を取り、連絡事項を伝えています。
teacher.leave
Closing the school day|They announce tomorrow's supplies before dismissal.|終わりの会を進行中|明日の持ち物を伝えています。
teacher.surprise
Checking a disturbance|They investigate a sudden noise at the back of class.|物音を確認中|教室の後ろの急な音を確かめています。
professor.arrive
Opening the office|They turn on the lights and check email.|研究室を開けているところ|明かりをつけ、メールを確認しています。
professor.leave
Closing the office|They tidy papers and turn out the lights.|研究室を整理中|論文を片付け、照明を消しています。
professor.surprise
Catching a deadline|They hurriedly open a review due today.|締切に対応中|今日までの審査資料を急いで開いています。
politician.arrive
Receiving a briefing|They review the day's meetings with an aide.|予定を確認中|補佐役から今日の面会予定を聞いています。
Reading the newspaper|They mark articles of interest.|新聞を読んでいるところ|気になる記事に印をつけています。
politician.leave
Checking tomorrow's schedule|They coordinate tomorrow's route with an aide.|明日の予定を確認中|補佐役と明日の動線を相談しています。
politician.surprise
Facing an unexpected question|They pause at a reporter's sudden question.|急な質問を受けているところ|記者の質問に足を止めています。
reporter.arrive
Preparing story pitches|They list ideas for today's meeting.|企画を準備中|会議で提案する記事案をまとめています。
Checking the news|They compare overnight reports across outlets.|ニュースを確認中|複数の媒体で夜間の報道を読んでいます。
reporter.leave
Filing an article|They make a final headline edit before submission.|記事を送稿中|見出しを直して提出しています。
reporter.surprise
Following breaking news|They gather their things after a sudden alert.|速報に対応中|急な通知を見て荷物を用意しています。
chef.arrive
Putting on chef whites|They tie their apron and check the knife.|調理服に着替え中|エプロンを結び、包丁を確認しています。
Inspecting ingredients|They check the freshness of each delivery.|食材を検品中|届いた食材の鮮度を確認しています。
chef.leave
Closing the kitchen|They clean surfaces and label remaining ingredients.|厨房を締めているところ|台を拭き、残りの食材に日付をつけています。
chef.surprise
Containing a flare-up|They react quickly as a flame rises from the pan.|急な火に対応中|フライパンの火に素早く対応しています。
programmer.arrive
Opening the workspace|They turn on the monitors and reopen yesterday's files.|作業環境を起動中|画面をつけ、昨日のファイルを開いています。
Attending a morning meeting|They share progress and today's plans.|朝会中|昨日の作業と今日の予定を共有しています。
programmer.leave
Saving the day's work|They submit their changes before closing the laptop.|作業を保存中|変更をまとめてからパソコンを閉じています。
programmer.surprise
Restoring a server|They open the status screen after a failure alert.|サーバーを復旧中|停止の通知を受け、状態を確認しています。
researcher.arrive
Checking an experiment|They put on a lab coat and inspect the overnight run.|実験を確認中|白衣を着て、継続中の実験を見ています。
Reviewing lab notes|They reread yesterday's records and plan today's work.|実験記録を確認中|昨日の記録を読み、今日の作業を整理しています。
researcher.leave
Tidying the laboratory|They wash tools and check equipment power.|実験室を片付け中|器具を洗い、機器の電源を確認しています。
researcher.surprise
Examining an unexpected result|They stare at a surprising measurement.|予想外の結果を確認中|思いがけない測定値を見つめています。
singer.arrive
Warming up their voice|They start gently with low notes.|発声の準備中|低い音からゆっくり声を出しています。
singer.leave
Resting their voice|They drink warm water and let their voice rest.|喉を休めているところ|温かい水を飲んで休めています。
singer.surprise
Checking a sound fault|They look toward the staff when the microphone cuts out.|音響を確認中|マイクが切れ、スタッフの方を見ています。
idol.arrive
Preparing for practice|They change clothes and warm up in the mirror.|練習の準備中|着替えて鏡の前で体をほぐしています。
Checking the schedule|They review the manager's timetable.|予定を確認中|マネージャーからの時間割を確認しています。
idol.leave
Preparing to return to the dorm|They gather their belongings after practice.|宿舎に戻る準備中|練習を終えて荷物をまとめています。
idol.surprise
Waiting for a costume repair|They wait as a fallen button is sewn back on.|衣装の修繕を待っているところ|取れたボタンを縫い直してもらっています。
artist.arrive
Opening the studio|They air the room and inspect yesterday's work.|作業場を開けているところ|換気し、昨日の作品を見ています。
artist.leave
Closing the studio|They close paint pots and cover the canvas.|作業場を締めているところ|絵の具の蓋を閉め、作品を覆っています。
artist.surprise
Wiping up a spill|They quickly mop up an overturned water jar.|こぼれた水を拭いているところ|倒した水入れの水を拭いています。
pirate.arrive
Boarding the ship|They step aboard and look over the deck.|乗船中|船に上がり、甲板を見回しています。
Attending roll call|They line up with the crew and wait for their name.|点呼中|船員と並び、名前を待っています。
pirate.leave
Preparing to go ashore|They finish securing the boat before disembarking.|下船の準備中|船をしっかり固定しています。
pirate.surprise
Preparing for a storm|They secure cargo as the sky suddenly darkens.|嵐に備えているところ|空が暗くなり、荷物を固定しています。
soldier.arrive
Attending roll call|They line up and wait for their name.|点呼中|列を揃え、名前を待っています。
Adjusting their uniform|They straighten their uniform and tie their boots.|服装を整えているところ|制服を直し、靴ひもを結んでいます。
soldier.leave
Finishing the duty day|They make their final report before returning to quarters.|日課を終えるところ|終了の報告をしています。
soldier.surprise
Answering an urgent assembly|They gather their equipment at the sudden call.|急な集合に対応中|呼出しを受けて装備を用意しています。
criminal.arrive
Entering the hideout|They glance back and close the door quietly.|隠れ家に入ったところ|後ろを見て静かに扉を閉めています。
criminal.leave
Preparing to disperse|They wait their turn to leave separately.|別れる準備中|順番に出ていくのを待っています。
criminal.surprise
Keeping silent|They stop at the sound of a distant siren.|息を潜めているところ|遠いサイレンに動きを止めています。
janitor.arrive
Preparing cleaning tools|They check the broom and dustpan handles.|清掃道具を準備中|ほうきとちり取りの柄を確認しています。
Putting on workwear|They put on a bright vest and pull up their gloves.|作業着を着ているところ|目立つベストと手袋をつけています。
janitor.leave
Rinsing the tools|They wash mops and brush dust from the broom.|道具を洗っているところ|雑巾を洗い、ほうきのほこりを落としています。
janitor.surprise
Moving a rubbish bag|They step back when a cat jumps out of the bag.|袋を運んでいるところ|猫が飛び出し、驚いて後ずさりしています。
Cleaning up a split bag|They quickly gather rubbish from a torn bag.|破れた袋を片付け中|こぼれたごみを急いで集めています。
innkeeper.arrive
Opening the inn|They switch on the sign and shake out the entrance mat.|宿を開けているところ|看板を点け、玄関のマットを払っています。
Checking the guest register|They check today's arrivals and departures.|宿泊簿を確認中|今日の到着と出発を確認しています。
innkeeper.leave
Locking up|They switch off corridor lights and check the entrance.|戸締り中|廊下の明かりを消し、鍵を確認しています。
innkeeper.surprise
Welcoming an unexpected group|They quickly count available rooms.|団体客に対応中|急に来た客を見て空室を数えています。
selfEmployed.arrive
Opening the shop|They raise the shutter and turn on the lights.|開店中|シャッターを上げ、明かりをつけています。
selfEmployed.leave
Closing the shop|They lock the safe and lower the shutter.|閉店中|金庫を施錠し、シャッターを下ろしています。
selfEmployed.surprise
Picking up a fallen box|They gather items scattered from a high shelf.|落ちた箱を片付け中|棚から散らばった物を拾っています。
clergy.arrive
Opening the doors|They light the quiet space in the early morning.|扉を開けているところ|朝の静かな場所に明かりをつけています。
Praying|They close their eyes and pray for the day.|祈っているところ|目を閉じ、今日のために祈っています。
clergy.leave
Closing the doors|They turn out the lights and look around once more.|戸締り中|明かりを消し、最後に見回しています。
clergy.surprise
Righting a candlestick|They stand up a candlestick knocked over by the wind.|燭台を直しているところ|風で倒れた燭台を起こしています。
barista.arrive
Preparing to open|They warm the machine and refill the beans.|開店の準備中|マシンを温め、豆を補充しています。
Adjusting the grind|They taste the first shot and adjust the grinder.|挽き目を調整中|最初の抽出を見て調整しています。
barista.leave
Cleaning the machine|They wipe the group head and run the cleaning cycle.|マシンを洗浄中|抽出部を拭き、洗浄運転をしています。
barista.surprise
Wiping spilled milk|They grab a cloth as milk overflows.|こぼれたミルクを拭いているところ|あふれたミルクを急いで拭いています。
unemployed.surprise
Receiving an interview call|They sit up straight when the unexpected caller offers an interview.|面接の連絡を受けているところ|突然の電話が面接の知らせで、姿勢を正しています。
common.break
Drinking water|They pause to sip some water.|水を飲んでいるところ|手を止めて少しずつ水を飲んでいます。
Taking a bathroom break|They briefly leave their work to use the bathroom.|トイレに行っているところ|仕事を一度止めてトイレを使っています。
Stretching|They stretch to loosen their stiff shoulders.|伸びをしているところ|固まった肩をほぐしています。
Having a snack|They take a few bites of a snack.|間食中|おやつを少し食べています。
Chatting with a colleague|They exchange news with {partner}.|同僚と雑談中|{partner}と最近の話をしています。
Laughing with a colleague|They laugh at {partner}'s joke.|同僚と笑っているところ|{partner}の冗談に笑っています。
Greeting someone|They cheerfully greet someone passing by.|挨拶中|通りかかった人に明るく声をかけています。
Nodding hello|They briefly nod to someone passing by.|会釈中|通りかかった人に軽く頭を下げています。
common.lunch
Eating at a nearby restaurant|They enjoy today's menu at a nearby restaurant.|近くの店で食事中|今日のメニューを食べています。
Eating a packed lunch|They open their lunchbox and eat slowly.|弁当を食べているところ|蓋を開けてゆっくり食べています。
Having a quick meal|They have a rice ball for a simple lunch.|軽食中|おにぎりで簡単に食事をしています。
Having lunch with a colleague|They eat and chat with {partner}.|同僚と昼食中|{partner}と食べながら話しています。
common.rest
Taking a nap|They lean back in the chair and close their eyes.|昼寝中|椅子にもたれ、少し目を閉じています。
Looking at their phone|They scroll through their phone during the break.|電話を見ているところ|休憩時間に画面を眺めています。
Getting fresh air|They stretch and enjoy the breeze outside.|外気に当たっているところ|外で伸びをして風を感じています。
Enjoying a hobby|They spend the break on {hobby}.|趣味を楽しんでいるところ|休憩に{hobby}を楽しんでいます。
calm.calm
Calming down|They take slow breaths to settle their racing heart.|気持ちを落ち着け中|ゆっくり呼吸して気持ちを整えています。
`;
let stageKey,stagePhase;
for(const line of stages.trim().split('\n')){if(!line.includes('|')){[stageKey,stagePhase]=line.split('.');(JOB_LOG_COPY[stageKey]??={})[stagePhase]=[];}else JOB_LOG_COPY[stageKey][stagePhase].push(line.split('|'));}
