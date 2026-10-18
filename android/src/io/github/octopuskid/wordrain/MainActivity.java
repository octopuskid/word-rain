package io.github.octopuskid.wordrain;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowInsets;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.view.ViewGroup;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/** Offline-only shell: all game code is bundled; no network or storage permissions. */
public final class MainActivity extends Activity {
    private WebView game;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        applyDeviceOrientation();
        getWindow().setBackgroundDrawableResource(android.R.color.black);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 28, 40));
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        game.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                boolean approved = "https".equals(uri.getScheme()) &&
                    ("octopuskid.itch.io".equals(host) || "github.com".equals(host) ||
                     "octopuskid.github.io".equals(host));
                if (request.isForMainFrame() && request.hasGesture() && approved) {
                    try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); }
                    catch (ActivityNotFoundException unavailable) {
                        Toast.makeText(MainActivity.this, "No browser installed", Toast.LENGTH_SHORT).show();
                    }
                }
                return true;
            }
        });
        // Inset the native container, not WebView padding: fixed HTML elements
        // must be laid out inside the usable viewport above Android navigation.
        FrameLayout safeArea = new FrameLayout(this);
        safeArea.setBackgroundColor(Color.rgb(16, 28, 40));
        final int breathingRoom = Math.round(6 * getResources().getDisplayMetrics().density);
        safeArea.addView(game, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        safeArea.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener() {
          @Override public WindowInsets onApplyWindowInsets(View view, WindowInsets insets) {
            if (Build.VERSION.SDK_INT >= 30) {
                int types = WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout();
                Insets bars = insets.getInsetsIgnoringVisibility(types);
                view.setPadding(bars.left, bars.top + breathingRoom,
                                bars.right, bars.bottom + breathingRoom);
                // Tell WebView these insets were handled by the parent already.
                return new WindowInsets.Builder(insets).setInsets(types, Insets.NONE)
                        .setInsetsIgnoringVisibility(types, Insets.NONE).build();
            } else {
                view.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop() + breathingRoom,
                                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom() + breathingRoom);
            }
            WindowInsets handled = insets.consumeSystemWindowInsets().consumeStableInsets();
            return Build.VERSION.SDK_INT >= 28 ? handled.consumeDisplayCutout() : handled;
          }
        });
        setContentView(safeArea);
        safeArea.requestApplyInsets();
        try (InputStream input = getAssets().open("index.html")) {
            ByteArrayOutputStream bytes = new ByteArrayOutputStream();
            byte[] buffer = new byte[8192];
            int count;
            while ((count = input.read(buffer)) != -1) bytes.write(buffer, 0, count);
            // A stable HTTPS origin enables local theme storage without loading a remote page.
            game.loadDataWithBaseURL("https://appassets.androidplatform.net/",
                new String(bytes.toByteArray(), StandardCharsets.UTF_8), "text/html", null,
                "https://appassets.androidplatform.net/");
        } catch (java.io.IOException error) {
            Toast.makeText(this, "Could not open the bundled game", Toast.LENGTH_LONG).show();
            finish();
        }
    }

    private void applyDeviceOrientation() {
        boolean phone = getResources().getConfiguration().smallestScreenWidthDp < 600;
        setRequestedOrientation(phone ? ActivityInfo.SCREEN_ORIENTATION_SENSOR_PORTRAIT
                                      : ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    }

    @Override public void onConfigurationChanged(Configuration configuration) {
        super.onConfigurationChanged(configuration);
        applyDeviceOrientation();
    }

    @Override protected void onPause() {
        if (game != null) {
            game.evaluateJavascript("if(typeof state!=='undefined'&&state==='playing')pause();", null);
            game.onPause();
        }
        super.onPause();
    }

    @Override protected void onResume() {
        super.onResume();
        if (game != null) game.onResume();
    }

    @Override protected void onDestroy() {
        if (game != null) { game.stopLoading(); game.destroy(); game = null; }
        super.onDestroy();
    }
}
