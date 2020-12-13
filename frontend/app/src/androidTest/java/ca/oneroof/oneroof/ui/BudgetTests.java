package ca.oneroof.oneroof.ui;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Random;

import ca.oneroof.oneroof.R;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static ca.oneroof.oneroof.TestUtils.checkStats;
import static ca.oneroof.oneroof.TestUtils.createHouseInviteOther;
import static ca.oneroof.oneroof.TestUtils.createSharedPurchase;
import static ca.oneroof.oneroof.TestUtils.loginAs;
import static ca.oneroof.oneroof.TestUtils.setBudget;

@RunWith(AndroidJUnit4.class)
public class BudgetTests {

    // To run this test, run the backend with AUTH_DISABLED=1.
    @Test
    public void budgetTest() {
        // create random users for the test
        Random random = new Random();
        String user1 = "User1" + random.nextInt();
        String user2 = "User2" + random.nextInt();

        // create new house for the user
        createHouseInviteOther("Test house", user1, user2);

        // log in and navigate to budget page
        ActivityScenario<MainActivity> scenario = loginAs(user1);

        onView(withId(R.id.action_profile))
                .perform(click());
        onView(withId(R.id.budget_btn))
                .perform(click());

        // since this is a new user, check that no monthly budget is set yet (and all stats are 0)
        // starting budget is automatically set to $10.00
        checkStats("$10.00", "$0.00", "$0.00",
                "0", "$0.00");

        // then, set a new monthly budget and check that the display is updated
        // we have no purchases, so the stats should still all be 0
        setBudget("125.00");
        checkStats("$125.00", "$0.00", "$0.00",
                "0", "$0.00");
        scenario.close();

        // now, add a new purchase shared between user1 and user2 and check the stats for user1
        createSharedPurchase(user1, user2, 2000, "test purchase 1");
        scenario = loginAs(user1);

        onView(withId(R.id.action_profile))
                .perform(click());
        onView(withId(R.id.budget_btn))
                .perform(click());

        checkStats("$125.00", "$10.00", "$10.00",
                "1", "$10.00");
        scenario.close();

        // have user2 add a purchase and check user1's stats
        createSharedPurchase(user2, user1, 2000, "test purchase 2");

        scenario = loginAs(user1);

        onView(withId(R.id.action_profile))
                .perform(click());
        onView(withId(R.id.budget_btn))
                .perform(click());

        checkStats("$125.00", "$30.00", "$15.00",
                "2", "$20.00");

        // try to change budget to -1: budget shouldn't change
        setBudget("budget");
        checkStats("$125.00", "$30.00", "$15.00",
                "2", "$20.00");

        // try to change the budget to a string of characters: budget shouldn't change
        setBudget("budget");
        checkStats("$125.00", "$30.00", "$15.00",
                "2", "$20.00");
    }
}
