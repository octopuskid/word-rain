package io.github.octopuskid.wordrain;

/** Stable versions only: a development suffix must never prompt APK users. */
public final class UpdatePolicy {
    public static boolean newer(String candidate, String installed) {
        boolean development = installed != null && installed.matches("v?\\d{1,6}\\.\\d{1,6}(?:\\.\\d{1,6})?-dev\\d{1,6}");
        String base = development ? installed.substring(0, installed.indexOf("-dev")) : installed;
        if (development && base.split("\\.").length == 2) base += ".0";
        int[] next = parse(candidate), current = parse(base);
        if (next == null || current == null) return false;
        for (int i = 0; i < 3; i++) {
            if (next[i] != current[i]) return next[i] > current[i];
        }
        return development; // A stable release replaces its matching dev build.
    }
    private static int[] parse(String version) {
        if (version == null || !version.matches("v?\\d{1,6}\\.\\d{1,6}\\.\\d{1,6}")) return null;
        String[] parts = version.replaceFirst("^v", "").split("\\.");
        return new int[]{Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), Integer.parseInt(parts[2])};
    }
    private UpdatePolicy() {}
}
