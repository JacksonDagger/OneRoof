package ca.oneroof.oneroof.ui;

import org.junit.Test;

import java.util.Random;

import static ca.oneroof.oneroof.TestUtils.createHouseInviteOther;
import static ca.oneroof.oneroof.TestUtils.createSharedPurchase;

public class PurchaseTest {
    // To run this test, run the backend with AUTH_DISABLED=1.
    @Test
    public void purchaseTest() {
        // Make a random user for this test.  User1 with invite User2.
        Random random = new Random();
        String user1 = "User1" + random.nextInt();
        String user2 = "User2" + random.nextInt();

        createHouseInviteOther("Purchase house", user1, user2);
        createSharedPurchase(user1, user2, 2000, "Test purchase");
    }
}
