const isNative=Boolean(window.Capacitor?.isNativePlatform?.());

if(isNative){
  document.documentElement.classList.add("native-app");
  window.DRAWER_VILLAGE_NATIVE=true;

  const {App,Browser,Network,PlayBilling}=window.Capacitor.Plugins;
  const playConfig=()=>window.PARALLEL_CITY_CONFIG?.playBilling||{};
  const productIds=()=>Object.values(playConfig().products||{}).filter(Boolean);
  const consumableProducts=new Set(["character_slots_5","town_slot_1","green_tea"]);

  const requireBilling=()=>{
    if(!playConfig().enabled)throw new Error("이 앱 빌드에서는 Google Play 결제가 활성화되지 않았습니다.");
    if(!PlayBilling)throw new Error("Google Play 결제 모듈을 불러오지 못했습니다.");
    if(!String(playConfig().backendUrl||"").trim()){
      throw new Error("구매 검증 서버 주소가 설정되지 않아 결제를 시작하지 않았습니다.");
    }
  };

  const logicalProductId=storeProductId=>{
    const entry=Object.entries(playConfig().products||{}).find(([,value])=>value===storeProductId);
    return entry?.[0]||storeProductId;
  };

  const loadProducts=async()=>{
    if(!playConfig().enabled||!PlayBilling)return [];
    const result=await PlayBilling.getProducts({productIds:productIds()});
    return Array.isArray(result?.products)?result.products:[];
  };

  const verifyPurchase=async purchase=>{
    const token=await window.ParallelCityAuth?.getIdToken?.();
    if(!token)throw new Error("Google 로그인 후 구매해 주세요.");
    const backend=String(playConfig().backendUrl||"").replace(/\/$/,"");
    const response=await fetch(`${backend}/play-billing/verify`,{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
      body:JSON.stringify({
        packageName:playConfig().packageName||"com.drawervillage.app",
        productId:purchase.products?.[0]||"",
        purchaseToken:purchase.purchaseToken||"",
        orderId:purchase.orderId||"",
        quantity:Number(purchase.quantity)||1
      })
    });
    const result=await response.json().catch(()=>({}));
    if(!response.ok||result.verified!==true||result.entitlementApplied!==true){
      throw new Error(result.message||"구매 검증 또는 상품 지급을 완료하지 못했습니다.");
    }
    return result;
  };

  const finishVerifiedPurchase=async(purchaseResult,productId)=>{
    if(!purchaseResult.acknowledged){
      await PlayBilling.finishPurchase({
        purchaseToken:purchaseResult.purchaseToken,
        consumable:consumableProducts.has(productId)
      });
    }
  };

  const purchase=async productId=>{
    requireBilling();
    if(!window.ParallelCityAuth?.getInfo?.().user)throw new Error("Google 로그인 후 구매해 주세요.");
    const storeProductId=playConfig().products?.[productId]||productId;
    const purchaseResult=await PlayBilling.purchase({productId:storeProductId});
    if(Number(purchaseResult?.purchaseState)!==1){
      if(Number(purchaseResult?.purchaseState)===2)throw new Error("결제가 보류 중입니다. Google Play에서 완료한 뒤 다시 확인해 주세요.");
      throw new Error("Google Play 결제가 완료되지 않았습니다.");
    }
    await verifyPurchase({...purchaseResult,products:[productId]});
    await finishVerifiedPurchase(purchaseResult,productId);
    await window.ParallelCityAuth?.download?.({automatic:false});
    return purchaseResult;
  };

  const restorePurchases=async()=>{
    requireBilling();
    if(!window.ParallelCityAuth?.getInfo?.().user)throw new Error("Google 로그인 후 구매를 복원해 주세요.");
    const result=await PlayBilling.restorePurchases();
    const purchases=Array.isArray(result?.purchases)?result.purchases:[];
    let restored=0;
    for(const purchaseResult of purchases){
      if(Number(purchaseResult?.purchaseState)!==1)continue;
      const storeProductId=purchaseResult.products?.[0]||"";
      const productId=logicalProductId(storeProductId);
      await verifyPurchase({...purchaseResult,products:[productId]});
      await finishVerifiedPurchase(purchaseResult,productId);
      restored+=1;
    }
    if(restored)await window.ParallelCityAuth?.download?.({automatic:false});
    return {purchases,restored};
  };

  window.DrawerVillagePlayBilling={
    enabled:()=>Boolean(playConfig().enabled&&PlayBilling),
    configured:()=>Boolean(String(playConfig().backendUrl||"").trim()),
    loadProducts,
    purchase,
    restorePurchases
  };

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
      banner.textContent="인터넷에 연결되지 않았어요. 기기에 저장된 내용은 계속 볼 수 있고, 계정 동기화와 결제는 연결한 뒤 다시 진행합니다.";
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
