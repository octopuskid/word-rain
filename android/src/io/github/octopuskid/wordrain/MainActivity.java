package io.github.octopuskid.wordrain;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.SharedPreferences;
import android.net.ConnectivityManager;
import android.net.NetworkCapabilities;
import android.os.Handler;
import android.os.Looper;
import org.json.JSONArray;
import java.net.URL;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.security.MessageDigest;
import javax.net.ssl.HttpsURLConnection;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Vibrator;
import android.os.VibrationEffect;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import org.json.JSONObject;
import android.view.WindowInsets;
import android.view.View;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import java.io.ByteArrayInputStream;
import java.util.HashMap;
import java.util.Map;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;
import android.widget.FrameLayout;
import android.view.ViewGroup;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/** Bundled offline game. Native HTTPS checks public stable releases and downloads approved music; WebView network stays blocked. */
public final class MainActivity extends Activity {
    private WebView game;
    private static final int MUSIC_PICKER = 132;
    private boolean choosingMusic;
    private boolean downloadingMusic;
    private final Handler updates = new Handler(Looper.getMainLooper());
    private ConnectivityManager connectivity;
    private boolean foreground, checkingUpdate, launchUpdateAttempted;

    @Override protected void onStart() {
        super.onStart();
        foreground = true;
        // One attempt for this launch, including offline/failure. Returning from another
        // app or reconnecting must not start another request during the same session.
        if (!launchUpdateAttempted) {
            launchUpdateAttempted = true;
            connectivity = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            checkForUpdate();
        }
    }

    @Override protected void onStop() {
        foreground = false;
        super.onStop();
    }

    private void checkForUpdate() {
        if (!foreground || checkingUpdate || connectivity == null) return;
        NetworkCapabilities caps = connectivity.getNetworkCapabilities(connectivity.getActiveNetwork());
        if (caps == null || !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)) return;
        final SharedPreferences prefs = getSharedPreferences("release-check", MODE_PRIVATE);
        checkingUpdate = true;
        new Thread(new Runnable() { @Override public void run() {
            HttpsURLConnection connection = null;
            String found = null;
            try {
                connection = (HttpsURLConnection) new URL("https://api.github.com/repos/octopuskid/word-rain/releases/latest").openConnection();
                connection.setConnectTimeout(8000); connection.setReadTimeout(8000);
                connection.setInstanceFollowRedirects(false);
                connection.setRequestProperty("Accept", "application/vnd.github+json");
                connection.setRequestProperty("User-Agent", "WordRain-Android");
                if (connection.getResponseCode() != 200) throw new java.io.IOException("Release unavailable");
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                try (InputStream input = connection.getInputStream()) {
                    byte[] buffer = new byte[4096]; int count;
                    while ((count = input.read(buffer)) != -1) {
                        if (bytes.size() + count > 256 * 1024) throw new java.io.IOException("Release too large");
                        bytes.write(buffer, 0, count);
                    }
                }
                JSONObject release = new JSONObject(new String(bytes.toByteArray(), StandardCharsets.UTF_8));
                String tag = release.getString("tag_name");
                String installed = getPackageManager().getPackageInfo(getPackageName(), 0).versionName;
                if (!release.getBoolean("draft") && !release.getBoolean("prerelease") && UpdatePolicy.newer(tag, installed)) {
                    String number = tag.replaceFirst("^v", "");
                    JSONArray assets = release.getJSONArray("assets");
                    // Ignore HTML-only releases even if someone marks one as Latest.
                    boolean apk = false;
                    for (int i = 0; i < assets.length(); i++) {
                        String name = assets.getJSONObject(i).getString("name");
                        apk |= name.equals("word-rain-" + number + ".apk");
                    }
                    if (apk) found = tag;
                }
            } catch (Exception unavailable) { /* Offline, timeout, invalid response or API limit: keep playing. */ }
            finally { if (connection != null) connection.disconnect(); }
            final String version = found;
            updates.post(new Runnable() { @Override public void run() {
                checkingUpdate = false;
                if (version == null || !foreground || isFinishing() || isDestroyed() || game == null) return;
                if (version.equals(prefs.getString("offered-version", ""))) return;
                prefs.edit().putString("offered-version", version).apply();
                game.evaluateJavascript("if(typeof state!=='undefined'&&state==='playing')pause();", null);
                new AlertDialog.Builder(MainActivity.this)
                    .setTitle("Word Rain " + version + " is available")
                    .setMessage("Open GitHub to download the update? Install over this app to keep your records. Downloading uses your Wi-Fi or mobile data. The game will stay paused.")
                    .setNegativeButton("Later", null)
                    .setPositiveButton("View update", new DialogInterface.OnClickListener() {
                        @Override public void onClick(DialogInterface dialog, int which) {
                            try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://github.com/octopuskid/word-rain/releases/tag/" + version))); }
                            catch (ActivityNotFoundException unavailable) { Toast.makeText(MainActivity.this, "No browser installed", Toast.LENGTH_SHORT).show(); }
                        }
                    }).show();
            }});
        }}, "WordRainUpdateCheck").start();
    }

    private String musicFile(String id) {
        return "carefree".equals(id) ? "carefree.mp3" : "monkeys".equals(id) ? "monkeys-spinning-monkeys.mp3" : null;
    }
    private File downloadedMusic(String name) { return new File(new File(getFilesDir(), "optional-music"), name); }

    public final class GameBridge {
        @JavascriptInterface public boolean hasMusic(String id) {
            String name = musicFile(id);
            return name != null && downloadedMusic(name).isFile();
        }
        @JavascriptInterface public void downloadMusic(final String id) {
            if (musicFile(id) == null) return;
            runOnUiThread(new Runnable() { @Override public void run() {
                if (downloadingMusic || game == null) return;
                downloadingMusic = true;
                new Thread(new Runnable() { @Override public void run() {
                    HttpsURLConnection connection = null;
                    boolean success = false;
                    String name = musicFile(id);
                    File target = downloadedMusic(name), partial = new File(target.getPath() + ".part");
                    try {
                        File directory = target.getParentFile();
                        if (!directory.isDirectory() && !directory.mkdirs()) throw new java.io.IOException("No download directory");
                        connection = (HttpsURLConnection) new URL("https://raw.githubusercontent.com/octopuskid/word-rain/main/assets/music/" + name).openConnection();
                        connection.setConnectTimeout(10000); connection.setReadTimeout(15000);
                        connection.setInstanceFollowRedirects(false);
                        connection.setRequestProperty("User-Agent", "WordRain-Android");
                        if (connection.getResponseCode() != 200) throw new java.io.IOException("Download unavailable");
                        int expectedSize = "carefree".equals(id) ? 2052446 : 1251775;
                        MessageDigest digest = MessageDigest.getInstance("SHA-256");
                        int total = 0;
                        try (InputStream input = connection.getInputStream(); FileOutputStream output = new FileOutputStream(partial)) {
                            byte[] buffer = new byte[8192]; int count;
                            while ((count = input.read(buffer)) != -1) {
                                total += count;
                                if (total > expectedSize) throw new java.io.IOException("Invalid music size");
                                output.write(buffer, 0, count); digest.update(buffer, 0, count);
                            }
                        }
                        StringBuilder hash = new StringBuilder();
                        for (byte value : digest.digest()) hash.append(String.format(java.util.Locale.ROOT, "%02x", value & 255));
                        String expectedHash = "carefree".equals(id) ? "390e7c47e2cb540809d8c6b0ebf53bb4d22cda5f3ab900325e08187995422457" : "daf792a2d3bc1a592b5b30eab9b61170c1da9b578e28695ace8329238cb81488";
                        if (total != expectedSize || !expectedHash.equals(hash.toString()) || !partial.renameTo(target)) throw new java.io.IOException("Music verification failed");
                        success = true;
                    } catch (Exception unavailable) { /* Keep original music and allow retry. */ }
                    finally { if (connection != null) connection.disconnect(); partial.delete(); }
                    final boolean ready = success;
                    runOnUiThread(new Runnable() { @Override public void run() {
                        downloadingMusic = false;
                        if (game != null) game.evaluateJavascript(ready ? "window.wordRainDownloadReady(" + JSONObject.quote(id) + ");" : "window.wordRainDownloadFailed();", null);
                    }});
                }}, "WordRainMusicDownload").start();
            }});
        }

        @JavascriptInterface public void haptic(String kind) {
            if (!"hp".equals(kind) && !"shield".equals(kind) && !"both".equals(kind)) return;
            if (getResources().getConfiguration().smallestScreenWidthDp >= 600) return;
            try {
                Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
                if (vibrator == null || !vibrator.hasVibrator()) return;
                long[] pattern = "both".equals(kind) ? new long[]{0,110,50,60,35,60}
                    : "hp".equals(kind) ? new long[]{0,130} : new long[]{0,55,35,55};
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1));
            } catch (RuntimeException unavailable) { /* No vibration support. */ }
        }
        @JavascriptInterface public void chooseMusic() {
            runOnUiThread(new Runnable() { @Override public void run() {
                if (choosingMusic || game == null) return;
                Intent picker = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                picker.addCategory(Intent.CATEGORY_OPENABLE);
                picker.setType("audio/*");
                picker.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                try { choosingMusic = true; startActivityForResult(picker, MUSIC_PICKER); }
                catch (ActivityNotFoundException unavailable) {
                    choosingMusic = false;
                    Toast.makeText(MainActivity.this, "No audio picker installed", Toast.LENGTH_SHORT).show();
                }
            }});
        }
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        applyDeviceOrientation();
        getWindow().setBackgroundDrawableResource(android.R.color.black);
        game = new WebView(this);
        game.setBackgroundColor(Color.rgb(16, 28, 40));
        WebSettings settings = game.getSettings();
        settings.setJavaScriptEnabled(true);
        game.addJavascriptInterface(new GameBridge(), "WordRainNative");
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setBlockNetworkLoads(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        game.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if (!"https".equals(uri.getScheme()) || !"appassets.androidplatform.net".equals(uri.getHost())) return null;
                String path = uri.getPath();
                if (!"/assets/music/carefree.mp3".equals(path) && !"/assets/music/monkeys-spinning-monkeys.mp3".equals(path)) return null;
                String range = null;
                for (Map.Entry<String,String> header : request.getRequestHeaders().entrySet())
                    if ("Range".equalsIgnoreCase(header.getKey())) range = header.getValue();
                return cachedMusic(path.substring("/assets/music/".length()), range);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                String host = uri.getHost();
                boolean approved = "https".equals(uri.getScheme()) &&
                    ("octopuskid.itch.io".equals(host) || "github.com".equals(host) ||
                     "octopuskid.github.io".equals(host) || "incompetech.com".equals(host) ||
                     "creativecommons.org".equals(host));
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

    private WebResourceResponse cachedMusic(String name, String range) {
        // Resolve only the two approved, verified private downloads. WebView never fetches remote files.
        try (InputStream input = new FileInputStream(downloadedMusic(name))) {
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            byte[] chunk = new byte[8192]; int count;
            while ((count = input.read(chunk)) != -1) output.write(chunk, 0, count);
            byte[] bytes = output.toByteArray();
            int first = 0, last = bytes.length - 1, status = 200;
            Map<String,String> headers = new HashMap<String,String>();
            headers.put("Accept-Ranges", "bytes");
            if (range != null) {
                java.util.regex.Matcher match = java.util.regex.Pattern.compile("bytes=(\\d*)-(\\d*)").matcher(range);
                try {
                    if (!match.matches() || (match.group(1).isEmpty() && match.group(2).isEmpty())) throw new IllegalArgumentException();
                    if (match.group(1).isEmpty()) first = Math.max(0, bytes.length - Integer.parseInt(match.group(2)));
                    else { first = Integer.parseInt(match.group(1)); if (!match.group(2).isEmpty()) last = Math.min(last, Integer.parseInt(match.group(2))); }
                    if (first < 0 || first > last || first >= bytes.length) throw new IllegalArgumentException();
                    status = 206;
                    headers.put("Content-Range", "bytes " + first + "-" + last + "/" + bytes.length);
                } catch (IllegalArgumentException invalid) {
                    headers.put("Content-Range", "bytes */" + bytes.length);
                    return new WebResourceResponse("audio/mpeg", null, 416, "Range Not Satisfiable", headers, new ByteArrayInputStream(new byte[0]));
                }
            }
            headers.put("Content-Length", String.valueOf(last - first + 1));
            return new WebResourceResponse("audio/mpeg", null, status, status == 206 ? "Partial Content" : "OK", headers,
                new ByteArrayInputStream(bytes, first, last - first + 1));
        } catch (java.io.IOException unavailable) {
            return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", null, new ByteArrayInputStream(new byte[0]));
        }
    }

    @Override protected void onActivityResult(int request, int result, final Intent data) {
        super.onActivityResult(request, result, data);
        if (request != MUSIC_PICKER) return;
        choosingMusic = false;
        if (result != RESULT_OK || data == null || data.getData() == null) return;
        // Only read the explicitly selected document. Never persist its URI permission.
        new Thread(new Runnable() { @Override public void run() {
            String selected = null;
            try (InputStream input = getContentResolver().openInputStream(data.getData())) {
                if (input == null) throw new java.io.IOException("No audio");
                String mime = getContentResolver().getType(data.getData());
                if (mime == null || !mime.matches("audio/[a-zA-Z0-9.+-]+")) mime = "audio/mpeg";
                ByteArrayOutputStream bytes = new ByteArrayOutputStream();
                byte[] chunk = new byte[8192]; int count;
                while ((count = input.read(chunk)) != -1) {
                    if (bytes.size() + count > 24 * 1024 * 1024) throw new java.io.IOException("Audio too large");
                    bytes.write(chunk, 0, count);
                }
                selected = "data:" + mime + ";base64," + Base64.encodeToString(bytes.toByteArray(), Base64.NO_WRAP);
            } catch (Exception unavailable) { /* Report a readable error in the game. */ }
            final String source = selected;
            runOnUiThread(new Runnable() { @Override public void run() {
                if (game == null) return;
                game.evaluateJavascript(source == null ? "window.wordRainMusicError();"
                    : "window.wordRainMusicData(" + JSONObject.quote(source) + ");", null);
            }});
        }}, "WordRainMusicPicker").start();
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
        updates.removeCallbacksAndMessages(null);
        if (game != null) { game.removeJavascriptInterface("WordRainNative"); game.stopLoading(); game.destroy(); game = null; }
        super.onDestroy();
    }
}
