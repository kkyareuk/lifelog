let pending=Promise.resolve();
// Resizing the native WebView also resizes dvh and fixed-position controls.
// Translating #app alone cannot provide that coordinate system.
export function reserveAdViewport(height,message=''){
 const viewport=window.Capacitor?.Plugins?.AdViewport;
 document.documentElement.classList.toggle('native-ad-viewport',Boolean(viewport));
 if(!viewport)return;
 pending=pending.catch(()=>{}).then(()=>viewport.reserve({height,message}));
}
