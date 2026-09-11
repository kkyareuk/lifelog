// Native sign-in uses the Capacitor credential bridge, never a web popup.
// Retain both persistence stores so existing sessions remain discoverable.
export function bootstrapAuth(app,native,{initializeAuth,getAuth,indexedDBLocalPersistence,browserLocalPersistence}){
 return native?initializeAuth(app,{persistence:[indexedDBLocalPersistence,browserLocalPersistence]}):getAuth(app);
}
