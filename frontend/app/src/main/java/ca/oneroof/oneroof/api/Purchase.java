package ca.oneroof.oneroof.api;

import java.util.ArrayList;

public class Purchase {
    public String memo;
    public int purchaser;
    public String purchaserName;
    public ArrayList<Division> divisions;
    public int amount;

    public String dollarString() {
        return String.format("$%d.%02d", amount / 100, amount % 100);
    }
}
