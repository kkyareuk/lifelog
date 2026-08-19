# Firebase Authentication ships handlers for optional sign-in providers. This
# app enables Google sign-in only, so the Facebook SDK is intentionally absent.
-dontwarn com.facebook.**

# Capacitor discovers app plugins through generated metadata and reflection.
-keep class com.drawervillage.app.PlayBillingPlugin { *; }
