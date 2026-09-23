// Fictional game balance: one salary unit equals one ordinary restaurant meal.
export const BUILTIN_CAREERS = [
  {
    "id": "builtin-none",
    "name": "무직",
    "names": {
      "en": "Unemployed",
      "ja": "無職"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "미취업",
        "names": {
          "en": "Unemployed",
          "ja": "未就業"
        },
        "salaryMeals": 0,
        "duties": []
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-student",
    "name": "학생",
    "names": {
      "en": "Student",
      "ja": "学生"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "재학생",
        "names": {
          "en": "Student",
          "ja": "在学生"
        },
        "salaryMeals": 0,
        "duties": []
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-office",
    "name": "회사원",
    "names": {
      "en": "Office worker",
      "ja": "会社員"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "사원",
        "names": {
          "en": "Staff",
          "ja": "社員"
        },
        "salaryMeals": 250,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "대리",
        "names": {
          "en": "Assistant manager",
          "ja": "主任"
        },
        "salaryMeals": 330,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "과장",
        "names": {
          "en": "Manager",
          "ja": "課長"
        },
        "salaryMeals": 430,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "차장",
        "names": {
          "en": "Deputy head",
          "ja": "次長"
        },
        "salaryMeals": 550,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-5",
        "name": "부장",
        "names": {
          "en": "Department head",
          "ja": "部長"
        },
        "salaryMeals": 700,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "기획부",
      "인사부",
      "재무부",
      "개발부",
      "영업부",
      "홍보부"
    ]
  },
  {
    "id": "builtin-ceo",
    "name": "CEO",
    "names": {
      "en": "CEO",
      "ja": "CEO"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "소규모 대표",
        "names": {
          "en": "Small business CEO",
          "ja": "小規模企業代表"
        },
        "salaryMeals": 600,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "중견기업 대표",
        "names": {
          "en": "Mid-size CEO",
          "ja": "中堅企業代表"
        },
        "salaryMeals": 1200,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "대기업 대표",
        "names": {
          "en": "Large company CEO",
          "ja": "大企業代表"
        },
        "salaryMeals": 2400,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-doctor",
    "name": "의사",
    "names": {
      "en": "Doctor",
      "ja": "医師"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "인턴",
        "names": {
          "en": "Intern",
          "ja": "研修医"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "진료 기록 확인",
            "description": "환자의 기록을 살피며 다음 진료를 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Reviewing patient records",
                "description": "They are reviewing patient records for the next consultation."
              },
              "ja": {
                "name": "診療記録の確認",
                "description": "患者の記録を確認し、次の診察を準備しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "레지던트",
        "names": {
          "en": "Resident",
          "ja": "専攻医"
        },
        "salaryMeals": 420,
        "duties": [
          {
            "name": "진료 기록 확인",
            "description": "환자의 기록을 살피며 다음 진료를 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Reviewing patient records",
                "description": "They are reviewing patient records for the next consultation."
              },
              "ja": {
                "name": "診療記録の確認",
                "description": "患者の記録を確認し、次の診察を準備しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "전문의",
        "names": {
          "en": "Specialist",
          "ja": "専門医"
        },
        "salaryMeals": 850,
        "duties": [
          {
            "name": "진료 기록 확인",
            "description": "환자의 기록을 살피며 다음 진료를 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Reviewing patient records",
                "description": "They are reviewing patient records for the next consultation."
              },
              "ja": {
                "name": "診療記録の確認",
                "description": "患者の記録を確認し、次の診察を準備しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "진료과장",
        "names": {
          "en": "Department chief",
          "ja": "診療科長"
        },
        "salaryMeals": 1200,
        "duties": [
          {
            "name": "진료 기록 확인",
            "description": "환자의 기록을 살피며 다음 진료를 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Reviewing patient records",
                "description": "They are reviewing patient records for the next consultation."
              },
              "ja": {
                "name": "診療記録の確認",
                "description": "患者の記録を確認し、次の診察を準備しています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "내과",
      "외과",
      "정형외과",
      "소아청소년과",
      "산부인과",
      "정신건강의학과",
      "응급의학과",
      "신경과",
      "피부과",
      "안과",
      "이비인후과",
      "영상의학과"
    ]
  },
  {
    "id": "builtin-nurse",
    "name": "간호사",
    "names": {
      "en": "Nurse",
      "ja": "看護師"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "신규 간호사",
        "names": {
          "en": "Junior nurse",
          "ja": "新人看護師"
        },
        "salaryMeals": 250,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "일반 간호사",
        "names": {
          "en": "Nurse",
          "ja": "看護師"
        },
        "salaryMeals": 330,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "책임 간호사",
        "names": {
          "en": "Senior nurse",
          "ja": "主任看護師"
        },
        "salaryMeals": 420,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "수간호사",
        "names": {
          "en": "Head nurse",
          "ja": "看護師長"
        },
        "salaryMeals": 520,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "병동",
      "외래",
      "응급실",
      "수술실",
      "중환자실"
    ]
  },
  {
    "id": "builtin-teacher",
    "name": "교사",
    "names": {
      "en": "Teacher",
      "ja": "教師"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "신임 교사",
        "names": {
          "en": "New teacher",
          "ja": "新任教員"
        },
        "salaryMeals": 260,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "교사",
        "names": {
          "en": "Teacher",
          "ja": "教員"
        },
        "salaryMeals": 330,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "부장 교사",
        "names": {
          "en": "Lead teacher",
          "ja": "主任教員"
        },
        "salaryMeals": 420,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "교감",
        "names": {
          "en": "Vice principal",
          "ja": "教頭"
        },
        "salaryMeals": 530,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-5",
        "name": "교장",
        "names": {
          "en": "Principal",
          "ja": "校長"
        },
        "salaryMeals": 650,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-professor",
    "name": "교수",
    "names": {
      "en": "Professor",
      "ja": "教授"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "강사",
        "names": {
          "en": "Lecturer",
          "ja": "講師"
        },
        "salaryMeals": 280,
        "duties": [
          {
            "name": "강의 준비",
            "description": "강의 자료를 검토하고 학생들과 나눌 질문을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a lecture",
                "description": "They are reviewing lecture materials and questions for their students."
              },
              "ja": {
                "name": "講義の準備",
                "description": "講義資料を確認し、学生と話す質問をまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "조교수",
        "names": {
          "en": "Assistant professor",
          "ja": "助教"
        },
        "salaryMeals": 450,
        "duties": [
          {
            "name": "강의 준비",
            "description": "강의 자료를 검토하고 학생들과 나눌 질문을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a lecture",
                "description": "They are reviewing lecture materials and questions for their students."
              },
              "ja": {
                "name": "講義の準備",
                "description": "講義資料を確認し、学生と話す質問をまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "부교수",
        "names": {
          "en": "Associate professor",
          "ja": "准教授"
        },
        "salaryMeals": 600,
        "duties": [
          {
            "name": "강의 준비",
            "description": "강의 자료를 검토하고 학생들과 나눌 질문을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a lecture",
                "description": "They are reviewing lecture materials and questions for their students."
              },
              "ja": {
                "name": "講義の準備",
                "description": "講義資料を確認し、学生と話す質問をまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "정교수",
        "names": {
          "en": "Professor",
          "ja": "教授"
        },
        "salaryMeals": 800,
        "duties": [
          {
            "name": "강의 준비",
            "description": "강의 자료를 검토하고 학생들과 나눌 질문을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a lecture",
                "description": "They are reviewing lecture materials and questions for their students."
              },
              "ja": {
                "name": "講義の準備",
                "description": "講義資料を確認し、学生と話す質問をまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "인문대학",
      "사회과학대학",
      "자연과학대학",
      "공과대학",
      "의과대학",
      "예술대학"
    ]
  },
  {
    "id": "builtin-politician",
    "name": "정치인",
    "names": {
      "en": "Politician",
      "ja": "政治家"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "지역 정치인",
        "names": {
          "en": "Local politician",
          "ja": "地域政治家"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "지방의원",
        "names": {
          "en": "Local councillor",
          "ja": "地方議員"
        },
        "salaryMeals": 450,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "국회의원",
        "names": {
          "en": "Legislator",
          "ja": "国会議員"
        },
        "salaryMeals": 800,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "정부 고위직",
        "names": {
          "en": "Senior official",
          "ja": "政府高官"
        },
        "salaryMeals": 1200,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-reporter",
    "name": "기자",
    "names": {
      "en": "Journalist",
      "ja": "記者"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "수습 기자",
        "names": {
          "en": "Trainee reporter",
          "ja": "見習い記者"
        },
        "salaryMeals": 230,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "기자",
        "names": {
          "en": "Reporter",
          "ja": "記者"
        },
        "salaryMeals": 330,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "선임 기자",
        "names": {
          "en": "Senior reporter",
          "ja": "上級記者"
        },
        "salaryMeals": 470,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "편집장",
        "names": {
          "en": "Editor-in-chief",
          "ja": "編集長"
        },
        "salaryMeals": 650,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-chef",
    "name": "요리사",
    "names": {
      "en": "Chef",
      "ja": "料理人"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "조리 보조",
        "names": {
          "en": "Kitchen assistant",
          "ja": "調理補助"
        },
        "salaryMeals": 220,
        "duties": [
          {
            "name": "조리 준비",
            "description": "주문에 맞춰 식재료를 손질하고 조리 순서를 정하고 있어요.",
            "copy": {
              "en": {
                "name": "Kitchen preparation",
                "description": "They are preparing ingredients and organizing the cooking order."
              },
              "ja": {
                "name": "調理の準備",
                "description": "注文に合わせて食材を下ごしらえし、調理の順番を決めています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "조리사",
        "names": {
          "en": "Cook",
          "ja": "調理師"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "조리 준비",
            "description": "주문에 맞춰 식재료를 손질하고 조리 순서를 정하고 있어요.",
            "copy": {
              "en": {
                "name": "Kitchen preparation",
                "description": "They are preparing ingredients and organizing the cooking order."
              },
              "ja": {
                "name": "調理の準備",
                "description": "注文に合わせて食材を下ごしらえし、調理の順番を決めています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "부주방장",
        "names": {
          "en": "Sous-chef",
          "ja": "副料理長"
        },
        "salaryMeals": 430,
        "duties": [
          {
            "name": "조리 준비",
            "description": "주문에 맞춰 식재료를 손질하고 조리 순서를 정하고 있어요.",
            "copy": {
              "en": {
                "name": "Kitchen preparation",
                "description": "They are preparing ingredients and organizing the cooking order."
              },
              "ja": {
                "name": "調理の準備",
                "description": "注文に合わせて食材を下ごしらえし、調理の順番を決めています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "주방장",
        "names": {
          "en": "Head chef",
          "ja": "料理長"
        },
        "salaryMeals": 600,
        "duties": [
          {
            "name": "조리 준비",
            "description": "주문에 맞춰 식재료를 손질하고 조리 순서를 정하고 있어요.",
            "copy": {
              "en": {
                "name": "Kitchen preparation",
                "description": "They are preparing ingredients and organizing the cooking order."
              },
              "ja": {
                "name": "調理の準備",
                "description": "注文に合わせて食材を下ごしらえし、調理の順番を決めています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-programmer",
    "name": "프로그래머",
    "names": {
      "en": "Programmer",
      "ja": "プログラマー"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "주니어",
        "names": {
          "en": "Junior",
          "ja": "ジュニア"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "중급 개발자",
        "names": {
          "en": "Developer",
          "ja": "中級開発者"
        },
        "salaryMeals": 430,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "시니어",
        "names": {
          "en": "Senior",
          "ja": "シニア"
        },
        "salaryMeals": 620,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "기술 책임자",
        "names": {
          "en": "Technical lead",
          "ja": "技術責任者"
        },
        "salaryMeals": 900,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-researcher",
    "name": "연구원",
    "names": {
      "en": "Researcher",
      "ja": "研究員"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "연구 보조",
        "names": {
          "en": "Research assistant",
          "ja": "研究補助"
        },
        "salaryMeals": 250,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "연구원",
        "names": {
          "en": "Researcher",
          "ja": "研究員"
        },
        "salaryMeals": 360,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "선임 연구원",
        "names": {
          "en": "Senior researcher",
          "ja": "主任研究員"
        },
        "salaryMeals": 500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "책임 연구원",
        "names": {
          "en": "Principal researcher",
          "ja": "主席研究員"
        },
        "salaryMeals": 700,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "기초연구",
      "응용연구",
      "개발연구"
    ]
  },
  {
    "id": "builtin-singer",
    "name": "가수",
    "names": {
      "en": "Singer",
      "ja": "歌手"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "신인",
        "names": {
          "en": "Newcomer",
          "ja": "新人"
        },
        "salaryMeals": 180,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "활동 가수",
        "names": {
          "en": "Working singer",
          "ja": "活動中の歌手"
        },
        "salaryMeals": 350,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "인기 가수",
        "names": {
          "en": "Popular singer",
          "ja": "人気歌手"
        },
        "salaryMeals": 700,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "정상급 가수",
        "names": {
          "en": "Top singer",
          "ja": "トップ歌手"
        },
        "salaryMeals": 1500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-idol",
    "name": "아이돌",
    "names": {
      "en": "Idol",
      "ja": "アイドル"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "연습생",
        "names": {
          "en": "Trainee",
          "ja": "練習生"
        },
        "salaryMeals": 80,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "신인",
        "names": {
          "en": "Newcomer",
          "ja": "新人"
        },
        "salaryMeals": 200,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "활동 아이돌",
        "names": {
          "en": "Working idol",
          "ja": "活動中のアイドル"
        },
        "salaryMeals": 500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "정상급 아이돌",
        "names": {
          "en": "Top idol",
          "ja": "トップアイドル"
        },
        "salaryMeals": 1200,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-artist",
    "name": "예술가",
    "names": {
      "en": "Artist",
      "ja": "芸術家"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "신진 작가",
        "names": {
          "en": "Emerging artist",
          "ja": "新人作家"
        },
        "salaryMeals": 180,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "활동 작가",
        "names": {
          "en": "Working artist",
          "ja": "活動中の作家"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "중견 작가",
        "names": {
          "en": "Established artist",
          "ja": "中堅作家"
        },
        "salaryMeals": 500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "거장",
        "names": {
          "en": "Master artist",
          "ja": "巨匠"
        },
        "salaryMeals": 1000,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-pirate",
    "name": "해적",
    "names": {
      "en": "Pirate",
      "ja": "海賊"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "선원",
        "names": {
          "en": "Crew",
          "ja": "船員"
        },
        "salaryMeals": 220,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "갑판장",
        "names": {
          "en": "Boatswain",
          "ja": "甲板長"
        },
        "salaryMeals": 350,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "일등 항해사",
        "names": {
          "en": "First mate",
          "ja": "一等航海士"
        },
        "salaryMeals": 500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "선장",
        "names": {
          "en": "Captain",
          "ja": "船長"
        },
        "salaryMeals": 800,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-soldier",
    "name": "군인",
    "names": {
      "en": "Soldier",
      "ja": "軍人"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "병사",
        "names": {
          "en": "Soldier",
          "ja": "兵士"
        },
        "salaryMeals": 120,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "하사",
        "names": {
          "en": "Staff sergeant",
          "ja": "三等軍曹"
        },
        "salaryMeals": 240,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "중사",
        "names": {
          "en": "Sergeant first class",
          "ja": "二等軍曹"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "상사",
        "names": {
          "en": "Master sergeant",
          "ja": "一等軍曹"
        },
        "salaryMeals": 380,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-5",
        "name": "원사",
        "names": {
          "en": "Sergeant major",
          "ja": "上級曹長"
        },
        "salaryMeals": 480,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-6",
        "name": "소위",
        "names": {
          "en": "Second lieutenant",
          "ja": "少尉"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-7",
        "name": "중위",
        "names": {
          "en": "First lieutenant",
          "ja": "中尉"
        },
        "salaryMeals": 350,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-8",
        "name": "대위",
        "names": {
          "en": "Captain",
          "ja": "大尉"
        },
        "salaryMeals": 420,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-9",
        "name": "소령",
        "names": {
          "en": "Major",
          "ja": "少佐"
        },
        "salaryMeals": 520,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-10",
        "name": "중령",
        "names": {
          "en": "Lieutenant colonel",
          "ja": "中佐"
        },
        "salaryMeals": 620,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-11",
        "name": "대령",
        "names": {
          "en": "Colonel",
          "ja": "大佐"
        },
        "salaryMeals": 740,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-12",
        "name": "준장",
        "names": {
          "en": "Brigadier general",
          "ja": "准将"
        },
        "salaryMeals": 900,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-13",
        "name": "소장",
        "names": {
          "en": "Major general",
          "ja": "少将"
        },
        "salaryMeals": 1100,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-14",
        "name": "중장",
        "names": {
          "en": "Lieutenant general",
          "ja": "中将"
        },
        "salaryMeals": 1300,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-15",
        "name": "대장",
        "names": {
          "en": "General",
          "ja": "大将"
        },
        "salaryMeals": 1500,
        "duties": [
          {
            "name": "훈련 준비",
            "description": "배정된 훈련의 일정과 장비를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for training",
                "description": "They are checking their assigned training schedule and equipment."
              },
              "ja": {
                "name": "訓練の準備",
                "description": "割り当てられた訓練の予定と装備を確認しています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "육군",
      "해군",
      "공군",
      "해병대"
    ]
  },
  {
    "id": "builtin-criminal",
    "name": "범죄자",
    "names": {
      "en": "Criminal",
      "ja": "犯罪者"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "말단",
        "names": {
          "en": "Low-ranking member",
          "ja": "下っ端"
        },
        "salaryMeals": 180,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "조직원",
        "names": {
          "en": "Member",
          "ja": "構成員"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "간부",
        "names": {
          "en": "Senior member",
          "ja": "幹部"
        },
        "salaryMeals": 500,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "우두머리",
        "names": {
          "en": "Leader",
          "ja": "首領"
        },
        "salaryMeals": 900,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-sanitation",
    "name": "환경미화원",
    "names": {
      "en": "Sanitation worker",
      "ja": "清掃員"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "신입",
        "names": {
          "en": "New worker",
          "ja": "新人"
        },
        "salaryMeals": 230,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "환경미화원",
        "names": {
          "en": "Sanitation worker",
          "ja": "清掃員"
        },
        "salaryMeals": 300,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "조장",
        "names": {
          "en": "Team leader",
          "ja": "班長"
        },
        "salaryMeals": 380,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-4",
        "name": "현장 책임자",
        "names": {
          "en": "Site supervisor",
          "ja": "現場責任者"
        },
        "salaryMeals": 470,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-innkeeper",
    "name": "여관주인",
    "names": {
      "en": "Innkeeper",
      "ja": "宿屋の主人"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "작은 여관 운영",
        "names": {
          "en": "Small inn",
          "ja": "小さな宿の経営"
        },
        "salaryMeals": 250,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "여관 운영",
        "names": {
          "en": "Inn operator",
          "ja": "宿の経営"
        },
        "salaryMeals": 400,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "대형 여관 운영",
        "names": {
          "en": "Large inn",
          "ja": "大きな宿の経営"
        },
        "salaryMeals": 650,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-self-employed",
    "name": "자영업·직접 입력",
    "names": {
      "en": "Self-employed / custom",
      "ja": "自営業・自由入力"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "시작 단계",
        "names": {
          "en": "Starting out",
          "ja": "開業初期"
        },
        "salaryMeals": 200,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "안정 단계",
        "names": {
          "en": "Established",
          "ja": "安定期"
        },
        "salaryMeals": 350,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "확장 단계",
        "names": {
          "en": "Expanding",
          "ja": "拡大期"
        },
        "salaryMeals": 600,
        "duties": [
          {
            "name": "업무 준비",
            "description": "오늘 맡은 일의 순서와 필요한 자료를 확인하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing for work",
                "description": "They are checking today’s tasks and the materials they need."
              },
              "ja": {
                "name": "仕事の準備",
                "description": "今日の業務の順序と必要な資料を確認しています。"
              }
            }
          },
          {
            "name": "업무 기록 정리",
            "description": "처리한 내용을 기록하고 다음에 할 일을 정리하고 있어요.",
            "copy": {
              "en": {
                "name": "Organizing work records",
                "description": "They are recording completed tasks and planning what comes next."
              },
              "ja": {
                "name": "業務記録の整理",
                "description": "終えた仕事を記録し、次にすることをまとめています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": []
  },
  {
    "id": "builtin-religious",
    "name": "종교인",
    "names": {
      "en": "Religious worker",
      "ja": "宗教者"
    },
    "payDay": 25,
    "ranks": [
      {
        "id": "rank-1",
        "name": "수습 종교인",
        "names": {
          "en": "Trainee",
          "ja": "見習い"
        },
        "salaryMeals": 180,
        "duties": [
          {
            "name": "공동체 상담",
            "description": "찾아온 사람의 이야기를 듣고 필요한 도움을 함께 살피고 있어요.",
            "copy": {
              "en": {
                "name": "Community support",
                "description": "They are listening to a visitor and considering how to help."
              },
              "ja": {
                "name": "共同体の相談",
                "description": "訪れた人の話を聞き、必要な支援を考えています。"
              }
            }
          },
          {
            "name": "의식 준비",
            "description": "기도와 의식에 필요한 공간과 물품을 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a ceremony",
                "description": "They are preparing the space and supplies for prayer and ceremony."
              },
              "ja": {
                "name": "儀式の準備",
                "description": "祈りや儀式のための場所と道具を準備しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-2",
        "name": "종교인",
        "names": {
          "en": "Religious worker",
          "ja": "宗教者"
        },
        "salaryMeals": 280,
        "duties": [
          {
            "name": "공동체 상담",
            "description": "찾아온 사람의 이야기를 듣고 필요한 도움을 함께 살피고 있어요.",
            "copy": {
              "en": {
                "name": "Community support",
                "description": "They are listening to a visitor and considering how to help."
              },
              "ja": {
                "name": "共同体の相談",
                "description": "訪れた人の話を聞き、必要な支援を考えています。"
              }
            }
          },
          {
            "name": "의식 준비",
            "description": "기도와 의식에 필요한 공간과 물품을 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a ceremony",
                "description": "They are preparing the space and supplies for prayer and ceremony."
              },
              "ja": {
                "name": "儀式の準備",
                "description": "祈りや儀式のための場所と道具を準備しています。"
              }
            }
          }
        ]
      },
      {
        "id": "rank-3",
        "name": "지도 종교인",
        "names": {
          "en": "Senior religious worker",
          "ja": "指導的宗教者"
        },
        "salaryMeals": 420,
        "duties": [
          {
            "name": "공동체 상담",
            "description": "찾아온 사람의 이야기를 듣고 필요한 도움을 함께 살피고 있어요.",
            "copy": {
              "en": {
                "name": "Community support",
                "description": "They are listening to a visitor and considering how to help."
              },
              "ja": {
                "name": "共同体の相談",
                "description": "訪れた人の話を聞き、必要な支援を考えています。"
              }
            }
          },
          {
            "name": "의식 준비",
            "description": "기도와 의식에 필요한 공간과 물품을 준비하고 있어요.",
            "copy": {
              "en": {
                "name": "Preparing a ceremony",
                "description": "They are preparing the space and supplies for prayer and ceremony."
              },
              "ja": {
                "name": "儀式の準備",
                "description": "祈りや儀式のための場所と道具を準備しています。"
              }
            }
          }
        ]
      }
    ],
    "builtin": true,
    "departments": [
      "의식·예배",
      "교육",
      "상담",
      "봉사"
    ]
  }
];
export const careerLabel=(entry,language="ko")=>entry?.names?.[language]||entry?.name||"";

// CEO is part of the corporate career; retained rank IDs preserve existing contracts.
const corporate=BUILTIN_CAREERS.find(j=>j.id==='builtin-office'),ceo=BUILTIN_CAREERS.find(j=>j.id==='builtin-ceo');
corporate.ranks.push(...[['director','이사','Director','取締役',850],['executive','상무','Executive director','常務',1000],['senior-executive','전무','Senior executive director','専務',1200],['vice-president','부사장','Vice president','副社長',1500]].map(([id,name,en,ja,salaryMeals])=>({id,name,names:{en,ja},salaryMeals,duties:structuredClone(corporate.ranks.at(-1).duties)})),...ceo.ranks.map(r=>({...r,id:'ceo-'+r.id})));
BUILTIN_CAREERS.splice(BUILTIN_CAREERS.indexOf(ceo),1);
