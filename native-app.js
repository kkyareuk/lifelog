const isNative=Boolean(window.Capacitor?.isNativePlatform?.());

if(isNative){
  document.documentElement.classList.add("native-app");
  document.documentElement.classList.add("native-platform");
  window.DRAWER_VILLAGE_NATIVE=true;

  // Android 권한 화면에서 돌아올 때 일부 Samsung WebView가 레이아웃
  // viewport를 넓은 화면 값으로 남긴다. 앱 셸을 다시 모바일 viewport로
  // 확정해 절반 너비 화면과 선택 뒤 가로 이동을 막는다.
  const normalizeNativeViewport=()=>{
    let viewport=document.querySelector('meta[name="viewport"]');
    if(!viewport){viewport=document.createElement("meta");viewport.name="viewport";document.head.prepend(viewport)}
    viewport.content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover";
    document.documentElement.classList.add("native-app","native-platform");
    document.documentElement.style.removeProperty("width");
    document.body?.style.removeProperty("width");
  };
  normalizeNativeViewport();

  const {App,Browser,Network,PlayBilling}=window.Capacitor.Plugins;
  App.addListener("appStateChange",({isActive})=>{if(isActive)requestAnimationFrame(normalizeNativeViewport)});
  const isAndroid=window.Capacitor?.getPlatform?.()==="android";
  const playConfig=()=>isAndroid?(window.PARALLEL_CITY_CONFIG?.playBilling||{}):{};
  const productIds=()=>Object.values(playConfig().products||{}).filter(Boolean);
  const consumableProducts=new Set(["character_slots_5","character_slot_1","town_slot_1","green_tea"]);
  const pendingPurchaseKey="drawer-village.pending-play-purchases.v1";
  let purchaseInFlight=false;
  const localizedBillingError=error=>{
    const code=String(error?.code||"");
    const messages={
      NO_REGULAR_PAID_OFFER:{ko:"정상 유료 가격을 확인할 수 없어 결제를 시작하지 않았습니다. 앱을 업데이트하거나 고객센터에 문의해 주세요.",en:"The purchase was not started because a regular paid price could not be verified. Please update the app or contact support.",ja:"通常の有料価格を確認できなかったため、購入を開始しませんでした。アプリを更新するか、サポートへお問い合わせください。"},
      PURCHASE_PENDING:{ko:"결제가 승인 대기 중입니다. Google Play에서 완료된 뒤 구매 내역을 확인해 주세요.",en:"This purchase is pending. Check your purchases after Google Play completes it.",ja:"購入は保留中です。Google Playで完了した後、購入履歴を確認してください。"},
      PURCHASE_NOT_COMPLETED:{ko:"Google Play에서 완료된 구매로 확인되지 않았습니다.",en:"Google Play did not confirm this as a completed purchase.",ja:"Google Playで完了済みの購入として確認できませんでした。"},
      PACKAGE_MISMATCH:{ko:"구매한 앱 정보가 일치하지 않습니다.",en:"The purchased app does not match.",ja:"購入したアプリの情報が一致しません。"},
      PRODUCT_MISMATCH:{ko:"구매한 상품 정보가 요청한 상품과 일치하지 않습니다.",en:"The purchased product does not match the requested product.",ja:"購入した商品がリクエストした商品と一致しません。"}
    };
    const language=String(document.documentElement.lang||navigator.language||"ko").toLowerCase();
    const locale=language.startsWith("ja")?"ja":language.startsWith("en")?"en":"ko";
    const message=messages[code]?.[locale];
    if(!message)return error;
    const localized=new Error(message);
    localized.code=code;
    return localized;
  };

  // Google Play 결제 직후 서버 확인이 잠시 실패해도 영수증 토큰을 잃지
  // 않는다. 이 값만으로는 상품을 지급하지 않고, 서버 검증 재시도에만 쓴다.
  const readPendingPurchases=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(pendingPurchaseKey)||"[]");
      return Array.isArray(value)?value.filter(item=>item?.purchaseToken):[];
    }catch{return []}
  };
  const writePendingPurchases=items=>{
    try{localStorage.setItem(pendingPurchaseKey,JSON.stringify(items.slice(-20)))}catch{}
  };
  const rememberPurchase=(purchase,storeProductId=purchase?.products?.[0]||"")=>{
    const purchaseToken=String(purchase?.purchaseToken||"").trim();
    if(!purchaseToken)return;
    const saved={
      purchaseToken,
      orderId:String(purchase?.orderId||""),
      products:[String(storeProductId||"")].filter(Boolean),
      purchaseState:Number(purchase?.purchaseState)||1,
      quantity:Math.max(1,Number(purchase?.quantity)||1),
      acknowledged:Boolean(purchase?.acknowledged),
      savedAt:Date.now()
    };
    const others=readPendingPurchases().filter(item=>item.purchaseToken!==purchaseToken);
    writePendingPurchases([...others,saved]);
  };
  const forgetPurchase=purchaseToken=>writePendingPurchases(
    readPendingPurchases().filter(item=>item.purchaseToken!==purchaseToken)
  );
  const mergePurchases=(...groups)=>{
    const values=new Map();
    groups.flat().forEach(item=>{
      const token=String(item?.purchaseToken||"").trim();
      if(token)values.set(token,{...(values.get(token)||{}),...item});
    });
    return [...values.values()];
  };

  const requireBilling=()=>{
    if(!playConfig().enabled)throw new Error("현재 앱에서는 결제를 이용할 수 없습니다.");
    if(!PlayBilling)throw new Error("결제 기능을 불러오지 못했습니다. 앱을 업데이트한 뒤 다시 시도해 주세요.");
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
    return {
      products:(Array.isArray(result?.products)?result.products:[]).map(product=>({
        ...product,
        storeProductId:product.productId,
        productId:logicalProductId(product.productId)
      })),
      unavailableProducts:(Array.isArray(result?.unavailableProducts)?result.unavailableProducts:[]).map(product=>({
        ...product,
        storeProductId:product.productId,
        productId:logicalProductId(product.productId)
      }))
    };
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
    if(purchaseInFlight)throw new Error("이미 다른 결제를 진행하고 있습니다.");
    requireBilling();
    if(!window.ParallelCityAuth?.getInfo?.().user)throw new Error("Google 로그인 후 구매해 주세요.");
    purchaseInFlight=true;
    const storeProductId=playConfig().products?.[productId]||productId;
    try{
      let purchaseResult;
      try{
        purchaseResult=await PlayBilling.purchase({productId:storeProductId});
      }catch(error){
        if(String(error?.code||"")==="7"){
          const restored=await restorePurchases();
          if(restored.restored)return {restored:true};
        }
        throw localizedBillingError(error);
      }
      if(Number(purchaseResult?.purchaseState)!==1){
        if(Number(purchaseResult?.purchaseState)===2)throw new Error("결제가 보류 중입니다. Google Play에서 완료한 뒤 다시 확인해 주세요.");
        throw new Error("결제가 완료되지 않았습니다.");
      }
      rememberPurchase(purchaseResult,storeProductId);
      const verification=await verifyPurchase({...purchaseResult,products:[storeProductId]});
      if(!verification.purchaseFinished)await finishVerifiedPurchase(purchaseResult,productId);
      forgetPurchase(purchaseResult.purchaseToken);
      await window.ParallelCityAuth?.download?.({automatic:false});
      return purchaseResult;
    }finally{
      purchaseInFlight=false;
    }
  };

  const restorePurchases=async()=>{
    requireBilling();
    if(!window.ParallelCityAuth?.getInfo?.().user)throw new Error("Google 로그인 후 구매를 복원해 주세요.");
    const result=await PlayBilling.restorePurchases();
    const purchases=mergePurchases(
      Array.isArray(result?.purchases)?result.purchases:[],
      readPendingPurchases()
    );
    let restored=0;
    const failures=[];
    for(const purchaseResult of purchases){
      if(Number(purchaseResult?.purchaseState)!==1)continue;
      const storeProductId=purchaseResult.products?.[0]||"";
      if(!storeProductId||!productIds().includes(storeProductId))continue;
      const productId=logicalProductId(storeProductId);
      rememberPurchase(purchaseResult,storeProductId);
      try{
        const verification=await verifyPurchase({...purchaseResult,products:[storeProductId]});
        if(!verification.purchaseFinished)await finishVerifiedPurchase(purchaseResult,productId);
        forgetPurchase(purchaseResult.purchaseToken);
        restored+=1;
      }catch(error){failures.push(error)}
    }
    if(restored)await window.ParallelCityAuth?.download?.({automatic:false});
    if(!restored&&failures.length)throw failures[0];
    return {purchases,restored,failed:failures.length};
  };

  window.DrawerVillagePlayBilling={
    enabled:()=>Boolean(playConfig().enabled&&PlayBilling),
    configured:()=>Boolean(String(playConfig().backendUrl||"").trim()),
    loadProducts,
    purchase,
    restorePurchases
  };

  // 결제 직후 앱이 닫히거나 서버 권한 반영이 늦었던 경우, 다음 로그인
  // 완료 시 보관 중인 영수증만 조용히 한 번 더 확인한다.
  let pendingRetryRunning=false;
  window.addEventListener("drawer-village-cloud-loaded",()=>{
    if(pendingRetryRunning||!readPendingPurchases().length)return;
    pendingRetryRunning=true;
    setTimeout(()=>restorePurchases().catch(error=>console.warn("보류 중인 Google Play 구매 재확인 대기",error)).finally(()=>{pendingRetryRunning=false}),1200);
  });

  if(isAndroid)App.addListener("backButton",({canGoBack})=>{
    const opened=document.querySelector("dialog[open]");
    if(opened){opened.close();return}
    const routineSheet=document.querySelector("[data-routine-sheet]");
    if(routineSheet){window.dispatchEvent(new CustomEvent("drawer-village-native-back",{cancelable:true}));return}
    if(window.DrawerVillageNavigation?.back?.())return;
    const nativeBackEvent=new CustomEvent("drawer-village-native-back",{cancelable:true});
    window.dispatchEvent(nativeBackEvent);
    if(nativeBackEvent.defaultPrevented)return;
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
