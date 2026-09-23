// Simplified user recipe data plus game-only quick, gourmet and fantasy recipes.
import {INGREDIENT_BY_ID} from "./ingredients.js";
export const RECIPES = [
  {
    "id": "frumenty",
    "name": "프루먼티",
    "cuisine": "medieval",
    "level": 2,
    "min": 90,
    "ing": [
      "wheat",
      "milk",
      "egg",
      "saffron",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "통밀을 절구에 찧고 있어요"
      ],
      [
        "cook",
        "통밀을 물에 푹 삶고 있어요"
      ],
      [
        "mix",
        "우유를 붓고 저어 주고 있어요"
      ],
      [
        "mix",
        "달걀노른자와 사프란을 풀어 넣고 있어요"
      ],
      [
        "plate",
        "그릇에 퍼 담고 있어요"
      ]
    ]
  },
  {
    "id": "blank_mang",
    "name": "블랑망제",
    "cuisine": "medieval",
    "level": 3,
    "min": 100,
    "ing": [
      "chicken",
      "almond",
      "rice",
      "sugar",
      "salt"
    ],
    "steps": [
      [
        "cook",
        "닭을 삶고 있어요"
      ],
      [
        "prep",
        "아몬드를 빻아 아몬드유를 만들고 있어요"
      ],
      [
        "cook",
        "아몬드유에 쌀을 넣고 끓이고 있어요"
      ],
      [
        "mix",
        "찢은 닭고기와 설탕을 넣고 젓고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "cormarye",
    "name": "코르마리",
    "cuisine": "medieval",
    "level": 3,
    "min": 150,
    "ing": [
      "pork",
      "spice",
      "garlic",
      "pepper",
      "wine",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "향신료와 마늘을 절구에 빻고 있어요"
      ],
      [
        "mix",
        "빻은 향신료를 와인에 풀고 있어요"
      ],
      [
        "cut",
        "돼지고기에 칼로 구멍을 내고 있어요"
      ],
      [
        "cook",
        "꼬챙이에 꿴 고기를 불 앞에서 굽고 있어요"
      ],
      [
        "cut",
        "구운 고기를 썰고 있어요"
      ],
      [
        "plate",
        "육즙 소스를 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "makerouns",
    "name": "마카룬스",
    "cuisine": "medieval",
    "level": 2,
    "min": 50,
    "ing": [
      "flour",
      "butter",
      "cheese"
    ],
    "steps": [
      [
        "mix",
        "밀가루로 반죽을 하고 있어요"
      ],
      [
        "cut",
        "얇게 민 반죽을 조각내고 있어요"
      ],
      [
        "cook",
        "끓는 물에 삶고 있어요"
      ],
      [
        "plate",
        "버터와 치즈를 켜켜이 얹어 담고 있어요"
      ]
    ]
  },
  {
    "id": "tart_de_bry",
    "name": "타르트 드 브리",
    "cuisine": "medieval",
    "level": 3,
    "min": 80,
    "ing": [
      "flour",
      "cheese",
      "egg",
      "spice",
      "sugar",
      "saffron"
    ],
    "steps": [
      [
        "mix",
        "밀가루 반죽으로 파이 껍질을 빚고 있어요"
      ],
      [
        "mix",
        "치즈와 달걀노른자를 섞고 있어요"
      ],
      [
        "mix",
        "향신료와 설탕, 사프란을 넣고 있어요"
      ],
      [
        "cook",
        "화덕에 넣어 굽고 있어요"
      ],
      [
        "cut",
        "타르트를 조각내고 있어요"
      ]
    ]
  },
  {
    "id": "payn_purdyeu",
    "name": "페인 퍼디우",
    "cuisine": "medieval",
    "level": 1,
    "min": 20,
    "ing": [
      "bread",
      "egg",
      "butter",
      "sugar"
    ],
    "steps": [
      [
        "cut",
        "빵 껍질을 잘라내고 있어요"
      ],
      [
        "cook",
        "버터에 빵을 살짝 지지고 있어요"
      ],
      [
        "mix",
        "빵을 달걀노른자에 적시고 있어요"
      ],
      [
        "cook",
        "다시 노릇하게 지지고 있어요"
      ],
      [
        "plate",
        "설탕을 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "compost",
    "name": "콤포스트",
    "cuisine": "medieval",
    "level": 3,
    "min": 70,
    "ing": [
      "radish",
      "carrot",
      "cabbage",
      "pear",
      "vinegar",
      "honey",
      "wine",
      "mustard",
      "driedfruit",
      "spice"
    ],
    "steps": [
      [
        "cut",
        "무와 당근, 양배추를 썰고 있어요"
      ],
      [
        "cook",
        "채소와 배를 데치고 있어요"
      ],
      [
        "mix",
        "식초와 향신료에 채소를 절이고 있어요"
      ],
      [
        "cook",
        "꿀과 와인을 끓이고 있어요"
      ],
      [
        "plate",
        "머스터드와 건과일을 넣어 항아리에 담고 있어요"
      ]
    ]
  },
  {
    "id": "salat",
    "name": "살랏",
    "cuisine": "medieval",
    "level": 1,
    "min": 20,
    "ing": [
      "herb",
      "scallion",
      "onion",
      "garlic",
      "oliveoil",
      "vinegar",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "허브와 채소를 씻고 있어요"
      ],
      [
        "prep",
        "손으로 잘게 뜯고 있어요"
      ],
      [
        "mix",
        "기름을 두르고 버무리고 있어요"
      ],
      [
        "mix",
        "식초와 소금을 뿌리고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "caboches",
    "name": "양배추 포타주",
    "cuisine": "medieval",
    "level": 1,
    "min": 50,
    "ing": [
      "cabbage",
      "onion",
      "scallion",
      "saffron",
      "spice",
      "salt"
    ],
    "steps": [
      [
        "cut",
        "양배추를 네 등분하고 있어요"
      ],
      [
        "cut",
        "양파와 파를 썰고 있어요"
      ],
      [
        "cook",
        "채소를 넣고 끓이고 있어요"
      ],
      [
        "mix",
        "사프란과 향신료를 넣고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "mortrews",
    "name": "모트루스",
    "cuisine": "medieval",
    "level": 3,
    "min": 90,
    "ing": [
      "chicken",
      "pork",
      "breadcrumb",
      "egg",
      "spice",
      "sugar",
      "saffron"
    ],
    "steps": [
      [
        "cook",
        "닭고기와 돼지고기를 삶고 있어요"
      ],
      [
        "cut",
        "고기를 잘게 다지고 있어요"
      ],
      [
        "prep",
        "절구에 곱게 빻고 있어요"
      ],
      [
        "cook",
        "빵가루와 달걀노른자를 넣고 되직하게 끓이고 있어요"
      ],
      [
        "plate",
        "향신료를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "gyngerbrede",
    "name": "중세 진저브레드",
    "cuisine": "medieval",
    "level": 2,
    "min": 50,
    "ing": [
      "honey",
      "breadcrumb",
      "saffron",
      "pepper",
      "spice"
    ],
    "steps": [
      [
        "cook",
        "꿀을 끓이며 거품을 걷고 있어요"
      ],
      [
        "mix",
        "사프란과 후추를 넣고 있어요"
      ],
      [
        "mix",
        "빵가루를 넣고 되직하게 젓고 있어요"
      ],
      [
        "prep",
        "네모나게 모양을 잡아 굳히고 있어요"
      ],
      [
        "cut",
        "먹기 좋게 썰고 있어요"
      ]
    ]
  },
  {
    "id": "daryols",
    "name": "다리올",
    "cuisine": "medieval",
    "level": 3,
    "min": 70,
    "ing": [
      "flour",
      "cream",
      "egg",
      "sugar",
      "saffron"
    ],
    "steps": [
      [
        "mix",
        "작은 컵 모양 파이 껍질을 빚고 있어요"
      ],
      [
        "mix",
        "크림과 달걀, 설탕, 사프란을 섞고 있어요"
      ],
      [
        "mix",
        "껍질에 커스터드를 붓고 있어요"
      ],
      [
        "cook",
        "화덕에서 굽고 있어요"
      ],
      [
        "plate",
        "식혀서 담고 있어요"
      ]
    ]
  },
  {
    "id": "fretoure",
    "name": "사과 프리터",
    "cuisine": "medieval",
    "level": 2,
    "min": 40,
    "ing": [
      "flour",
      "ricewine",
      "yeast",
      "saffron",
      "apple",
      "oil",
      "sugar"
    ],
    "steps": [
      [
        "mix",
        "밀가루와 에일, 이스트로 반죽물을 만들고 있어요"
      ],
      [
        "cut",
        "사과를 둥글게 썰고 있어요"
      ],
      [
        "mix",
        "사과에 반죽물을 입히고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "plate",
        "설탕을 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "pease_pottage",
    "name": "완두 포타주",
    "cuisine": "medieval",
    "level": 1,
    "min": 60,
    "ing": [
      "beans",
      "onion",
      "bacon",
      "herb",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "말린 완두를 불리고 있어요"
      ],
      [
        "cut",
        "양파와 베이컨을 썰고 있어요"
      ],
      [
        "cook",
        "완두와 함께 푹 끓이고 있어요"
      ],
      [
        "mix",
        "완두를 으깨며 허브를 넣고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "chewettes",
    "name": "츄엣",
    "cuisine": "medieval",
    "level": 4,
    "min": 100,
    "ing": [
      "pork",
      "chicken",
      "egg",
      "flour",
      "spice",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "돼지고기와 닭고기를 잘게 썰고 있어요"
      ],
      [
        "cook",
        "고기를 볶고 있어요"
      ],
      [
        "cook",
        "달걀을 단단하게 삶고 있어요"
      ],
      [
        "mix",
        "작은 파이 껍질에 고기와 노른자를 채우고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "mawmenee",
    "name": "마우메니",
    "cuisine": "medieval",
    "level": 4,
    "min": 90,
    "ing": [
      "wine",
      "sugar",
      "spice",
      "nuts",
      "driedfruit",
      "chicken"
    ],
    "steps": [
      [
        "cook",
        "닭을 삶아 살을 찢고 있어요"
      ],
      [
        "cook",
        "와인에 설탕을 녹여 끓이고 있어요"
      ],
      [
        "cook",
        "잣과 대추야자를 기름에 볶고 있어요"
      ],
      [
        "mix",
        "향신료와 닭고기를 넣고 젓고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "brouet_canelle",
    "name": "계피 브루에",
    "cuisine": "medieval",
    "level": 3,
    "min": 80,
    "ing": [
      "chicken",
      "wine",
      "almond",
      "spice",
      "vinegar"
    ],
    "steps": [
      [
        "cut",
        "닭을 토막 내고 있어요"
      ],
      [
        "cook",
        "와인을 넣은 물에 닭을 익히고 있어요"
      ],
      [
        "prep",
        "아몬드와 계피를 빻고 있어요"
      ],
      [
        "cook",
        "국물에 풀어 함께 끓이고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "pike_galentyne",
    "name": "생선 갈렌타인",
    "cuisine": "medieval",
    "level": 4,
    "min": 90,
    "ing": [
      "whitefish",
      "bread",
      "spice",
      "vinegar",
      "salt"
    ],
    "steps": [
      [
        "cut",
        "생선을 손질해 토막 내고 있어요"
      ],
      [
        "cook",
        "생선을 삶고 있어요"
      ],
      [
        "prep",
        "빵과 향신료를 절구에 빻고 있어요"
      ],
      [
        "mix",
        "식초를 부어 소스를 만들고 있어요"
      ],
      [
        "plate",
        "소스를 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "tart_ymbre_day",
    "name": "엠버데이 타르트",
    "cuisine": "medieval",
    "level": 3,
    "min": 90,
    "ing": [
      "onion",
      "herb",
      "cheese",
      "egg",
      "butter",
      "saffron",
      "driedfruit",
      "sugar",
      "flour"
    ],
    "steps": [
      [
        "cut",
        "양파와 허브를 다지고 있어요"
      ],
      [
        "mix",
        "치즈와 달걀을 섞고 있어요"
      ],
      [
        "mix",
        "버터, 사프란, 건포도를 넣고 있어요"
      ],
      [
        "mix",
        "파이 껍질에 속을 채우고 있어요"
      ],
      [
        "cook",
        "화덕에서 굽고 있어요"
      ]
    ]
  },
  {
    "id": "capon_cameline",
    "name": "카멜린 소스 닭구이",
    "cuisine": "medieval",
    "level": 4,
    "min": 150,
    "ing": [
      "chicken",
      "bread",
      "vinegar",
      "spice",
      "salt"
    ],
    "steps": [
      [
        "cook",
        "꼬챙이에 꿴 닭을 불 앞에서 돌리며 굽고 있어요"
      ],
      [
        "prep",
        "빵을 식초에 적시고 있어요"
      ],
      [
        "prep",
        "향신료를 절구에 빻고 있어요"
      ],
      [
        "mix",
        "빵과 향신료를 걸러 소스를 만들고 있어요"
      ],
      [
        "cut",
        "구운 닭을 가르고 있어요"
      ],
      [
        "plate",
        "소스를 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "kimchi_jjigae",
    "name": "김치찌개",
    "cuisine": "korean",
    "level": 1,
    "min": 35,
    "ing": [
      "kimchi",
      "pork",
      "tofu",
      "onion",
      "scallion",
      "chilipowder",
      "garlic"
    ],
    "steps": [
      [
        "cut",
        "김치와 돼지고기를 썰고 있어요"
      ],
      [
        "cut",
        "두부와 파를 썰고 있어요"
      ],
      [
        "cook",
        "돼지고기와 김치를 볶고 있어요"
      ],
      [
        "cook",
        "물을 붓고 푹 끓이고 있어요"
      ],
      [
        "plate",
        "뚝배기에 담고 있어요"
      ]
    ]
  },
  {
    "id": "doenjang_jjigae",
    "name": "된장찌개",
    "cuisine": "korean",
    "level": 1,
    "min": 35,
    "ing": [
      "doenjang",
      "anchovy",
      "kelp",
      "zucchini",
      "potato",
      "tofu",
      "chili",
      "scallion"
    ],
    "steps": [
      [
        "cook",
        "멸치와 다시마로 육수를 내고 있어요"
      ],
      [
        "cut",
        "감자, 애호박, 두부를 썰고 있어요"
      ],
      [
        "mix",
        "된장을 풀고 있어요"
      ],
      [
        "cook",
        "채소를 넣고 끓이고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "gyeran_mari",
    "name": "계란말이",
    "cuisine": "korean",
    "level": 2,
    "min": 20,
    "ing": [
      "egg",
      "carrot",
      "scallion",
      "salt",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "당근과 파를 잘게 다지고 있어요"
      ],
      [
        "mix",
        "달걀을 곱게 풀고 있어요"
      ],
      [
        "cook",
        "팬에 달걀물을 부어 돌돌 말고 있어요"
      ],
      [
        "cut",
        "한입 크기로 썰고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "kimchi_bokkeumbap",
    "name": "김치볶음밥",
    "cuisine": "korean",
    "level": 1,
    "min": 20,
    "ing": [
      "rice",
      "kimchi",
      "ham",
      "scallion",
      "egg",
      "sesameoil",
      "laver"
    ],
    "steps": [
      [
        "cut",
        "김치와 햄을 잘게 썰고 있어요"
      ],
      [
        "cook",
        "파기름을 내고 있어요"
      ],
      [
        "cook",
        "김치와 햄, 밥을 볶고 있어요"
      ],
      [
        "cook",
        "달걀 프라이를 부치고 있어요"
      ],
      [
        "plate",
        "밥 위에 달걀과 김을 올리고 있어요"
      ]
    ]
  },
  {
    "id": "tteokbokki",
    "name": "떡볶이",
    "cuisine": "korean",
    "level": 1,
    "min": 25,
    "ing": [
      "ricecake",
      "fishcake",
      "cabbage",
      "scallion",
      "gochujang",
      "sugar",
      "soysauce"
    ],
    "steps": [
      [
        "cut",
        "어묵과 양배추, 파를 썰고 있어요"
      ],
      [
        "mix",
        "고추장 양념을 풀고 있어요"
      ],
      [
        "cook",
        "떡과 어묵을 넣고 끓이고 있어요"
      ],
      [
        "cook",
        "국물을 졸이고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "miyeokguk",
    "name": "미역국",
    "cuisine": "korean",
    "level": 1,
    "min": 50,
    "ing": [
      "seaweed",
      "beef",
      "sesameoil",
      "soysauce",
      "garlic"
    ],
    "steps": [
      [
        "prep",
        "미역을 불리고 있어요"
      ],
      [
        "cut",
        "소고기를 썰고 있어요"
      ],
      [
        "cook",
        "참기름에 소고기와 미역을 볶고 있어요"
      ],
      [
        "cook",
        "물을 붓고 오래 끓이고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "jeyuk_bokkeum",
    "name": "제육볶음",
    "cuisine": "korean",
    "level": 2,
    "min": 30,
    "ing": [
      "pork",
      "onion",
      "carrot",
      "scallion",
      "gochujang",
      "chilipowder",
      "sugar",
      "garlic"
    ],
    "steps": [
      [
        "cut",
        "돼지고기와 채소를 썰고 있어요"
      ],
      [
        "mix",
        "고추장 양념에 고기를 버무리고 있어요"
      ],
      [
        "cook",
        "센 불에 고기를 볶고 있어요"
      ],
      [
        "cook",
        "채소를 넣고 함께 볶고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "bulgogi",
    "name": "불고기",
    "cuisine": "korean",
    "level": 2,
    "min": 30,
    "ing": [
      "beef",
      "pear",
      "onion",
      "mushroom",
      "soysauce",
      "sugar",
      "sesameoil",
      "garlic"
    ],
    "steps": [
      [
        "cut",
        "배를 갈고 채소를 썰고 있어요"
      ],
      [
        "mix",
        "간장 양념에 고기를 재우고 있어요"
      ],
      [
        "cook",
        "팬에 고기를 굽고 있어요"
      ],
      [
        "plate",
        "깨를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "bibimbap",
    "name": "비빔밥",
    "cuisine": "korean",
    "level": 2,
    "min": 45,
    "ing": [
      "rice",
      "spinach",
      "carrot",
      "zucchini",
      "beef",
      "egg",
      "gochujang",
      "sesameoil"
    ],
    "steps": [
      [
        "cut",
        "당근과 애호박을 채 썰고 있어요"
      ],
      [
        "cook",
        "시금치를 데쳐 무치고 있어요"
      ],
      [
        "cook",
        "채소와 소고기를 볶고 있어요"
      ],
      [
        "cook",
        "달걀 프라이를 부치고 있어요"
      ],
      [
        "plate",
        "밥 위에 나물을 올리고 있어요"
      ]
    ]
  },
  {
    "id": "gimbap",
    "name": "김밥",
    "cuisine": "korean",
    "level": 2,
    "min": 50,
    "ing": [
      "rice",
      "laver",
      "danmuji",
      "ham",
      "carrot",
      "spinach",
      "egg",
      "sesameoil"
    ],
    "steps": [
      [
        "cut",
        "단무지와 햄을 길게 썰고 있어요"
      ],
      [
        "cook",
        "당근을 볶고 달걀을 부치고 있어요"
      ],
      [
        "mix",
        "밥에 참기름을 섞고 있어요"
      ],
      [
        "prep",
        "김 위에 재료를 올려 말고 있어요"
      ],
      [
        "cut",
        "김밥을 썰고 있어요"
      ]
    ]
  },
  {
    "id": "japchae",
    "name": "잡채",
    "cuisine": "korean",
    "level": 3,
    "min": 60,
    "ing": [
      "glassnoodle",
      "beef",
      "onion",
      "carrot",
      "pepper_veg",
      "spinach",
      "mushroom",
      "soysauce",
      "sugar",
      "sesameoil"
    ],
    "steps": [
      [
        "prep",
        "당면을 불리고 있어요"
      ],
      [
        "cut",
        "채소와 소고기를 채 썰고 있어요"
      ],
      [
        "cook",
        "재료를 하나씩 볶고 있어요"
      ],
      [
        "cook",
        "당면을 삶아 간장에 볶고 있어요"
      ],
      [
        "mix",
        "모든 재료를 버무리고 있어요"
      ]
    ]
  },
  {
    "id": "haemul_pajeon",
    "name": "해물파전",
    "cuisine": "korean",
    "level": 2,
    "min": 35,
    "ing": [
      "scallion",
      "squid",
      "shrimp",
      "flour",
      "egg",
      "soysauce",
      "vinegar",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "파를 다듬고 오징어를 썰고 있어요"
      ],
      [
        "mix",
        "밀가루 반죽물을 만들고 있어요"
      ],
      [
        "cook",
        "파와 해물을 깔고 반죽을 부치고 있어요"
      ],
      [
        "cook",
        "뒤집어서 바삭하게 굽고 있어요"
      ],
      [
        "plate",
        "썰어서 담고 있어요"
      ]
    ]
  },
  {
    "id": "sundubu_jjigae",
    "name": "순두부찌개",
    "cuisine": "korean",
    "level": 2,
    "min": 25,
    "ing": [
      "tofu",
      "pork",
      "onion",
      "scallion",
      "chilipowder",
      "soysauce",
      "egg"
    ],
    "steps": [
      [
        "cut",
        "돼지고기와 양파를 썰고 있어요"
      ],
      [
        "cook",
        "고춧가루로 고추기름을 내고 있어요"
      ],
      [
        "cook",
        "순두부를 넣고 끓이고 있어요"
      ],
      [
        "mix",
        "달걀을 깨 넣고 있어요"
      ],
      [
        "plate",
        "뚝배기째 내고 있어요"
      ]
    ]
  },
  {
    "id": "dakgalbi",
    "name": "닭갈비",
    "cuisine": "korean",
    "level": 2,
    "min": 40,
    "ing": [
      "chicken",
      "cabbage",
      "sweetpotato",
      "onion",
      "scallion",
      "ricecake",
      "gochujang"
    ],
    "steps": [
      [
        "cut",
        "닭고기를 먹기 좋게 썰고 있어요"
      ],
      [
        "mix",
        "고추장 양념에 닭을 버무리고 있어요"
      ],
      [
        "cut",
        "양배추와 고구마를 썰고 있어요"
      ],
      [
        "cook",
        "철판에 재료를 올려 볶고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "sogogi_muguk",
    "name": "소고기무국",
    "cuisine": "korean",
    "level": 1,
    "min": 40,
    "ing": [
      "beef",
      "radish",
      "scallion",
      "soysauce",
      "garlic",
      "sesameoil"
    ],
    "steps": [
      [
        "cut",
        "무를 나박하게 썰고 있어요"
      ],
      [
        "cut",
        "소고기를 썰고 있어요"
      ],
      [
        "cook",
        "참기름에 소고기와 무를 볶고 있어요"
      ],
      [
        "cook",
        "물을 붓고 끓이고 있어요"
      ],
      [
        "plate",
        "파를 올려 담고 있어요"
      ]
    ]
  },
  {
    "id": "gamja_jorim",
    "name": "감자조림",
    "cuisine": "korean",
    "level": 1,
    "min": 30,
    "ing": [
      "potato",
      "onion",
      "soysauce",
      "sugar",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "감자 껍질을 벗기고 깍둑 썰고 있어요"
      ],
      [
        "cook",
        "기름에 감자를 볶고 있어요"
      ],
      [
        "cook",
        "간장과 설탕을 넣고 조리고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "samgyetang",
    "name": "삼계탕",
    "cuisine": "korean",
    "level": 3,
    "min": 90,
    "ing": [
      "chicken",
      "glutinous",
      "jujube",
      "garlic",
      "scallion",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "찹쌀을 불리고 있어요"
      ],
      [
        "prep",
        "닭 뱃속에 찹쌀과 대추, 마늘을 채우고 있어요"
      ],
      [
        "cook",
        "냄비에 넣고 푹 끓이고 있어요"
      ],
      [
        "cut",
        "파를 송송 썰고 있어요"
      ],
      [
        "plate",
        "뚝배기에 담고 있어요"
      ]
    ]
  },
  {
    "id": "galbijjim",
    "name": "소갈비찜",
    "cuisine": "korean",
    "level": 4,
    "min": 120,
    "ing": [
      "beef",
      "radish",
      "carrot",
      "mushroom",
      "jujube",
      "pear",
      "soysauce",
      "sugar",
      "garlic"
    ],
    "steps": [
      [
        "prep",
        "갈비의 핏물을 빼고 있어요"
      ],
      [
        "cook",
        "갈비를 데쳐 헹구고 있어요"
      ],
      [
        "mix",
        "간장 양념을 만들고 있어요"
      ],
      [
        "cut",
        "무와 당근을 큼직하게 썰고 있어요"
      ],
      [
        "cook",
        "갈비와 채소를 오래 조리고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "hotteok",
    "name": "호떡",
    "cuisine": "korean",
    "level": 2,
    "min": 30,
    "ing": [
      "flour",
      "glutinous",
      "yeast",
      "sugar",
      "nuts",
      "spice",
      "oil"
    ],
    "steps": [
      [
        "mix",
        "밀가루 반죽을 치대고 있어요"
      ],
      [
        "prep",
        "반죽이 부풀기를 기다리고 있어요"
      ],
      [
        "mix",
        "설탕과 견과류로 소를 만들고 있어요"
      ],
      [
        "mix",
        "반죽에 소를 넣고 오므리고 있어요"
      ],
      [
        "cook",
        "팬에 올려 눌러 굽고 있어요"
      ]
    ]
  },
  {
    "id": "yakgwa",
    "name": "약과",
    "cuisine": "korean",
    "level": 4,
    "min": 90,
    "ing": [
      "flour",
      "sesameoil",
      "honey",
      "ricewine",
      "ginger",
      "nuts",
      "oil"
    ],
    "steps": [
      [
        "mix",
        "밀가루에 참기름을 비비고 있어요"
      ],
      [
        "mix",
        "꿀과 술을 넣고 반죽하고 있어요"
      ],
      [
        "prep",
        "약과판에 찍어 모양을 내고 있어요"
      ],
      [
        "cook",
        "기름에 천천히 튀기고 있어요"
      ],
      [
        "prep",
        "꿀물에 담가 두고 있어요"
      ]
    ]
  },
  {
    "id": "miso_shiru",
    "name": "미소시루",
    "cuisine": "japanese",
    "level": 1,
    "min": 20,
    "ing": [
      "kelp",
      "bonito",
      "miso",
      "tofu",
      "seaweed",
      "scallion"
    ],
    "steps": [
      [
        "cook",
        "다시마와 가쓰오부시로 육수를 내고 있어요"
      ],
      [
        "cut",
        "두부와 파를 썰고 있어요"
      ],
      [
        "cook",
        "두부와 미역을 넣고 데우고 있어요"
      ],
      [
        "mix",
        "불을 끄고 미소를 풀고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "onigiri",
    "name": "오니기리",
    "cuisine": "japanese",
    "level": 1,
    "min": 30,
    "ing": [
      "rice",
      "salmon",
      "salt",
      "laver"
    ],
    "steps": [
      [
        "cook",
        "연어를 굽고 있어요"
      ],
      [
        "prep",
        "연어 살을 발라내고 있어요"
      ],
      [
        "prep",
        "손에 소금물을 묻히고 있어요"
      ],
      [
        "prep",
        "밥을 세모나게 쥐고 있어요"
      ],
      [
        "plate",
        "김을 두르고 있어요"
      ]
    ]
  },
  {
    "id": "tamagoyaki",
    "name": "타마고야키",
    "cuisine": "japanese",
    "level": 2,
    "min": 20,
    "ing": [
      "egg",
      "kelp",
      "sugar",
      "soysauce",
      "oil"
    ],
    "steps": [
      [
        "mix",
        "달걀에 육수와 설탕을 섞고 있어요"
      ],
      [
        "cook",
        "사각 팬에 얇게 부어 말고 있어요"
      ],
      [
        "cook",
        "여러 번 겹쳐 말고 있어요"
      ],
      [
        "cut",
        "썰고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "oyakodon",
    "name": "오야코동",
    "cuisine": "japanese",
    "level": 2,
    "min": 25,
    "ing": [
      "chicken",
      "onion",
      "egg",
      "rice",
      "soysauce",
      "sugar",
      "ricewine"
    ],
    "steps": [
      [
        "cut",
        "닭고기와 양파를 썰고 있어요"
      ],
      [
        "cook",
        "간장 양념에 닭고기를 익히고 있어요"
      ],
      [
        "mix",
        "달걀을 풀어 두르고 있어요"
      ],
      [
        "plate",
        "밥 위에 올리고 있어요"
      ]
    ]
  },
  {
    "id": "gyudon",
    "name": "규동",
    "cuisine": "japanese",
    "level": 1,
    "min": 20,
    "ing": [
      "beef",
      "onion",
      "rice",
      "soysauce",
      "sugar",
      "ricewine",
      "ginger"
    ],
    "steps": [
      [
        "cut",
        "양파를 채 썰고 있어요"
      ],
      [
        "cook",
        "양념에 양파를 끓이고 있어요"
      ],
      [
        "cook",
        "소고기를 넣고 졸이고 있어요"
      ],
      [
        "plate",
        "밥 위에 올리고 있어요"
      ]
    ]
  },
  {
    "id": "kare_raisu",
    "name": "카레라이스",
    "cuisine": "japanese",
    "level": 1,
    "min": 50,
    "ing": [
      "curry",
      "onion",
      "potato",
      "carrot",
      "pork",
      "rice"
    ],
    "steps": [
      [
        "cut",
        "양파, 감자, 당근, 고기를 썰고 있어요"
      ],
      [
        "cook",
        "재료를 볶고 있어요"
      ],
      [
        "cook",
        "물을 붓고 끓이고 있어요"
      ],
      [
        "mix",
        "카레 루를 풀고 있어요"
      ],
      [
        "plate",
        "밥 옆에 카레를 붓고 있어요"
      ]
    ]
  },
  {
    "id": "nikujaga",
    "name": "니쿠자가",
    "cuisine": "japanese",
    "level": 2,
    "min": 45,
    "ing": [
      "potato",
      "carrot",
      "onion",
      "beef",
      "soysauce",
      "sugar",
      "ricewine"
    ],
    "steps": [
      [
        "cut",
        "감자와 당근, 양파를 썰고 있어요"
      ],
      [
        "cook",
        "고기와 채소를 볶고 있어요"
      ],
      [
        "cook",
        "간장과 설탕을 넣고 조리고 있어요"
      ],
      [
        "prep",
        "불을 끄고 맛이 배기를 기다리고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "karaage",
    "name": "가라아게",
    "cuisine": "japanese",
    "level": 2,
    "min": 35,
    "ing": [
      "chicken",
      "soysauce",
      "ricewine",
      "ginger",
      "garlic",
      "starch",
      "lemon",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "닭고기를 한입 크기로 썰고 있어요"
      ],
      [
        "mix",
        "간장과 생강에 닭을 재우고 있어요"
      ],
      [
        "mix",
        "전분을 입히고 있어요"
      ],
      [
        "cook",
        "기름에 두 번 튀기고 있어요"
      ],
      [
        "plate",
        "레몬을 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "tonkatsu",
    "name": "돈카츠",
    "cuisine": "japanese",
    "level": 3,
    "min": 40,
    "ing": [
      "pork",
      "flour",
      "egg",
      "breadcrumb",
      "cabbage",
      "sauce",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "고기 힘줄에 칼집을 내고 있어요"
      ],
      [
        "mix",
        "밀가루, 달걀, 빵가루를 입히고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "cut",
        "양배추를 가늘게 채 썰고 있어요"
      ],
      [
        "cut",
        "돈카츠를 썰고 있어요"
      ],
      [
        "plate",
        "소스를 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "yakisoba",
    "name": "야키소바",
    "cuisine": "japanese",
    "level": 1,
    "min": 20,
    "ing": [
      "noodle",
      "pork",
      "cabbage",
      "carrot",
      "onion",
      "sauce"
    ],
    "steps": [
      [
        "cut",
        "고기와 채소를 썰고 있어요"
      ],
      [
        "cook",
        "고기와 채소를 볶고 있어요"
      ],
      [
        "cook",
        "면을 넣고 소스와 함께 볶고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "okonomiyaki",
    "name": "오코노미야키",
    "cuisine": "japanese",
    "level": 2,
    "min": 35,
    "ing": [
      "cabbage",
      "flour",
      "egg",
      "pork",
      "scallion",
      "sauce",
      "mayo",
      "bonito"
    ],
    "steps": [
      [
        "cut",
        "양배추와 파를 잘게 썰고 있어요"
      ],
      [
        "mix",
        "밀가루 반죽에 양배추를 섞고 있어요"
      ],
      [
        "cook",
        "반죽을 둥글게 부어 고기를 올리고 있어요"
      ],
      [
        "cook",
        "뒤집어 굽고 있어요"
      ],
      [
        "plate",
        "소스와 마요네즈를 뿌리고 있어요"
      ]
    ]
  },
  {
    "id": "gyoza",
    "name": "교자",
    "cuisine": "japanese",
    "level": 3,
    "min": 60,
    "ing": [
      "wrapper",
      "mince",
      "cabbage",
      "scallion",
      "ginger",
      "garlic",
      "soysauce",
      "sesameoil"
    ],
    "steps": [
      [
        "cut",
        "양배추와 파를 잘게 다지고 있어요"
      ],
      [
        "mix",
        "고기와 채소를 치대고 있어요"
      ],
      [
        "prep",
        "만두피에 소를 넣고 빚고 있어요"
      ],
      [
        "cook",
        "팬에 굽고 물을 부어 찌고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "chawanmushi",
    "name": "차완무시",
    "cuisine": "japanese",
    "level": 3,
    "min": 40,
    "ing": [
      "egg",
      "kelp",
      "bonito",
      "soysauce",
      "chicken",
      "shrimp",
      "mushroom"
    ],
    "steps": [
      [
        "cook",
        "육수를 내어 식히고 있어요"
      ],
      [
        "mix",
        "달걀과 육수를 섞어 거르고 있어요"
      ],
      [
        "cut",
        "닭고기와 버섯을 썰고 있어요"
      ],
      [
        "cook",
        "그릇째 찜기에 찌고 있어요"
      ],
      [
        "plate",
        "그대로 내고 있어요"
      ]
    ]
  },
  {
    "id": "tempura",
    "name": "덴푸라",
    "cuisine": "japanese",
    "level": 4,
    "min": 50,
    "ing": [
      "shrimp",
      "sweetpotato",
      "eggplant",
      "flour",
      "egg",
      "radish",
      "soysauce",
      "oil"
    ],
    "steps": [
      [
        "prep",
        "새우를 손질하고 있어요"
      ],
      [
        "cut",
        "고구마와 가지를 썰고 있어요"
      ],
      [
        "mix",
        "찬물로 튀김 반죽을 대충 섞고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "plate",
        "간 무와 간장을 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "sukiyaki",
    "name": "스키야키",
    "cuisine": "japanese",
    "level": 3,
    "min": 40,
    "ing": [
      "beef",
      "scallion",
      "tofu",
      "mushroom",
      "soysauce",
      "sugar",
      "ricewine",
      "egg"
    ],
    "steps": [
      [
        "cut",
        "파와 두부, 버섯을 썰고 있어요"
      ],
      [
        "mix",
        "간장 양념을 만들고 있어요"
      ],
      [
        "cook",
        "냄비에 소고기를 굽고 있어요"
      ],
      [
        "cook",
        "양념과 재료를 넣고 끓이고 있어요"
      ],
      [
        "mix",
        "날달걀을 풀고 있어요"
      ]
    ]
  },
  {
    "id": "kitsune_udon",
    "name": "키츠네 우동",
    "cuisine": "japanese",
    "level": 2,
    "min": 35,
    "ing": [
      "noodle",
      "friedtofu",
      "kelp",
      "bonito",
      "soysauce",
      "sugar",
      "scallion"
    ],
    "steps": [
      [
        "cook",
        "유부를 달게 조리고 있어요"
      ],
      [
        "cook",
        "육수를 내고 있어요"
      ],
      [
        "cook",
        "면을 삶고 있어요"
      ],
      [
        "plate",
        "국물을 붓고 유부를 올리고 있어요"
      ]
    ]
  },
  {
    "id": "shoyu_ramen",
    "name": "쇼유 라멘",
    "cuisine": "japanese",
    "level": 4,
    "min": 120,
    "ing": [
      "noodle",
      "chicken",
      "pork",
      "scallion",
      "ginger",
      "garlic",
      "soysauce",
      "egg",
      "laver"
    ],
    "steps": [
      [
        "cook",
        "닭 뼈로 육수를 오래 끓이고 있어요"
      ],
      [
        "cook",
        "돼지고기를 조려 차슈를 만들고 있어요"
      ],
      [
        "cook",
        "달걀을 반숙으로 삶고 있어요"
      ],
      [
        "cook",
        "면을 삶고 있어요"
      ],
      [
        "plate",
        "국물을 붓고 고명을 올리고 있어요"
      ]
    ]
  },
  {
    "id": "nigirizushi",
    "name": "니기리즈시",
    "cuisine": "japanese",
    "level": 5,
    "min": 60,
    "ing": [
      "rice",
      "vinegar",
      "sugar",
      "salt",
      "salmon",
      "whitefish"
    ],
    "steps": [
      [
        "mix",
        "밥에 초를 섞고 있어요"
      ],
      [
        "prep",
        "밥을 식히고 있어요"
      ],
      [
        "cut",
        "생선을 한 점씩 썰고 있어요"
      ],
      [
        "prep",
        "밥을 쥐어 생선을 올리고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "takoyaki",
    "name": "타코야키",
    "cuisine": "japanese",
    "level": 3,
    "min": 40,
    "ing": [
      "octopus",
      "flour",
      "egg",
      "kelp",
      "scallion",
      "sauce",
      "mayo",
      "bonito"
    ],
    "steps": [
      [
        "cut",
        "문어와 파를 썰고 있어요"
      ],
      [
        "mix",
        "묽은 반죽을 만들고 있어요"
      ],
      [
        "cook",
        "틀에 반죽과 문어를 넣고 있어요"
      ],
      [
        "cook",
        "꼬챙이로 굴리며 굽고 있어요"
      ],
      [
        "plate",
        "소스와 가쓰오부시를 올리고 있어요"
      ]
    ]
  },
  {
    "id": "mitarashi_dango",
    "name": "미타라시 당고",
    "cuisine": "japanese",
    "level": 2,
    "min": 30,
    "ing": [
      "glutinous",
      "soysauce",
      "sugar",
      "starch"
    ],
    "steps": [
      [
        "mix",
        "찹쌀가루를 반죽하고 있어요"
      ],
      [
        "prep",
        "동그랗게 빚고 있어요"
      ],
      [
        "cook",
        "끓는 물에 삶고 있어요"
      ],
      [
        "cook",
        "꼬치에 꿰어 살짝 굽고 있어요"
      ],
      [
        "plate",
        "달콤한 간장 소스를 바르고 있어요"
      ]
    ]
  },
  {
    "id": "pancakes",
    "name": "팬케이크",
    "cuisine": "american",
    "level": 1,
    "min": 25,
    "ing": [
      "flour",
      "sugar",
      "bakingpowder",
      "milk",
      "egg",
      "butter",
      "honey"
    ],
    "steps": [
      [
        "mix",
        "가루 재료와 우유, 달걀을 섞고 있어요"
      ],
      [
        "cook",
        "팬에 반죽을 둥글게 붓고 있어요"
      ],
      [
        "cook",
        "기포가 올라와서 뒤집고 있어요"
      ],
      [
        "plate",
        "쌓아 올리고 시럽을 뿌리고 있어요"
      ]
    ]
  },
  {
    "id": "grilled_cheese",
    "name": "그릴드 치즈 샌드위치",
    "cuisine": "american",
    "level": 1,
    "min": 15,
    "ing": [
      "bread",
      "cheese",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "빵에 버터를 바르고 있어요"
      ],
      [
        "prep",
        "빵 사이에 치즈를 넣고 있어요"
      ],
      [
        "cook",
        "팬에 앞뒤로 굽고 있어요"
      ],
      [
        "cut",
        "대각선으로 자르고 있어요"
      ]
    ]
  },
  {
    "id": "blt",
    "name": "BLT 샌드위치",
    "cuisine": "american",
    "level": 1,
    "min": 20,
    "ing": [
      "bacon",
      "lettuce",
      "tomato",
      "bread",
      "mayo"
    ],
    "steps": [
      [
        "cook",
        "베이컨을 바삭하게 굽고 있어요"
      ],
      [
        "cut",
        "토마토를 썰고 있어요"
      ],
      [
        "cook",
        "빵을 굽고 있어요"
      ],
      [
        "prep",
        "빵에 재료를 쌓고 있어요"
      ],
      [
        "cut",
        "반으로 자르고 있어요"
      ]
    ]
  },
  {
    "id": "mac_and_cheese",
    "name": "맥 앤 치즈",
    "cuisine": "american",
    "level": 2,
    "min": 45,
    "ing": [
      "pasta",
      "cheese",
      "butter",
      "flour",
      "milk",
      "breadcrumb"
    ],
    "steps": [
      [
        "cook",
        "마카로니를 삶고 있어요"
      ],
      [
        "cook",
        "버터와 밀가루, 우유로 소스를 만들고 있어요"
      ],
      [
        "mix",
        "치즈를 녹여 넣고 있어요"
      ],
      [
        "cook",
        "빵가루를 뿌려 오븐에 굽고 있어요"
      ],
      [
        "plate",
        "그릇에 덜고 있어요"
      ]
    ]
  },
  {
    "id": "cheeseburger",
    "name": "치즈버거",
    "cuisine": "american",
    "level": 2,
    "min": 30,
    "ing": [
      "mince",
      "cheese",
      "bread",
      "lettuce",
      "tomato",
      "onion",
      "ketchup"
    ],
    "steps": [
      [
        "prep",
        "고기를 납작하게 빚고 있어요"
      ],
      [
        "cut",
        "양파와 토마토를 썰고 있어요"
      ],
      [
        "cook",
        "패티를 굽고 치즈를 올리고 있어요"
      ],
      [
        "cook",
        "빵을 굽고 있어요"
      ],
      [
        "plate",
        "재료를 차곡차곡 쌓고 있어요"
      ]
    ]
  },
  {
    "id": "hot_dog",
    "name": "핫도그",
    "cuisine": "american",
    "level": 1,
    "min": 15,
    "ing": [
      "sausage",
      "bread",
      "onion",
      "mustard",
      "ketchup"
    ],
    "steps": [
      [
        "cook",
        "소시지를 굽고 있어요"
      ],
      [
        "cut",
        "양파를 잘게 다지고 있어요"
      ],
      [
        "prep",
        "빵에 소시지를 끼우고 있어요"
      ],
      [
        "plate",
        "케첩과 머스터드를 뿌리고 있어요"
      ]
    ]
  },
  {
    "id": "cobb_salad",
    "name": "코브 샐러드",
    "cuisine": "american",
    "level": 2,
    "min": 40,
    "ing": [
      "lettuce",
      "chicken",
      "bacon",
      "egg",
      "tomato",
      "cheese",
      "vinegar",
      "oliveoil",
      "mustard"
    ],
    "steps": [
      [
        "cook",
        "베이컨과 달걀, 닭고기를 익히고 있어요"
      ],
      [
        "cut",
        "양상추를 썰고 있어요"
      ],
      [
        "cut",
        "재료를 깍둑 썰고 있어요"
      ],
      [
        "mix",
        "드레싱을 만들고 있어요"
      ],
      [
        "plate",
        "재료를 줄지어 올리고 있어요"
      ]
    ]
  },
  {
    "id": "buffalo_wings",
    "name": "버팔로 윙",
    "cuisine": "american",
    "level": 2,
    "min": 45,
    "ing": [
      "chicken",
      "sauce",
      "butter",
      "celery",
      "carrot",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "닭날개를 마디대로 자르고 있어요"
      ],
      [
        "cook",
        "기름에 바삭하게 튀기고 있어요"
      ],
      [
        "mix",
        "버터와 핫소스에 버무리고 있어요"
      ],
      [
        "cut",
        "셀러리와 당근을 스틱으로 썰고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "fried_chicken",
    "name": "서던 프라이드치킨",
    "cuisine": "american",
    "level": 3,
    "min": 60,
    "ing": [
      "chicken",
      "milk",
      "flour",
      "spice",
      "pepper",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "닭을 부위별로 자르고 있어요"
      ],
      [
        "mix",
        "우유에 닭을 재우고 있어요"
      ],
      [
        "mix",
        "양념한 밀가루를 입히고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "meatloaf",
    "name": "미트로프",
    "cuisine": "american",
    "level": 2,
    "min": 30,
    "ing": [
      "mince",
      "onion",
      "breadcrumb",
      "egg",
      "ketchup",
      "sugar"
    ],
    "steps": [
      [
        "cut",
        "양파를 다지고 있어요"
      ],
      [
        "mix",
        "고기와 빵가루, 달걀을 치대고 있어요"
      ],
      [
        "prep",
        "덩어리로 빚어 케첩을 바르고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "cut",
        "두툼하게 썰고 있어요"
      ]
    ]
  },
  {
    "id": "chili_con_carne",
    "name": "칠리 콘 카르네",
    "cuisine": "american",
    "level": 2,
    "min": 40,
    "ing": [
      "mince",
      "onion",
      "pepper_veg",
      "garlic",
      "spice",
      "tomato",
      "beans",
      "cheese"
    ],
    "steps": [
      [
        "cut",
        "양파와 파프리카, 마늘을 다지고 있어요"
      ],
      [
        "cook",
        "고기와 채소를 볶고 있어요"
      ],
      [
        "mix",
        "향신료를 넣고 있어요"
      ],
      [
        "cook",
        "토마토와 콩을 넣고 오래 끓이고 있어요"
      ],
      [
        "plate",
        "치즈를 올려 담고 있어요"
      ]
    ]
  },
  {
    "id": "clam_chowder",
    "name": "클램 차우더",
    "cuisine": "american",
    "level": 3,
    "min": 50,
    "ing": [
      "clam",
      "bacon",
      "onion",
      "celery",
      "potato",
      "flour",
      "milk",
      "cream",
      "biscuit"
    ],
    "steps": [
      [
        "cook",
        "조개를 쪄서 살을 바르고 있어요"
      ],
      [
        "cut",
        "베이컨과 채소를 썰고 있어요"
      ],
      [
        "cook",
        "베이컨과 채소를 볶고 있어요"
      ],
      [
        "cook",
        "우유와 크림을 붓고 끓이고 있어요"
      ],
      [
        "plate",
        "크래커를 곁들여 담고 있어요"
      ]
    ]
  },
  {
    "id": "chicken_pot_pie",
    "name": "치킨 팟 파이",
    "cuisine": "american",
    "level": 3,
    "min": 60,
    "ing": [
      "chicken",
      "onion",
      "carrot",
      "celery",
      "beans",
      "butter",
      "flour",
      "milk"
    ],
    "steps": [
      [
        "cook",
        "닭을 삶아 살을 찢고 있어요"
      ],
      [
        "cut",
        "채소를 썰고 있어요"
      ],
      [
        "cook",
        "채소를 볶아 걸쭉한 소스를 만들고 있어요"
      ],
      [
        "mix",
        "그릇에 담고 파이 반죽을 덮고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ]
    ]
  },
  {
    "id": "bbq_ribs",
    "name": "바비큐 폭립",
    "cuisine": "american",
    "level": 4,
    "min": 45,
    "ing": [
      "pork",
      "sugar",
      "spice",
      "salt",
      "sauce"
    ],
    "steps": [
      [
        "mix",
        "양념 가루를 갈비에 바르고 있어요"
      ],
      [
        "prep",
        "양념이 배기를 기다리고 있어요"
      ],
      [
        "cook",
        "낮은 온도의 오븐에서 오래 굽고 있어요"
      ],
      [
        "cook",
        "소스를 발라 한 번 더 굽고 있어요"
      ],
      [
        "cut",
        "뼈 사이로 자르고 있어요"
      ]
    ]
  },
  {
    "id": "biscuits_gravy",
    "name": "비스킷 앤 그레이비",
    "cuisine": "american",
    "level": 3,
    "min": 45,
    "ing": [
      "flour",
      "bakingpowder",
      "butter",
      "milk",
      "sausage",
      "pepper"
    ],
    "steps": [
      [
        "mix",
        "밀가루에 차가운 버터를 섞고 있어요"
      ],
      [
        "cut",
        "반죽을 동그랗게 찍어내고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "cook",
        "소시지와 우유로 그레이비를 끓이고 있어요"
      ],
      [
        "plate",
        "비스킷에 그레이비를 끼얹고 있어요"
      ]
    ]
  },
  {
    "id": "cornbread",
    "name": "콘브레드",
    "cuisine": "american",
    "level": 1,
    "min": 35,
    "ing": [
      "cornmeal",
      "flour",
      "sugar",
      "bakingpowder",
      "milk",
      "egg",
      "butter"
    ],
    "steps": [
      [
        "mix",
        "옥수숫가루와 밀가루를 섞고 있어요"
      ],
      [
        "mix",
        "우유와 달걀, 버터를 넣고 있어요"
      ],
      [
        "cook",
        "달군 팬에 반죽을 붓고 오븐에 굽고 있어요"
      ],
      [
        "cut",
        "조각으로 자르고 있어요"
      ]
    ]
  },
  {
    "id": "apple_pie",
    "name": "애플파이",
    "cuisine": "american",
    "level": 4,
    "min": 90,
    "ing": [
      "flour",
      "butter",
      "apple",
      "sugar",
      "spice",
      "lemon"
    ],
    "steps": [
      [
        "mix",
        "파이 반죽을 만들고 있어요"
      ],
      [
        "cut",
        "사과를 얇게 썰고 있어요"
      ],
      [
        "mix",
        "사과에 설탕과 계피를 버무리고 있어요"
      ],
      [
        "prep",
        "반죽에 사과를 채우고 덮고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "cut",
        "조각으로 자르고 있어요"
      ]
    ]
  },
  {
    "id": "choc_chip_cookies",
    "name": "초콜릿칩 쿠키",
    "cuisine": "american",
    "level": 2,
    "min": 35,
    "ing": [
      "butter",
      "sugar",
      "egg",
      "flour",
      "bakingpowder",
      "chocolate"
    ],
    "steps": [
      [
        "mix",
        "버터와 설탕을 섞고 있어요"
      ],
      [
        "mix",
        "달걀과 밀가루를 넣고 있어요"
      ],
      [
        "mix",
        "초콜릿을 섞고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "plate",
        "식혀서 담고 있어요"
      ]
    ]
  },
  {
    "id": "brownies",
    "name": "브라우니",
    "cuisine": "american",
    "level": 2,
    "min": 35,
    "ing": [
      "chocolate",
      "butter",
      "sugar",
      "egg",
      "flour"
    ],
    "steps": [
      [
        "cook",
        "초콜릿과 버터를 녹이고 있어요"
      ],
      [
        "mix",
        "설탕과 달걀을 섞고 있어요"
      ],
      [
        "mix",
        "밀가루를 넣고 가볍게 섞고 있어요"
      ],
      [
        "cook",
        "틀에 부어 굽고 있어요"
      ],
      [
        "cut",
        "네모나게 자르고 있어요"
      ]
    ]
  },
  {
    "id": "american_breakfast",
    "name": "아메리칸 브렉퍼스트",
    "cuisine": "american",
    "level": 2,
    "min": 30,
    "ing": [
      "potato",
      "bacon",
      "egg",
      "milk",
      "bread",
      "butter"
    ],
    "steps": [
      [
        "cut",
        "감자를 강판에 갈고 있어요"
      ],
      [
        "cook",
        "감자를 노릇하게 부치고 있어요"
      ],
      [
        "cook",
        "베이컨을 굽고 있어요"
      ],
      [
        "cook",
        "달걀을 스크램블하고 있어요"
      ],
      [
        "plate",
        "한 접시에 모아 담고 있어요"
      ]
    ]
  },
  {
    "id": "bruschetta",
    "name": "브루스케타",
    "cuisine": "italian",
    "level": 1,
    "min": 15,
    "ing": [
      "bread",
      "tomato",
      "garlic",
      "herb",
      "oliveoil"
    ],
    "steps": [
      [
        "cut",
        "토마토를 잘게 썰고 있어요"
      ],
      [
        "mix",
        "토마토에 올리브유와 바질을 버무리고 있어요"
      ],
      [
        "cook",
        "빵을 굽고 있어요"
      ],
      [
        "prep",
        "빵에 마늘을 문지르고 있어요"
      ],
      [
        "plate",
        "토마토를 올리고 있어요"
      ]
    ]
  },
  {
    "id": "caprese",
    "name": "카프레제",
    "cuisine": "italian",
    "level": 1,
    "min": 10,
    "ing": [
      "tomato",
      "cheese",
      "herb",
      "oliveoil"
    ],
    "steps": [
      [
        "cut",
        "토마토를 썰고 있어요"
      ],
      [
        "cut",
        "모차렐라를 썰고 있어요"
      ],
      [
        "plate",
        "번갈아 담고 있어요"
      ],
      [
        "plate",
        "올리브유를 두르고 있어요"
      ]
    ]
  },
  {
    "id": "aglio_olio",
    "name": "알리오 올리오",
    "cuisine": "italian",
    "level": 1,
    "min": 20,
    "ing": [
      "pasta",
      "garlic",
      "oliveoil",
      "chili",
      "herb"
    ],
    "steps": [
      [
        "cook",
        "파스타를 삶고 있어요"
      ],
      [
        "cut",
        "마늘을 얇게 썰고 있어요"
      ],
      [
        "cook",
        "올리브유에 마늘과 고추를 익히고 있어요"
      ],
      [
        "mix",
        "면과 면수를 넣고 섞고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "pomodoro",
    "name": "스파게티 알 포모도로",
    "cuisine": "italian",
    "level": 2,
    "min": 30,
    "ing": [
      "pasta",
      "tomato",
      "garlic",
      "oliveoil",
      "herb",
      "hardcheese"
    ],
    "steps": [
      [
        "cut",
        "마늘을 썰고 있어요"
      ],
      [
        "cook",
        "토마토소스를 졸이고 있어요"
      ],
      [
        "cook",
        "파스타를 삶고 있어요"
      ],
      [
        "mix",
        "면을 소스에 버무리고 있어요"
      ],
      [
        "plate",
        "치즈를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "cacio_e_pepe",
    "name": "카초 에 페페",
    "cuisine": "italian",
    "level": 3,
    "min": 20,
    "ing": [
      "pasta",
      "hardcheese",
      "pepper"
    ],
    "steps": [
      [
        "cut",
        "치즈를 곱게 갈고 있어요"
      ],
      [
        "prep",
        "후추를 굵게 빻고 있어요"
      ],
      [
        "cook",
        "파스타를 삶고 있어요"
      ],
      [
        "mix",
        "치즈와 면수를 섞어 크림처럼 만들고 있어요"
      ],
      [
        "plate",
        "후추를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "carbonara",
    "name": "카르보나라",
    "cuisine": "italian",
    "level": 3,
    "min": 25,
    "ing": [
      "pasta",
      "bacon",
      "egg",
      "hardcheese",
      "pepper"
    ],
    "steps": [
      [
        "cut",
        "관찰레를 썰고 있어요"
      ],
      [
        "mix",
        "달걀노른자와 치즈를 섞고 있어요"
      ],
      [
        "cook",
        "관찰레를 굽고 파스타를 삶고 있어요"
      ],
      [
        "mix",
        "불을 끄고 소스를 버무리고 있어요"
      ],
      [
        "plate",
        "후추를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "amatriciana",
    "name": "아마트리치아나",
    "cuisine": "italian",
    "level": 2,
    "min": 35,
    "ing": [
      "pasta",
      "bacon",
      "wine",
      "tomato",
      "chili",
      "hardcheese"
    ],
    "steps": [
      [
        "cut",
        "관찰레를 썰고 있어요"
      ],
      [
        "cook",
        "관찰레를 바삭하게 굽고 있어요"
      ],
      [
        "cook",
        "와인과 토마토를 넣고 졸이고 있어요"
      ],
      [
        "cook",
        "파스타를 삶고 있어요"
      ],
      [
        "mix",
        "소스에 버무리고 있어요"
      ]
    ]
  },
  {
    "id": "minestrone",
    "name": "미네스트로네",
    "cuisine": "italian",
    "level": 2,
    "min": 60,
    "ing": [
      "onion",
      "carrot",
      "celery",
      "potato",
      "zucchini",
      "tomato",
      "beans",
      "pasta",
      "oliveoil"
    ],
    "steps": [
      [
        "cut",
        "채소를 잘게 썰고 있어요"
      ],
      [
        "cook",
        "채소를 올리브유에 볶고 있어요"
      ],
      [
        "cook",
        "토마토와 콩을 넣고 오래 끓이고 있어요"
      ],
      [
        "cook",
        "작은 파스타를 넣고 있어요"
      ],
      [
        "plate",
        "그릇에 담고 있어요"
      ]
    ]
  },
  {
    "id": "risotto_milanese",
    "name": "리조또 알라 밀라네제",
    "cuisine": "italian",
    "level": 3,
    "min": 40,
    "ing": [
      "rice",
      "saffron",
      "onion",
      "butter",
      "wine",
      "hardcheese"
    ],
    "steps": [
      [
        "cut",
        "양파를 곱게 다지고 있어요"
      ],
      [
        "cook",
        "버터에 쌀을 볶고 있어요"
      ],
      [
        "cook",
        "육수를 조금씩 부으며 젓고 있어요"
      ],
      [
        "mix",
        "사프란과 치즈를 섞고 있어요"
      ],
      [
        "plate",
        "넓게 펴 담고 있어요"
      ]
    ]
  },
  {
    "id": "gnocchi",
    "name": "뇨끼",
    "cuisine": "italian",
    "level": 3,
    "min": 60,
    "ing": [
      "potato",
      "flour",
      "egg",
      "butter",
      "herb",
      "hardcheese"
    ],
    "steps": [
      [
        "cook",
        "감자를 삶아 으깨고 있어요"
      ],
      [
        "mix",
        "밀가루와 달걀을 넣어 반죽하고 있어요"
      ],
      [
        "cut",
        "한입 크기로 자르고 있어요"
      ],
      [
        "cook",
        "끓는 물에 삶고 있어요"
      ],
      [
        "cook",
        "버터와 세이지에 버무리고 있어요"
      ]
    ]
  },
  {
    "id": "lasagna",
    "name": "라자냐",
    "cuisine": "italian",
    "level": 4,
    "min": 90,
    "ing": [
      "pasta",
      "mince",
      "onion",
      "carrot",
      "celery",
      "tomato",
      "butter",
      "flour",
      "milk",
      "hardcheese"
    ],
    "steps": [
      [
        "cook",
        "고기와 채소로 라구를 끓이고 있어요"
      ],
      [
        "cook",
        "베샤멜 소스를 만들고 있어요"
      ],
      [
        "cook",
        "라자냐 면을 삶고 있어요"
      ],
      [
        "prep",
        "소스와 면을 켜켜이 쌓고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "cut",
        "잘라서 나누고 있어요"
      ]
    ]
  },
  {
    "id": "pizza_margherita",
    "name": "마르게리타 피자",
    "cuisine": "italian",
    "level": 3,
    "min": 40,
    "ing": [
      "flour",
      "yeast",
      "tomato",
      "cheese",
      "herb",
      "oliveoil"
    ],
    "steps": [
      [
        "mix",
        "반죽을 치대고 있어요"
      ],
      [
        "prep",
        "반죽이 부풀기를 기다리고 있어요"
      ],
      [
        "prep",
        "반죽을 넓게 펴고 있어요"
      ],
      [
        "prep",
        "토마토소스와 치즈를 올리고 있어요"
      ],
      [
        "cook",
        "뜨거운 오븐에 굽고 있어요"
      ]
    ]
  },
  {
    "id": "focaccia",
    "name": "포카치아",
    "cuisine": "italian",
    "level": 2,
    "min": 30,
    "ing": [
      "flour",
      "yeast",
      "oliveoil",
      "salt",
      "herb"
    ],
    "steps": [
      [
        "mix",
        "반죽을 늘렸다 접고 있어요"
      ],
      [
        "prep",
        "반죽이 부풀기를 기다리고 있어요"
      ],
      [
        "prep",
        "손가락으로 구멍을 내고 있어요"
      ],
      [
        "cook",
        "올리브유를 뿌려 굽고 있어요"
      ],
      [
        "cut",
        "자르고 있어요"
      ]
    ]
  },
  {
    "id": "parmigiana",
    "name": "가지 파르미자나",
    "cuisine": "italian",
    "level": 3,
    "min": 70,
    "ing": [
      "eggplant",
      "tomato",
      "cheese",
      "hardcheese",
      "herb",
      "oil"
    ],
    "steps": [
      [
        "cut",
        "가지를 얇게 썰고 있어요"
      ],
      [
        "cook",
        "가지를 튀기고 있어요"
      ],
      [
        "prep",
        "소스와 가지, 치즈를 쌓고 있어요"
      ],
      [
        "cook",
        "오븐에 굽고 있어요"
      ],
      [
        "plate",
        "바질을 올려 담고 있어요"
      ]
    ]
  },
  {
    "id": "arancini",
    "name": "아란치니",
    "cuisine": "italian",
    "level": 4,
    "min": 60,
    "ing": [
      "rice",
      "saffron",
      "mince",
      "cheese",
      "flour",
      "egg",
      "breadcrumb",
      "oil"
    ],
    "steps": [
      [
        "cook",
        "사프란 리조또를 만들어 식히고 있어요"
      ],
      [
        "prep",
        "밥에 고기와 치즈를 넣고 둥글게 빚고 있어요"
      ],
      [
        "mix",
        "튀김옷을 입히고 있어요"
      ],
      [
        "cook",
        "기름에 튀기고 있어요"
      ],
      [
        "plate",
        "접시에 담고 있어요"
      ]
    ]
  },
  {
    "id": "saltimbocca",
    "name": "살팀보카",
    "cuisine": "italian",
    "level": 3,
    "min": 25,
    "ing": [
      "beef",
      "ham",
      "herb",
      "flour",
      "butter",
      "wine"
    ],
    "steps": [
      [
        "prep",
        "고기를 두드려 얇게 펴고 있어요"
      ],
      [
        "prep",
        "햄과 세이지를 올려 고정하고 있어요"
      ],
      [
        "cook",
        "버터에 굽고 있어요"
      ],
      [
        "cook",
        "와인을 붓고 졸이고 있어요"
      ],
      [
        "plate",
        "소스를 끼얹어 담고 있어요"
      ]
    ]
  },
  {
    "id": "ossobuco",
    "name": "오소부코",
    "cuisine": "italian",
    "level": 4,
    "min": 60,
    "ing": [
      "beef",
      "flour",
      "butter",
      "onion",
      "carrot",
      "celery",
      "wine",
      "lemon",
      "garlic",
      "herb"
    ],
    "steps": [
      [
        "mix",
        "고기에 밀가루를 묻히고 있어요"
      ],
      [
        "cook",
        "겉을 노릇하게 지지고 있어요"
      ],
      [
        "cut",
        "채소를 다지고 있어요"
      ],
      [
        "cook",
        "와인을 붓고 오래 조리고 있어요"
      ],
      [
        "cut",
        "레몬 껍질과 파슬리를 다지고 있어요"
      ],
      [
        "plate",
        "그레몰라타를 뿌려 담고 있어요"
      ]
    ]
  },
  {
    "id": "panna_cotta",
    "name": "판나코타",
    "cuisine": "italian",
    "level": 2,
    "min": 20,
    "ing": [
      "cream",
      "sugar",
      "gelatin",
      "berry"
    ],
    "steps": [
      [
        "prep",
        "젤라틴을 불리고 있어요"
      ],
      [
        "cook",
        "크림과 설탕을 데우고 있어요"
      ],
      [
        "mix",
        "젤라틴을 녹여 틀에 붓고 있어요"
      ],
      [
        "prep",
        "차갑게 굳히고 있어요"
      ],
      [
        "plate",
        "베리를 올려 담고 있어요"
      ]
    ]
  },
  {
    "id": "tiramisu",
    "name": "티라미수",
    "cuisine": "italian",
    "level": 3,
    "min": 40,
    "ing": [
      "mascarpone",
      "egg",
      "sugar",
      "coffee",
      "biscuit",
      "chocolate"
    ],
    "steps": [
      [
        "mix",
        "달걀과 설탕을 거품 내고 있어요"
      ],
      [
        "mix",
        "마스카르포네를 섞고 있어요"
      ],
      [
        "prep",
        "비스킷을 커피에 적시고 있어요"
      ],
      [
        "prep",
        "비스킷과 크림을 번갈아 쌓고 있어요"
      ],
      [
        "plate",
        "코코아 가루를 뿌리고 있어요"
      ]
    ]
  },
  {
    "id": "vongole",
    "name": "봉골레",
    "cuisine": "italian",
    "level": 2,
    "min": 30,
    "ing": [
      "pasta",
      "clam",
      "garlic",
      "oliveoil",
      "chili",
      "wine",
      "herb"
    ],
    "steps": [
      [
        "prep",
        "조개를 해감하고 있어요"
      ],
      [
        "cut",
        "마늘을 얇게 썰고 있어요"
      ],
      [
        "cook",
        "파스타를 삶고 있어요"
      ],
      [
        "cook",
        "마늘과 조개를 와인에 익히고 있어요"
      ],
      [
        "mix",
        "면을 조개 국물에 버무리고 있어요"
      ]
    ]
  },
  {
    "id": "quick_01",
    "name": "즉석밥",
    "names": {
      "en": "Instant rice",
      "ja": "パックご飯"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "rice"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": "microwave"
  },
  {
    "id": "quick_02",
    "name": "컵라면",
    "names": {
      "en": "Cup noodles",
      "ja": "カップ麺"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "noodle",
      "sauce",
      "scallion"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍜",
    "appliance": "microwave"
  },
  {
    "id": "quick_03",
    "name": "전자레인지 카레밥",
    "names": {
      "en": "Microwave curry rice",
      "ja": "レンジカレーライス"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "rice",
      "curry",
      "carrot",
      "potato"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍛",
    "appliance": "microwave"
  },
  {
    "id": "quick_04",
    "name": "즉석 짜장밥",
    "names": {
      "en": "Instant black-bean rice",
      "ja": "即席ジャージャー飯"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "rice",
      "sauce",
      "onion",
      "pork"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍛",
    "appliance": "microwave"
  },
  {
    "id": "quick_05",
    "name": "냉동 볶음밥",
    "names": {
      "en": "Frozen fried rice",
      "ja": "冷凍チャーハン"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "rice",
      "egg",
      "carrot",
      "scallion"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": "microwave"
  },
  {
    "id": "quick_06",
    "name": "냉동 김치볶음밥",
    "names": {
      "en": "Frozen kimchi rice",
      "ja": "冷凍キムチチャーハン"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "rice",
      "kimchi",
      "ham"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": "microwave"
  },
  {
    "id": "quick_07",
    "name": "냉동 새우볶음밥",
    "names": {
      "en": "Frozen shrimp rice",
      "ja": "冷凍エビチャーハン"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "rice",
      "shrimp",
      "egg"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": "microwave"
  },
  {
    "id": "quick_08",
    "name": "전자레인지 치즈밥",
    "names": {
      "en": "Microwave cheese rice",
      "ja": "レンジチーズご飯"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "rice",
      "cheese",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🧀",
    "appliance": "microwave"
  },
  {
    "id": "quick_09",
    "name": "레토르트 미트볼",
    "names": {
      "en": "Ready-made meatballs",
      "ja": "レトルトミートボール"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "mince",
      "sauce",
      "onion"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍖",
    "appliance": "microwave"
  },
  {
    "id": "quick_10",
    "name": "즉석 수프",
    "names": {
      "en": "Instant soup",
      "ja": "即席スープ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "milk",
      "potato",
      "onion"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": "microwave"
  },
  {
    "id": "quick_11",
    "name": "냉동 만두",
    "names": {
      "en": "Frozen dumplings",
      "ja": "冷凍餃子"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "wrapper",
      "mince",
      "cabbage"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥟",
    "appliance": "microwave"
  },
  {
    "id": "quick_12",
    "name": "냉동 피자",
    "names": {
      "en": "Frozen pizza",
      "ja": "冷凍ピザ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "flour",
      "cheese",
      "tomato"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍕",
    "appliance": "microwave"
  },
  {
    "id": "quick_13",
    "name": "전자레인지 파스타",
    "names": {
      "en": "Microwave pasta",
      "ja": "レンジパスタ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "pasta",
      "tomato",
      "cheese"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍝",
    "appliance": "microwave"
  },
  {
    "id": "quick_14",
    "name": "즉석 우동",
    "names": {
      "en": "Instant udon",
      "ja": "即席うどん"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "noodle",
      "bonito",
      "soysauce"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍜",
    "appliance": "microwave"
  },
  {
    "id": "quick_15",
    "name": "즉석 떡국",
    "names": {
      "en": "Instant rice-cake soup",
      "ja": "即席トック"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "ricecake",
      "egg",
      "seaweed"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": "microwave"
  },
  {
    "id": "quick_16",
    "name": "컵떡볶이",
    "names": {
      "en": "Cup tteokbokki",
      "ja": "カップトッポッキ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "ricecake",
      "gochujang",
      "sugar"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍲",
    "appliance": "microwave"
  },
  {
    "id": "quick_17",
    "name": "즉석 죽",
    "names": {
      "en": "Instant rice porridge",
      "ja": "即席おかゆ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "rice",
      "carrot",
      "egg"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": "microwave"
  },
  {
    "id": "quick_18",
    "name": "고구마 수프",
    "names": {
      "en": "Sweet-potato soup cup",
      "ja": "さつまいもスープ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "sweetpotato",
      "milk"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": "microwave"
  },
  {
    "id": "quick_19",
    "name": "전자레인지 감자",
    "names": {
      "en": "Microwave potato",
      "ja": "レンジじゃがいも"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "potato",
      "butter",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥔",
    "appliance": "microwave"
  },
  {
    "id": "quick_20",
    "name": "전자레인지 고구마",
    "names": {
      "en": "Microwave sweet potato",
      "ja": "レンジさつまいも"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "sweetpotato"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍠",
    "appliance": "microwave"
  },
  {
    "id": "quick_21",
    "name": "햄치즈 토스트",
    "names": {
      "en": "Ham-cheese toast",
      "ja": "ハムチーズトースト"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "bread",
      "ham",
      "cheese"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥪",
    "appliance": ""
  },
  {
    "id": "quick_22",
    "name": "달걀 샌드위치",
    "names": {
      "en": "Egg sandwich",
      "ja": "卵サンド"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "bread",
      "egg",
      "mayo"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥪",
    "appliance": ""
  },
  {
    "id": "quick_23",
    "name": "채소 샌드위치",
    "names": {
      "en": "Vegetable sandwich",
      "ja": "野菜サンド"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "bread",
      "lettuce",
      "tomato",
      "mayo"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥪",
    "appliance": ""
  },
  {
    "id": "quick_24",
    "name": "버터 토스트",
    "names": {
      "en": "Butter toast",
      "ja": "バタートースト"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "bread",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍞",
    "appliance": ""
  },
  {
    "id": "quick_25",
    "name": "꿀 토스트",
    "names": {
      "en": "Honey toast",
      "ja": "蜂蜜トースト"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "bread",
      "honey",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍞",
    "appliance": ""
  },
  {
    "id": "quick_26",
    "name": "치즈 크래커",
    "names": {
      "en": "Cheese crackers",
      "ja": "チーズクラッカー"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "biscuit",
      "cheese"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🧀",
    "appliance": ""
  },
  {
    "id": "quick_27",
    "name": "과일 컵",
    "names": {
      "en": "Fruit cup",
      "ja": "フルーツカップ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "apple",
      "pear",
      "berry"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍎",
    "appliance": ""
  },
  {
    "id": "quick_28",
    "name": "견과류 우유",
    "names": {
      "en": "Nut milk drink",
      "ja": "ナッツミルク"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "nuts",
      "milk",
      "honey"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥛",
    "appliance": ""
  },
  {
    "id": "quick_29",
    "name": "초콜릿 우유",
    "names": {
      "en": "Chocolate milk",
      "ja": "チョコミルク"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "milk",
      "chocolate"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥛",
    "appliance": ""
  },
  {
    "id": "quick_30",
    "name": "냉동 핫도그",
    "names": {
      "en": "Frozen hot dog",
      "ja": "冷凍ホットドッグ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "bread",
      "sausage",
      "ketchup"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🌭",
    "appliance": ""
  },
  {
    "id": "quick_31",
    "name": "소시지 구이",
    "names": {
      "en": "Quick sausages",
      "ja": "簡単ソーセージ焼き"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "sausage",
      "mustard"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🌭",
    "appliance": ""
  },
  {
    "id": "quick_32",
    "name": "연어 주먹밥",
    "names": {
      "en": "Salmon rice ball",
      "ja": "鮭おにぎり"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "rice",
      "salmon",
      "laver"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍙",
    "appliance": ""
  },
  {
    "id": "quick_33",
    "name": "김자반 비빔밥",
    "names": {
      "en": "Seaweed rice bowl",
      "ja": "海苔混ぜご飯"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "rice",
      "laver",
      "sesameoil"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": ""
  },
  {
    "id": "quick_34",
    "name": "간장 달걀밥",
    "names": {
      "en": "Soy-egg rice",
      "ja": "醤油卵ご飯"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "rice",
      "egg",
      "soysauce",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": ""
  },
  {
    "id": "quick_35",
    "name": "두부 샐러드",
    "names": {
      "en": "Tofu salad",
      "ja": "豆腐サラダ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 9,
    "ing": [
      "tofu",
      "lettuce",
      "soysauce"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥗",
    "appliance": ""
  },
  {
    "id": "quick_36",
    "name": "즉석 미소국",
    "names": {
      "en": "Instant miso soup",
      "ja": "即席味噌汁"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 10,
    "ing": [
      "miso",
      "seaweed",
      "tofu"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": ""
  },
  {
    "id": "quick_37",
    "name": "콘밀 머그빵",
    "names": {
      "en": "Cornmeal mug bread",
      "ja": "コーンミールのマグパン"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 5,
    "ing": [
      "cornmeal",
      "milk",
      "egg",
      "bakingpowder"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍞",
    "appliance": "microwave"
  },
  {
    "id": "quick_38",
    "name": "머그 초콜릿 케이크",
    "names": {
      "en": "Mug chocolate cake",
      "ja": "マグチョコケーキ"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 6,
    "ing": [
      "flour",
      "chocolate",
      "milk",
      "egg"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🧁",
    "appliance": "microwave"
  },
  {
    "id": "quick_39",
    "name": "즉석 치즈 리소토",
    "names": {
      "en": "Instant cheese risotto",
      "ja": "即席チーズリゾット"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 7,
    "ing": [
      "rice",
      "cheese",
      "cream"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": ""
  },
  {
    "id": "quick_40",
    "name": "전자레인지 달걀찜",
    "names": {
      "en": "Microwave steamed egg",
      "ja": "レンジ茶碗蒸し"
    },
    "cuisine": "quick",
    "level": 1,
    "min": 8,
    "ing": [
      "egg",
      "scallion",
      "salt"
    ],
    "steps": [
      [
        "prep",
        "포장을 열어 전자레인지용 그릇에 담고 있어요"
      ],
      [
        "cook",
        "전자레인지로 음식을 데우고 있어요"
      ],
      [
        "mix",
        "데운 음식의 온도가 고르게 섞이도록 젓고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥚",
    "appliance": "microwave"
  },
  {
    "id": "gourmet_01",
    "name": "비프 웰링턴",
    "names": {
      "en": "Beef Wellington",
      "ja": "ビーフウェリントン"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 45,
    "ing": [
      "beef",
      "mushroom",
      "flour",
      "butter",
      "egg"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥩",
    "appliance": ""
  },
  {
    "id": "gourmet_02",
    "name": "닭 콩피",
    "names": {
      "en": "Chicken confit",
      "ja": "鶏のコンフィ"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 48,
    "ing": [
      "chicken",
      "oil",
      "herb",
      "garlic"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍗",
    "appliance": ""
  },
  {
    "id": "gourmet_03",
    "name": "연어 파이",
    "names": {
      "en": "Salmon en croûte",
      "ja": "サーモンのパイ包み"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 51,
    "ing": [
      "salmon",
      "spinach",
      "flour",
      "butter",
      "egg"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🐟",
    "appliance": ""
  },
  {
    "id": "gourmet_04",
    "name": "소고기 적포도주 브레이즈",
    "names": {
      "en": "Wine-braised beef",
      "ja": "牛肉の赤ワイン煮"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 54,
    "ing": [
      "beef",
      "wine",
      "carrot",
      "onion",
      "herb"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥩",
    "appliance": ""
  },
  {
    "id": "gourmet_05",
    "name": "허브 크러스트 소고기",
    "names": {
      "en": "Herb-crusted beef",
      "ja": "牛肉のハーブ包み焼き"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 57,
    "ing": [
      "beef",
      "breadcrumb",
      "herb",
      "mustard"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥩",
    "appliance": ""
  },
  {
    "id": "gourmet_06",
    "name": "흰살생선 무슬린",
    "names": {
      "en": "Fish mousseline",
      "ja": "白身魚のムースリーヌ"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 60,
    "ing": [
      "whitefish",
      "cream",
      "egg",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🐟",
    "appliance": ""
  },
  {
    "id": "gourmet_07",
    "name": "새우 비스크",
    "names": {
      "en": "Shrimp bisque",
      "ja": "エビのビスク"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 63,
    "ing": [
      "shrimp",
      "cream",
      "tomato",
      "wine"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🦐",
    "appliance": ""
  },
  {
    "id": "gourmet_08",
    "name": "버섯 라비올리",
    "names": {
      "en": "Mushroom ravioli",
      "ja": "きのこのラビオリ"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 66,
    "ing": [
      "flour",
      "egg",
      "mushroom",
      "hardcheese",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥟",
    "appliance": ""
  },
  {
    "id": "gourmet_09",
    "name": "수제 라자냐",
    "names": {
      "en": "Handmade lasagna",
      "ja": "手打ちラザニア"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 69,
    "ing": [
      "flour",
      "egg",
      "mince",
      "tomato",
      "milk",
      "cheese"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍝",
    "appliance": ""
  },
  {
    "id": "gourmet_10",
    "name": "사프란 해산물 리소토",
    "names": {
      "en": "Saffron seafood risotto",
      "ja": "魚介のサフランリゾット"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 72,
    "ing": [
      "rice",
      "saffron",
      "shrimp",
      "clam",
      "wine"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": ""
  },
  {
    "id": "gourmet_11",
    "name": "겹겹 채소 테린",
    "names": {
      "en": "Vegetable terrine",
      "ja": "野菜のテリーヌ"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 75,
    "ing": [
      "carrot",
      "zucchini",
      "pepper_veg",
      "gelatin"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥗",
    "appliance": ""
  },
  {
    "id": "gourmet_12",
    "name": "연어 타르타르",
    "names": {
      "en": "Salmon tartare",
      "ja": "サーモンのタルタル"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 78,
    "ing": [
      "salmon",
      "lemon",
      "onion",
      "oliveoil"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🐟",
    "appliance": ""
  },
  {
    "id": "gourmet_13",
    "name": "소고기 룰라드",
    "names": {
      "en": "Beef roulade",
      "ja": "牛肉のルーラード"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 81,
    "ing": [
      "beef",
      "mushroom",
      "spinach",
      "bacon",
      "wine"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥩",
    "appliance": ""
  },
  {
    "id": "gourmet_14",
    "name": "허브 닭고기 발로틴",
    "names": {
      "en": "Herbed chicken ballotine",
      "ja": "鶏肉のバロティーヌ"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 84,
    "ing": [
      "chicken",
      "mushroom",
      "cream",
      "herb"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍗",
    "appliance": ""
  },
  {
    "id": "gourmet_15",
    "name": "초콜릿 수플레",
    "names": {
      "en": "Chocolate soufflé",
      "ja": "チョコスフレ"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 87,
    "ing": [
      "chocolate",
      "egg",
      "sugar",
      "butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍫",
    "appliance": ""
  },
  {
    "id": "gourmet_16",
    "name": "밀푀유",
    "names": {
      "en": "Mille-feuille",
      "ja": "ミルフィーユ"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 90,
    "ing": [
      "flour",
      "butter",
      "cream",
      "egg",
      "sugar"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍰",
    "appliance": ""
  },
  {
    "id": "gourmet_17",
    "name": "오페라 케이크",
    "names": {
      "en": "Opera cake",
      "ja": "オペラケーキ"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 93,
    "ing": [
      "almond",
      "flour",
      "egg",
      "chocolate",
      "coffee"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍰",
    "appliance": ""
  },
  {
    "id": "gourmet_18",
    "name": "과일 샤를로트",
    "names": {
      "en": "Fruit charlotte",
      "ja": "フルーツシャルロット"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 96,
    "ing": [
      "biscuit",
      "berry",
      "cream",
      "gelatin"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍰",
    "appliance": ""
  },
  {
    "id": "gourmet_19",
    "name": "크렘 브륄레",
    "names": {
      "en": "Crème brûlée",
      "ja": "クレームブリュレ"
    },
    "cuisine": "gourmet",
    "level": 4,
    "min": 99,
    "ing": [
      "cream",
      "egg",
      "sugar"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍮",
    "appliance": ""
  },
  {
    "id": "gourmet_20",
    "name": "아몬드 마카롱",
    "names": {
      "en": "Almond macarons",
      "ja": "アーモンドマカロン"
    },
    "cuisine": "gourmet",
    "level": 5,
    "min": 102,
    "ing": [
      "almond",
      "egg",
      "sugar",
      "cream"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍪",
    "appliance": ""
  },
  {
    "id": "fantasy_01",
    "name": "달빛 리소토",
    "names": {
      "en": "Moonlight risotto",
      "ja": "月光リゾット"
    },
    "cuisine": "fantasy",
    "level": 2,
    "min": 45,
    "ing": [
      "moon_rice",
      "glow_mushroom",
      "moon_herb",
      "cloud_milk"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍚",
    "appliance": ""
  },
  {
    "id": "fantasy_02",
    "name": "용의 알 오믈렛",
    "names": {
      "en": "Dragon-egg omelette",
      "ja": "竜の卵のオムレツ"
    },
    "cuisine": "fantasy",
    "level": 3,
    "min": 48,
    "ing": [
      "dragon_egg",
      "fairy_butter",
      "ember_pepper"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥚",
    "appliance": ""
  },
  {
    "id": "fantasy_03",
    "name": "불사조 수플레",
    "names": {
      "en": "Phoenix soufflé",
      "ja": "不死鳥のスフレ"
    },
    "cuisine": "fantasy",
    "level": 4,
    "min": 51,
    "ing": [
      "phoenix_egg",
      "star_flour",
      "sun_honey"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🧁",
    "appliance": ""
  },
  {
    "id": "fantasy_04",
    "name": "별빛 만두",
    "names": {
      "en": "Starlight dumplings",
      "ja": "星明かりの餃子"
    },
    "cuisine": "fantasy",
    "level": 5,
    "min": 54,
    "ing": [
      "star_flour",
      "star_shrimp",
      "moon_salt"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥟",
    "appliance": ""
  },
  {
    "id": "fantasy_05",
    "name": "은빛 생선 구이",
    "names": {
      "en": "Silver-fish roast",
      "ja": "銀の魚のロースト"
    },
    "cuisine": "fantasy",
    "level": 2,
    "min": 57,
    "ing": [
      "silver_fish",
      "frost_lemon",
      "moon_herb"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🐟",
    "appliance": ""
  },
  {
    "id": "fantasy_06",
    "name": "용고기 스테이크",
    "names": {
      "en": "Dragon steak",
      "ja": "竜肉ステーキ"
    },
    "cuisine": "fantasy",
    "level": 3,
    "min": 60,
    "ing": [
      "dragon_meat",
      "dragon_spice",
      "fairy_butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥩",
    "appliance": ""
  },
  {
    "id": "fantasy_07",
    "name": "그리핀 파이",
    "names": {
      "en": "Griffin pie",
      "ja": "グリフォンパイ"
    },
    "cuisine": "fantasy",
    "level": 4,
    "min": 63,
    "ing": [
      "griffin_meat",
      "star_flour",
      "cloud_potato"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥧",
    "appliance": ""
  },
  {
    "id": "fantasy_08",
    "name": "빛나는 버섯 수프",
    "names": {
      "en": "Glowing mushroom soup",
      "ja": "光るきのこのスープ"
    },
    "cuisine": "fantasy",
    "level": 5,
    "min": 66,
    "ing": [
      "glow_mushroom",
      "cloud_milk",
      "moon_salt"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": ""
  },
  {
    "id": "fantasy_09",
    "name": "만드라고라 스튜",
    "names": {
      "en": "Mandrake stew",
      "ja": "マンドラゴラシチュー"
    },
    "cuisine": "fantasy",
    "level": 2,
    "min": 69,
    "ing": [
      "mandrake",
      "crystal_carrot",
      "cloud_potato"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍲",
    "appliance": ""
  },
  {
    "id": "fantasy_10",
    "name": "무지개 콩 샐러드",
    "names": {
      "en": "Rainbow bean salad",
      "ja": "虹豆サラダ"
    },
    "cuisine": "fantasy",
    "level": 3,
    "min": 72,
    "ing": [
      "rainbow_bean",
      "crystal_carrot",
      "moon_herb"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥗",
    "appliance": ""
  },
  {
    "id": "fantasy_11",
    "name": "황금 사과 파이",
    "names": {
      "en": "Golden-apple pie",
      "ja": "黄金りんごのパイ"
    },
    "cuisine": "fantasy",
    "level": 4,
    "min": 75,
    "ing": [
      "golden_apple",
      "star_flour",
      "fairy_butter"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥧",
    "appliance": ""
  },
  {
    "id": "fantasy_12",
    "name": "루비 베리 타르트",
    "names": {
      "en": "Ruby-berry tart",
      "ja": "ルビーベリータルト"
    },
    "cuisine": "fantasy",
    "level": 5,
    "min": 78,
    "ing": [
      "ruby_berry",
      "star_flour",
      "crystal_sugar"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍓",
    "appliance": ""
  },
  {
    "id": "fantasy_13",
    "name": "사파이어 젤리",
    "names": {
      "en": "Sapphire jelly",
      "ja": "サファイアゼリー"
    },
    "cuisine": "fantasy",
    "level": 2,
    "min": 81,
    "ing": [
      "sapphire_grape",
      "sea_pearl",
      "gelatin"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍮",
    "appliance": ""
  },
  {
    "id": "fantasy_14",
    "name": "꿈복숭아 파르페",
    "names": {
      "en": "Dream-peach parfait",
      "ja": "夢桃パフェ"
    },
    "cuisine": "fantasy",
    "level": 3,
    "min": 84,
    "ing": [
      "dream_peach",
      "cloud_milk",
      "flower_nectar"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍨",
    "appliance": ""
  },
  {
    "id": "fantasy_15",
    "name": "서리 레몬 셔벗",
    "names": {
      "en": "Frost-lemon sorbet",
      "ja": "霜レモンシャーベット"
    },
    "cuisine": "fantasy",
    "level": 4,
    "min": 87,
    "ing": [
      "frost_lemon",
      "crystal_sugar",
      "flower_nectar"
    ],
    "steps": [
      [
        "prep",
        "재료를 꺼내 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 함께 섞어 맛을 맞추고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍧",
    "appliance": ""
  },
  {
    "id": "fantasy_16",
    "name": "구름 팬케이크",
    "names": {
      "en": "Cloud pancakes",
      "ja": "雲パンケーキ"
    },
    "cuisine": "fantasy",
    "level": 5,
    "min": 90,
    "ing": [
      "cloud_milk",
      "phoenix_egg",
      "star_flour",
      "sun_honey"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥞",
    "appliance": ""
  },
  {
    "id": "fantasy_17",
    "name": "마법 초콜릿 케이크",
    "names": {
      "en": "Magic chocolate cake",
      "ja": "魔法チョコケーキ"
    },
    "cuisine": "fantasy",
    "level": 2,
    "min": 93,
    "ing": [
      "magic_cacao",
      "star_flour",
      "dragon_egg",
      "crystal_sugar"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 굽고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍰",
    "appliance": ""
  },
  {
    "id": "fantasy_18",
    "name": "별빛 밀크티",
    "names": {
      "en": "Starlight milk tea",
      "ja": "星明かりのミルクティー"
    },
    "cuisine": "fantasy",
    "level": 3,
    "min": 96,
    "ing": [
      "starlight_tea",
      "cloud_milk",
      "sun_honey"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 끓이고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍵",
    "appliance": ""
  },
  {
    "id": "fantasy_19",
    "name": "정령꽃 푸딩",
    "names": {
      "en": "Spirit-flower pudding",
      "ja": "精霊花プリン"
    },
    "cuisine": "fantasy",
    "level": 4,
    "min": 99,
    "ing": [
      "flower_nectar",
      "cloud_milk",
      "phoenix_egg"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🍮",
    "appliance": ""
  },
  {
    "id": "fantasy_20",
    "name": "바다 진주 크림찜",
    "names": {
      "en": "Sea-pearl cream bowl",
      "ja": "海の真珠のクリーム蒸し"
    },
    "cuisine": "fantasy",
    "level": 5,
    "min": 102,
    "ing": [
      "sea_pearl",
      "star_shrimp",
      "cloud_milk",
      "moon_salt"
    ],
    "steps": [
      [
        "prep",
        "요리에 쓸 재료를 준비하고 있어요"
      ],
      [
        "cut",
        "재료를 먹기 좋게 손질하고 있어요"
      ],
      [
        "mix",
        "재료를 섞어 맛을 맞추고 있어요"
      ],
      [
        "cook",
        "불을 조절하며 요리를 익히고 있어요"
      ],
      [
        "plate",
        "완성한 요리를 그릇에 담고 있어요"
      ]
    ],
    "icon": "🥣",
    "appliance": ""
  }
];
// Game balance in multiples of the village's standard meal, per serving.
// Premium dishes have their own ingredient/labor budgets rather than a level-only price.
const GOURMET_PRICES={
 gourmet_01:[5.5,11],gourmet_02:[2.4,6],gourmet_03:[3.2,7.5],gourmet_04:[4.5,9.5],
 gourmet_05:[5,10.5],gourmet_06:[3.6,9],gourmet_07:[3.2,8],gourmet_08:[2.8,7],
 gourmet_09:[2.2,5.5],gourmet_10:[4.8,11],gourmet_11:[1.8,5],gourmet_12:[3.8,9],
 gourmet_13:[4.5,9.5],gourmet_14:[3.2,8],gourmet_15:[1.4,3.8],gourmet_16:[2,5],
 gourmet_17:[2.8,7],gourmet_18:[2.2,5.5],gourmet_19:[1.2,3],gourmet_20:[1.6,4]
};
export function recipeCost(recipe,prices={}){
 const ingredients=recipe.ing.reduce((sum,id)=>{const value=prices[id]??INGREDIENT_BY_ID[id]?.price??0;return sum+(Number.isFinite(Number(value))&&Number(value)>=0?Number(value):0)},0);
 const premium=GOURMET_PRICES[recipe.id],home=Math.max(ingredients,premium?.[0]??(recipe.cuisine==='convenience'?0:.35+recipe.level*.1));
 const out=premium?premium[1]+Math.max(0,home-premium[0])*2:home*2+recipe.level*recipe.level*.05;
 return {home:Math.min(11,Math.round(home*100)/100),out:Math.min(11,Math.round(out*100)/100)};
}
for(const recipe of RECIPES)recipe.cost=recipeCost(recipe);
