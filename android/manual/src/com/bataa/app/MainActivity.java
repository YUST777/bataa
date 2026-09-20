package com.bataa.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public final class MainActivity extends Activity {
    private static final String APP_ORIGIN = "https://app.local";
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Let Android render the real system status/navigation bars. The web
        // surface handles its own safe-area padding, so no fake 9:41/device
        // chrome is needed inside the product UI.
        getWindow().setStatusBarColor(Color.rgb(255, 250, 242));
        getWindow().setNavigationBarColor(Color.rgb(255, 250, 242));
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            int systemUi = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                systemUi |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
            }
            getWindow().getDecorView().setSystemUiVisibility(systemUi);
        }

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(255, 248, 233));
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setSupportZoom(false);
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);
        settings.setTextZoom(100);

        webView.setWebViewClient(new LocalContentClient());
        setContentView(webView);

        if (savedInstanceState == null) {
            webView.loadUrl(APP_ORIGIN + "/");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
            return;
        }
        super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    private final class LocalContentClient extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
            return localResponse(request.getUrl());
        }

        @Override
        @SuppressWarnings("deprecation")
        public WebResourceResponse shouldInterceptRequest(WebView view, String url) {
            return localResponse(Uri.parse(url));
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            return openExternalIfNeeded(request.getUrl());
        }

        @Override
        @SuppressWarnings("deprecation")
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            return openExternalIfNeeded(Uri.parse(url));
        }

        private boolean openExternalIfNeeded(Uri uri) {
            if ("app.local".equals(uri.getHost())) return false;
            String scheme = uri.getScheme();
            if (!"http".equals(scheme) && !"https".equals(scheme)) return true;
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                // The learning experience remains open if no browser is installed.
            }
            return true;
        }

        private WebResourceResponse localResponse(Uri uri) {
            if (!"app.local".equals(uri.getHost())) return null;
            String assetPath = uri.getPath();
            if (assetPath == null || assetPath.isEmpty() || "/".equals(assetPath)) {
                assetPath = "index.html";
            } else {
                assetPath = assetPath.substring(1);
            }

            WebResourceResponse response = openAsset(assetPath);
            if (response == null && !assetPath.substring(assetPath.lastIndexOf('/') + 1).contains(".")) {
                response = openAsset("index.html");
            }
            return response;
        }

        private WebResourceResponse openAsset(String assetPath) {
            try {
                InputStream input = getAssets().open(assetPath);
                WebResourceResponse response = new WebResourceResponse(
                    mimeType(assetPath),
                    isTextAsset(assetPath) ? "UTF-8" : null,
                    input
                );
                Map<String, String> headers = new HashMap<>();
                headers.put("Access-Control-Allow-Origin", APP_ORIGIN);
                headers.put("Cache-Control", "no-cache");
                response.setResponseHeaders(headers);
                return response;
            } catch (IOException ignored) {
                return null;
            }
        }
    }

    private static String mimeType(String path) {
        String extension = MimeTypeMap.getFileExtensionFromUrl(path).toLowerCase(Locale.US);
        if ("js".equals(extension) || "mjs".equals(extension)) return "text/javascript";
        if ("svg".equals(extension)) return "image/svg+xml";
        if ("webp".equals(extension)) return "image/webp";
        if ("webm".equals(extension)) return "video/webm";
        if ("json".equals(extension)) return "application/json";
        if ("woff2".equals(extension)) return "font/woff2";
        String detected = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
        return detected == null ? "application/octet-stream" : detected;
    }

    private static boolean isTextAsset(String path) {
        String lower = path.toLowerCase(Locale.US);
        return lower.endsWith(".html") || lower.endsWith(".css") || lower.endsWith(".js")
            || lower.endsWith(".mjs") || lower.endsWith(".json") || lower.endsWith(".svg")
            || lower.endsWith(".xml") || lower.endsWith(".txt");
    }
}
