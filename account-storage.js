// A device can host several accounts. Guest/legacy saves remain separate and
// are never adopted or merged merely because somebody signs in.
export function createAccountStorage(storage){
  const marker="drawer-village-active-data-owner-v1";
  let scope=storage?.getItem(marker)||"guest";
  const key=name=>scope==="guest"?name:`drawer-account:${encodeURIComponent(scope)}:${name}`;
  return {
    get scope(){return scope},
    getItem:name=>storage.getItem(key(name)),
    setItem:(name,value)=>storage.setItem(key(name),value),
    removeItem:name=>storage.removeItem(key(name)),
    switchScope(uid){
      const next=String(uid||"guest");
      if(next===scope)return false;
      storage.setItem(marker,next);scope=next;return true;
    }
  };
}
export const accountStorage=createAccountStorage(globalThis.localStorage);
