const isNative=Boolean(window.Capacitor?.isNativePlatform?.());
if(isNative){
  document.documentElement.classList.add("native-app");
  window.DRAWER_VILLAGE_NATIVE=true;

  const {App,Browser,Network}=window.Capacitor.Plugins;

  App.addListener("backButton",({canGoBack})=>{
    const opened=document.querySelector("dialog[open]");
    if(opened){opened.close();return}
    const backToMain=document.querySelector(".native-sub-header [data-tab='observe']");
    if(backToMain){backToMain.click();return}
    if(canGoBack)history.back();
    else App.minimizeApp();
  });

  const showNetworkState=connected=>{
    let banner=document.querySelector("#native-network-banner");
    if(connected){banner?.remove();return}
    if(!banner){
      banner=document.createElement("div");
      banner.id="native-network-banner";
      banner.textContent="인터넷 연결이 끊겼어요. 기기에 저장된 내용은 계속 볼 수 있고, 계정 동기화는 연결 후 다시 진행됩니다.";
      document.body.prepend(banner);
    }
  };
  showNetworkState((await Network.getStatus()).connected);
  Network.addListener("networkStatusChange",status=>showNetworkState(status.connected));

  document.addEventListener("click",event=>{
    const link=event.target.closest("a[target='_blank']");
    if(!link?.href)return;
    const url=new URL(link.href,location.href);
    if(url.origin===location.origin)return;
    event.preventDefault();
    Browser.open({url:url.href,presentationStyle:"popover"});
  });
}
