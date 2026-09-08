export const TOUCH_REACTIONS=["상황에 따라 자연스럽게 받아들임", "촉각에 둔감한 편", "간지럼을 잘 탐", "갑작스러운 접촉에 쉽게 놀람", "친한 사람 외의 기척에는 경계함", "몸에 손이 닿는 것을 극도로 꺼림", "몸에 손이 닿는 것을 싫어함", "허락 없는 접촉은 불편함", "가까운 사람에게만 허용함", "신체 접촉을 좋아함", "먼저 다가가는 편"];
export const touchReactions=value=>[...new Set((Array.isArray(value)?value:typeof value==="string"?[value]:[]).filter(value=>typeof value==="string"&&value.trim()))];
