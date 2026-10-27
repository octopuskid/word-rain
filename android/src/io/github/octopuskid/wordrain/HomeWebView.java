package io.github.octopuskid.wordrain;

import android.content.Context;
import android.webkit.WebView;

/** Home cannot pan the native WebView, including flings and stale scroll offsets. */
public final class HomeWebView extends WebView {
    private boolean homeScrollLocked = true;

    public HomeWebView(Context context) {
        super(context);
        setHomeScrollLocked(true);
    }

    public void setHomeScrollLocked(boolean locked) {
        homeScrollLocked = locked;
        setVerticalScrollBarEnabled(!locked);
        setHorizontalScrollBarEnabled(!locked);
        setOverScrollMode(locked ? OVER_SCROLL_NEVER : OVER_SCROLL_IF_CONTENT_SCROLLS);
        if (locked) super.scrollTo(0, 0);
    }

    @Override public void scrollTo(int x, int y) {
        super.scrollTo(homeScrollLocked ? 0 : x, homeScrollLocked ? 0 : y);
    }

    @Override protected boolean overScrollBy(int dx, int dy, int x, int y,
            int rangeX, int rangeY, int maxX, int maxY, boolean touch) {
        if (homeScrollLocked) { super.scrollTo(0, 0); return false; }
        return super.overScrollBy(dx, dy, x, y, rangeX, rangeY, maxX, maxY, touch);
    }

    @Override protected void onOverScrolled(int x, int y, boolean clampedX, boolean clampedY) {
        if (homeScrollLocked) super.scrollTo(0, 0);
        else super.onOverScrolled(x, y, clampedX, clampedY);
    }

    @Override public void flingScroll(int velocityX, int velocityY) {
        if (!homeScrollLocked) super.flingScroll(velocityX, velocityY);
    }

    @Override public void computeScroll() {
        if (homeScrollLocked) super.scrollTo(0, 0);
        else super.computeScroll();
    }
}
