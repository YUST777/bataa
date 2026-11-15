package com.bataa.app;

import android.app.Activity;
import java.io.File;
import androidx.core.content.FileProvider;
import android.webkit.WebChromeClient;
import android.webkit.ValueCallback;
import android.provider.MediaStore;
import android.window.OnBackInvokedDispatcher;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.view.View;
import android.webkit.JavascriptInterface;
import android.webkit.MimeTypeMap;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

public final class MainActivity extends Activity {
    private static final String APP_ORIGIN = "https://app.local";
    private WebView webView;
    private int insetTop;
    private int insetBottom;
    private int insetKeyboard;

    /** Dark icons on light screens (true), light icons on dark ones like the pond at night (false). */
    @SuppressWarnings("deprecation")
    private void setBarIcons(boolean darkIcons) {
        int flags = View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        if (darkIcons && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        if (darkIcons && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) flags |= View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
        getWindow().getDecorView().setSystemUiVisibility(flags);
    }

    /** The bar sizes in CSS pixels, as --sat (top) and --sab (bottom) on the page. */
    private void sendInsets() {
        if (webView == null) return;
        float density = getResources().getDisplayMetrics().density;
        webView.evaluateJavascript(
            "document.documentElement.style.setProperty('--sat','" + Math.round(insetTop / density) + "px');"
                + "document.documentElement.style.setProperty('--sab','" + Math.round(insetBottom / density) + "px');"
                + "document.documentElement.style.setProperty('--kb','" + Math.round(insetKeyboard / density) + "px')",
            null);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Edge to edge: the web app draws behind the status and navigation bars (Android 15+ does this anyway)
        // and pads itself with the bar sizes sent to it as --sat / --sab (see sendInsets).
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) getWindow().setNavigationBarContrastEnforced(false);
        setBarIcons(true);

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
        webView.setWebChromeClient(new PhotoChooser());
        // Native Google sign-in for the web app (see GoogleSignIn below). Only app.local pages load in this
        // WebView; every other link opens in the browser, so no outside page can reach the bridge.
        webView.addJavascriptInterface(new NativeBridge(), "WaddleNative");
        setContentView(webView);
        webView.setOnApplyWindowInsetsListener((view, insets) -> {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars() | android.view.WindowInsets.Type.displayCutout());
                insetTop = bars.top;
                insetBottom = bars.bottom;
                // The on-screen keyboard: edge to edge, the page is not resized for it, so it is sent as --kb.
                insetKeyboard = insets.getInsets(android.view.WindowInsets.Type.ime()).bottom;
            } else {
                insetTop = insets.getSystemWindowInsetTop();
                insetBottom = insets.getSystemWindowInsetBottom();
            }
            sendInsets();
            return insets;
        });

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        }
        String callback = authCallbackUrl(getIntent());
        if (callback != null) {
            webView.loadUrl(callback);
        } else if (savedInstanceState == null) {
            webView.loadUrl(APP_ORIGIN + "/");
        } else {
            webView.restoreState(savedInstanceState);
        }
    }

    // The app is singleTask, so returning from the browser after sign-in lands here with the callback link.
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String callback = authCallbackUrl(intent);
        if (callback != null && webView != null) webView.loadUrl(callback);
    }

    /**
     * com.bataa.app://auth-callback?code=... becomes https://app.local/?code=..., where the web app's
     * Supabase client finishes signing in (it swaps the code for a session with the verifier it kept).
     * Anything else returns null.
     */
    private static String authCallbackUrl(Intent intent) {
        if (intent == null || !Intent.ACTION_VIEW.equals(intent.getAction())) return null;
        Uri data = intent.getData();
        if (data == null || !"com.bataa.app".equals(data.getScheme()) || !"auth-callback".equals(data.getHost())) return null;
        String query = data.getEncodedQuery();
        String fragment = data.getEncodedFragment();
        return APP_ORIGIN + "/" + (query != null ? "?" + query : "") + (fragment != null ? "#" + fragment : "");
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    /**
     * Back (button or edge gesture) asks the web app first: window.__waddleBack() returns true when it handled
     * it (the pond slides away). Otherwise the page goes back, or the app goes to the background.
     */
    private void handleBack() {
        if (webView == null) {
            moveTaskToBack(true);
            return;
        }
        webView.evaluateJavascript("String(!!(window.__waddleBack && window.__waddleBack()))", value -> {
            if ("\"true\"".equals(value)) return;
            if (webView.canGoBack()) webView.goBack();
            else moveTaskToBack(true);
        });
    }

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        handleBack();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }

    /**
     * Profile photos: a WebView ignores <input type="file"> unless the app answers it. An input with `capture`
     * (the Camera button) opens the camera, which saves into our cache through the FileProvider; the other
     * (Gallery) opens Android's photo picker. The picked picture goes back to the page, which crops it and
     * uploads it to Supabase Storage.
     */
    private static final int PICK_PHOTO = 41;
    private ValueCallback<Uri[]> photoCallback;
    private Uri cameraPhoto;

    private final class PhotoChooser extends WebChromeClient {
        @Override
        public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
            if (photoCallback != null) photoCallback.onReceiveValue(null);
            photoCallback = callback;
            cameraPhoto = null;
            Intent intent;
            if (params.isCaptureEnabled()) {
                try {
                    File dir = new File(getCacheDir(), "camera");
                    if (!dir.exists() && !dir.mkdirs()) throw new IOException("no camera folder");
                    File file = File.createTempFile("photo", ".jpg", dir);
                    cameraPhoto = FileProvider.getUriForFile(MainActivity.this, "com.bataa.app.files", file);
                } catch (IOException e) {
                    finishPhoto(null);
                    return true;
                }
                intent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    .putExtra(MediaStore.EXTRA_OUTPUT, cameraPhoto)
                    .addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION | Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } else if (Build.VERSION.SDK_INT >= 33) {
                intent = new Intent(MediaStore.ACTION_PICK_IMAGES);
            } else {
                intent = new Intent(Intent.ACTION_GET_CONTENT).addCategory(Intent.CATEGORY_OPENABLE).setType("image/*");
            }
            try {
                startActivityForResult(intent, PICK_PHOTO);
            } catch (ActivityNotFoundException e) {
                finishPhoto(null);
            }
            return true;
        }
    }

    private void finishPhoto(Uri[] result) {
        if (photoCallback != null) photoCallback.onReceiveValue(result);
        photoCallback = null;
    }

    @Override
    @SuppressWarnings("deprecation")
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != PICK_PHOTO) {
            super.onActivityResult(requestCode, resultCode, data);
            return;
        }
        Uri picked = resultCode != RESULT_OK ? null : cameraPhoto != null ? cameraPhoto : data != null ? data.getData() : null;
        finishPhoto(picked == null ? null : new Uri[] { picked });
    }

    /** What the web app can ask of Android. */
    private final class NativeBridge {
        /**
         * Shows Android's own "Sign in with Google" sheet (Credential Manager). `clientId` is the Google web
         * client ID that Supabase verifies tokens against; `nonce` is the SHA-256 of a random value the web
         * app keeps, so the token can only be used once. The answer goes to window.__waddleGoogle(token, error).
         */
        @JavascriptInterface
        public void signInWithGoogle(String clientId, String nonce) {
            runOnUiThread(() -> startGoogleSignIn(clientId, nonce));
        }

        /** "dark" for dark screens (light bar icons), anything else for light ones. */
        @JavascriptInterface
        public void setTheme(String theme) {
            runOnUiThread(() -> setBarIcons(!"dark".equals(theme)));
        }
    }

    private void startGoogleSignIn(String clientId, String nonce) {
        GetSignInWithGoogleOption option = new GetSignInWithGoogleOption.Builder(clientId).setNonce(nonce).build();
        GetCredentialRequest request = new GetCredentialRequest.Builder().addCredentialOption(option).build();
        CredentialManager.create(this).getCredentialAsync(
            this,
            request,
            new CancellationSignal(),
            this::runOnUiThread,
            new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                @Override
                public void onResult(GetCredentialResponse response) {
                    Credential credential = response.getCredential();
                    if (credential instanceof CustomCredential
                        && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                        try {
                            deliverGoogle(GoogleIdTokenCredential.createFrom(credential.getData()).getIdToken(), null);
                        } catch (Exception e) {
                            deliverGoogle(null, "bad_credential");
                        }
                    } else {
                        deliverGoogle(null, "unexpected_credential");
                    }
                }

                @Override
                public void onError(GetCredentialException e) {
                    deliverGoogle(null, e instanceof GetCredentialCancellationException ? "cancelled" : String.valueOf(e.getMessage()));
                }
            }
        );
    }

    private void deliverGoogle(String token, String error) {
        if (webView == null) return;
        String js = "window.__waddleGoogle && window.__waddleGoogle("
            + (token == null ? "null" : JSONObject.quote(token)) + ", "
            + (error == null ? "null" : JSONObject.quote(error)) + ")";
        webView.evaluateJavascript(js, null);
    }

    private final class LocalContentClient extends WebViewClient {
        // A new page starts without the bar sizes: send them as soon as it shows, and again once loaded.
        @Override
        public void onPageCommitVisible(WebView view, String url) {
            sendInsets();
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            sendInsets();
        }

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
