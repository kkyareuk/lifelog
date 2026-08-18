package com.drawervillage.app;

import android.app.Activity;
import androidx.annotation.NonNull;
import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ConsumeParams;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;
import com.android.billingclient.api.UnfetchedProduct;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@CapacitorPlugin(name = "PlayBilling")
public class PlayBillingPlugin extends Plugin implements PurchasesUpdatedListener {
    private BillingClient billingClient;
    private PluginCall pendingPurchaseCall;

    private String billingError(String action, BillingResult result) {
        int code = result.getResponseCode();
        String reason;
        switch (code) {
            case BillingClient.BillingResponseCode.SERVICE_DISCONNECTED:
            case BillingClient.BillingResponseCode.SERVICE_UNAVAILABLE:
                reason = "결제 서비스가 잠시 연결되지 않았습니다.";
                break;
            case BillingClient.BillingResponseCode.BILLING_UNAVAILABLE:
                reason = "이 기기 또는 계정에서는 결제를 사용할 수 없습니다.";
                break;
            case BillingClient.BillingResponseCode.ITEM_UNAVAILABLE:
                reason = "이 상품은 현재 구매할 수 없습니다.";
                break;
            case BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED:
                reason = "처리되지 않은 기존 구매가 있습니다.";
                break;
            case BillingClient.BillingResponseCode.NETWORK_ERROR:
                reason = "인터넷 연결을 확인해 주세요.";
                break;
            case BillingClient.BillingResponseCode.DEVELOPER_ERROR:
                reason = "상품 설정을 확인하는 중 문제가 생겼습니다.";
                break;
            default:
                reason = "잠시 후 다시 시도해 주세요.";
        }
        return action + " " + reason + " (오류 " + code + ")";
    }

    private String unavailableProductMessage(List<UnfetchedProduct> products) {
        if (products == null || products.isEmpty()) return "상품 정보를 찾지 못했습니다.";
        int status = products.get(0).getStatusCode();
        if (status == UnfetchedProduct.StatusCode.PRODUCT_NOT_FOUND) {
            return "상품이 아직 판매 등록되지 않았거나 등록 내용이 반영 중입니다.";
        }
        if (status == UnfetchedProduct.StatusCode.NO_ELIGIBLE_OFFER) {
            return "이 계정에서 구매할 수 있는 가격 정보가 없습니다.";
        }
        if (status == UnfetchedProduct.StatusCode.INVALID_PRODUCT_ID_FORMAT) {
            return "상품 등록 정보가 올바르지 않습니다.";
        }
        return "상품 정보를 불러오지 못했습니다.";
    }

    @Override
    public void load() {
        billingClient = BillingClient.newBuilder(getContext())
            .setListener(this)
            .enablePendingPurchases(
                PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()
            )
            .enableAutoServiceReconnection()
            .build();
    }

    private void withBilling(PluginCall call, Runnable action) {
        if (billingClient != null && billingClient.isReady()) {
            action.run();
            return;
        }
        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingSetupFinished(@NonNull BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) action.run();
                else call.reject(billingError("결제 서비스에 연결하지 못했습니다.", result), String.valueOf(result.getResponseCode()));
            }

            @Override
            public void onBillingServiceDisconnected() {
                // enableAutoServiceReconnection()이 다음 요청에서 다시 연결합니다.
            }
        });
    }

    private List<QueryProductDetailsParams.Product> productQueries(JSArray ids) {
        List<QueryProductDetailsParams.Product> products = new ArrayList<>();
        if (ids == null) return products;
        try {
            for (Object value : ids.toList()) {
                String id = String.valueOf(value == null ? "" : value).trim();
                if (id.isEmpty()) continue;
                products.add(QueryProductDetailsParams.Product.newBuilder()
                    .setProductId(id)
                    .setProductType(BillingClient.ProductType.INAPP)
                    .build());
            }
        } catch (Exception error) {
            return Collections.emptyList();
        }
        return products;
    }

    private JSObject productJson(ProductDetails details) {
        JSObject value = new JSObject();
        value.put("productId", details.getProductId());
        value.put("title", details.getTitle());
        value.put("description", details.getDescription());
        List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
        if (offers != null && !offers.isEmpty()) {
            ProductDetails.OneTimePurchaseOfferDetails offer = offers.get(0);
            value.put("formattedPrice", offer.getFormattedPrice());
            value.put("priceCurrencyCode", offer.getPriceCurrencyCode());
            value.put("priceAmountMicros", offer.getPriceAmountMicros());
        }
        return value;
    }

    private JSObject purchaseJson(Purchase purchase) {
        JSObject value = new JSObject();
        value.put("orderId", purchase.getOrderId());
        value.put("packageName", purchase.getPackageName());
        value.put("purchaseToken", purchase.getPurchaseToken());
        value.put("purchaseTime", purchase.getPurchaseTime());
        value.put("purchaseState", purchase.getPurchaseState());
        value.put("quantity", purchase.getQuantity());
        value.put("acknowledged", purchase.isAcknowledged());
        JSArray products = new JSArray();
        for (String product : purchase.getProducts()) products.put(product);
        value.put("products", products);
        return value;
    }

    @PluginMethod
    public void getProducts(PluginCall call) {
        List<QueryProductDetailsParams.Product> products = productQueries(call.getArray("productIds"));
        if (products.isEmpty()) {
            call.reject("조회할 Google Play 상품 ID가 없습니다.");
            return;
        }
        withBilling(call, () -> billingClient.queryProductDetailsAsync(
            QueryProductDetailsParams.newBuilder().setProductList(products).build(),
            (result, queryResult) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(billingError("상품을 불러오지 못했습니다.", result), String.valueOf(result.getResponseCode()));
                    return;
                }
                JSArray values = new JSArray();
                for (ProductDetails details : queryResult.getProductDetailsList()) values.put(productJson(details));
                JSArray unavailable = new JSArray();
                for (UnfetchedProduct product : queryResult.getUnfetchedProductList()) {
                    JSObject value = new JSObject();
                    value.put("productId", product.getProductId());
                    value.put("statusCode", product.getStatusCode());
                    unavailable.put(value);
                }
                JSObject response = new JSObject();
                response.put("products", values);
                response.put("unavailableProducts", unavailable);
                call.resolve(response);
            }
        ));
    }

    @PluginMethod
    public void purchase(PluginCall call) {
        String productId = call.getString("productId", "").trim();
        if (productId.isEmpty()) {
            call.reject("구매할 Google Play 상품 ID가 없습니다.");
            return;
        }
        withBilling(call, () -> {
            QueryProductDetailsParams.Product query = QueryProductDetailsParams.Product.newBuilder()
                .setProductId(productId)
                .setProductType(BillingClient.ProductType.INAPP)
                .build();
            billingClient.queryProductDetailsAsync(
                QueryProductDetailsParams.newBuilder().setProductList(Collections.singletonList(query)).build(),
                (result, queryResult) -> {
                    if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                        call.reject(billingError("상품을 불러오지 못했습니다.", result), String.valueOf(result.getResponseCode()));
                        return;
                    }
                    if (queryResult.getProductDetailsList().isEmpty()) {
                        call.reject(unavailableProductMessage(queryResult.getUnfetchedProductList()), "PRODUCT_UNAVAILABLE");
                        return;
                    }
                    ProductDetails details = queryResult.getProductDetailsList().get(0);
                    BillingFlowParams.ProductDetailsParams.Builder detailParams = BillingFlowParams.ProductDetailsParams.newBuilder()
                        .setProductDetails(details);
                    List<ProductDetails.OneTimePurchaseOfferDetails> offers = details.getOneTimePurchaseOfferDetailsList();
                    if (offers == null || offers.isEmpty()) {
                        call.reject("이 계정에서 구매할 수 있는 가격 정보가 없습니다.", "NO_ELIGIBLE_OFFER");
                        return;
                    }
                    if (offers.get(0).getOfferToken() != null) detailParams.setOfferToken(offers.get(0).getOfferToken());
                    pendingPurchaseCall = call;
                    Activity activity = getActivity();
                    activity.runOnUiThread(() -> {
                        BillingResult launch = billingClient.launchBillingFlow(
                            activity,
                            BillingFlowParams.newBuilder()
                                .setProductDetailsParamsList(Collections.singletonList(detailParams.build()))
                                .build()
                        );
                        if (launch.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                            pendingPurchaseCall = null;
                            call.reject(billingError("결제창을 열지 못했습니다.", launch), String.valueOf(launch.getResponseCode()));
                        }
                    });
                }
            );
        });
    }

    @Override
    public void onPurchasesUpdated(@NonNull BillingResult result, List<Purchase> purchases) {
        PluginCall call = pendingPurchaseCall;
        pendingPurchaseCall = null;
        if (call == null) return;
        if (result.getResponseCode() == BillingClient.BillingResponseCode.USER_CANCELED) {
            call.reject("결제를 취소했습니다.", "USER_CANCELED");
            return;
        }
        if (result.getResponseCode() != BillingClient.BillingResponseCode.OK || purchases == null || purchases.isEmpty()) {
            call.reject(billingError("결제를 완료하지 못했습니다.", result), String.valueOf(result.getResponseCode()));
            return;
        }
        call.resolve(purchaseJson(purchases.get(0)));
    }

    @PluginMethod
    public void restorePurchases(PluginCall call) {
        withBilling(call, () -> billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(),
            (result, purchases) -> {
                if (result.getResponseCode() != BillingClient.BillingResponseCode.OK) {
                    call.reject(billingError("구매 내역을 확인하지 못했습니다.", result), String.valueOf(result.getResponseCode()));
                    return;
                }
                JSArray values = new JSArray();
                for (Purchase purchase : purchases) values.put(purchaseJson(purchase));
                JSObject response = new JSObject();
                response.put("purchases", values);
                call.resolve(response);
            }
        ));
    }

    @PluginMethod
    public void finishPurchase(PluginCall call) {
        String purchaseToken = call.getString("purchaseToken", "").trim();
        boolean consumable = Boolean.TRUE.equals(call.getBoolean("consumable", true));
        if (purchaseToken.isEmpty()) {
            call.reject("구매 토큰이 없습니다.");
            return;
        }
        withBilling(call, () -> {
            if (consumable) {
                billingClient.consumeAsync(
                    ConsumeParams.newBuilder().setPurchaseToken(purchaseToken).build(),
                    (result, token) -> {
                        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) call.resolve();
                        else call.reject("구매 소비 처리에 실패했습니다.", String.valueOf(result.getResponseCode()));
                    }
                );
            } else {
                billingClient.acknowledgePurchase(
                    AcknowledgePurchaseParams.newBuilder().setPurchaseToken(purchaseToken).build(),
                    result -> {
                        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) call.resolve();
                        else call.reject("구매 확인 처리에 실패했습니다.", String.valueOf(result.getResponseCode()));
                    }
                );
            }
        });
    }

    @Override
    protected void handleOnDestroy() {
        if (billingClient != null) billingClient.endConnection();
    }
}
