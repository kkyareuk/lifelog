// Shared display choices for cooking cards and current activity text.
export function recipeIcon(recipe){
 if(recipe.icon)return recipe.icon;
 const name=recipe.name;
 for(const [pattern,icon] of [[/국|탕|찌개|수프|포타주|죽/,'🥣'],[/밥|리소토|초밥/,'🍚'],[/면|파스타|우동|라멘/,'🍜'],[/피자/,'🍕'],[/빵|프렌치|토스트/,'🍞'],[/파이|타르트/,'🥧'],[/케이크|티라미수/,'🍰'],[/샐러드|나물/,'🥗'],[/만두|라비올리/,'🥟'],[/생선|연어|장어/,'🐟'],[/닭|치킨/,'🍗'],[/스테이크|고기|커틀릿/,'🥩'],[/달걀|계란|오믈렛/,'🥚']])if(pattern.test(name))return icon;
 return recipe.cuisine==='medieval'?'🍲':'🍽️';
}
export function cookingMotion([kind,description='']){
 if(/전자레인지/.test(description))return 'microwave';
 if(/식히|냉장|차갑|굳히/.test(description))return 'cool';
 if(/기다|발효|불리|해감|재우/.test(description))return 'rest';
 if(kind==='plate')return 'plate';
 if(kind==='cut')return /빻|갈/.test(description)?'grind':'cut';
 if(/반죽/.test(description))return 'knead';
 if(/저어|젓고/.test(description))return 'stir';
 if(kind==='mix')return 'mix';
 if(/튀기/.test(description))return 'fry';
 if(/볶|지지|지진/.test(description))return 'saute';
 if(/굽|구워|구우/.test(description))return 'bake';
 if(/끓|삶|데치|졸이|조리/.test(description))return 'boil';
 if(/찌고|쪄|익히/.test(description)||kind==='cook')return 'cook';
 if(/붓|넣/.test(description))return 'add';
 return 'prep';
}
