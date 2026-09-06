export function shouldRenderTabletObserveMap(environment=globalThis){
  const runtime=environment.window||environment;
  const currentLocation=runtime.location||environment.location;
  const currentScreen=runtime.screen||environment.screen||{};
  const nativeRuntime=Boolean(
    runtime.DRAWER_VILLAGE_NATIVE||
    runtime.Capacitor?.isNativePlatform?.()||
    ((currentLocation?.hostname==="127.0.0.1"||currentLocation?.hostname==="localhost")&&new URLSearchParams(currentLocation.search).has("native-preview"))
  );
  const tabletScreen=Math.min(Number(currentScreen.width)||0,Number(currentScreen.height)||0)>=600;
  return nativeRuntime&&tabletScreen&&Boolean(runtime.matchMedia?.("(min-width:721px) and (orientation:landscape)")?.matches);
}
