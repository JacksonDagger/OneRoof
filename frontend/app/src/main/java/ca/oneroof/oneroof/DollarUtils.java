package ca.oneroof.oneroof;

public class DollarUtils {
    public static String formatDollars(int cents) {
        return String.format("%d.%02d", cents / 100, cents % 100);
    }

    public static String formatDollarsSign(int cents) {
        return String.format("$%d.%02d", cents / 100, cents % 100);
    }
}
