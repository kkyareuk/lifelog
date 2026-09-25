export function economyAvailable(){
 return globalThis.window?.DRAWER_VILLAGE_ECONOMY_ENABLED===true;
}

export function careerAvailable(){
 return economyAvailable()&&globalThis.window?.DRAWER_VILLAGE_CAREER_ENABLED!==false;
}

export function buildingInteriorsAvailable(){
 return globalThis.window?.DRAWER_VILLAGE_BUILDING_INTERIORS_ENABLED!==false;
}
