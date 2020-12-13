package ca.oneroof.oneroof.ui;

import androidx.test.core.app.ActivityScenario;

import org.junit.Test;

import java.util.Random;

import ca.oneroof.oneroof.R;

import static android.os.SystemClock.sleep;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.contrib.RecyclerViewActions.scrollToPosition;
import static androidx.test.espresso.matcher.ViewMatchers.hasDescendant;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static ca.oneroof.oneroof.TestUtils.createHouseInviteOther;
import static ca.oneroof.oneroof.TestUtils.createSharedPurchase;
import static ca.oneroof.oneroof.TestUtils.loginAs;
import static org.hamcrest.Matchers.allOf;

public class DebtTest {
    // To run this test, run the backend with AUTH_DISABLED=1.
    @Test
    public void debtTest() {
        // Make a random user for this test.  User1 will invite User2.
        Random random = new Random();
        String user1 = "User1" + random.nextInt() % 100;
        String user2 = "User2" + random.nextInt() % 100;

        createHouseInviteOther("Debt house", user1, user2);

        // Make sure there's no debt to begin with
        ActivityScenario<MainActivity> scenario = loginAs(user1);
        onView(withId(R.id.text_are_owed))
                .check(matches(withText("$0.00")));
        onView(withId(R.id.text_owe))
                .check(matches(withText("$0.00")));
        scenario.close();

        createSharedPurchase(user1, user2, 10000, "Test purchase for debts");

        // Make sure user1 is owed 100.00, and user2 owes 100.00
        scenario = loginAs(user1);

        onView(withId(R.id.text_are_owed))
                .check(matches(withText("$100.00")));
        onView(withId(R.id.text_owe))
                .check(matches(withText("$0.00")));

        onView(withId(R.id.debt_summary_button))
                .perform(click());

        // Check that the debt owed is from correct person.
        onView(withId(R.id.debt_list))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.debt_roommate_name), withText(user2)))));
        // Check that it is actually owed.
        onView(withId(R.id.debt_list))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.debt_descriptor), withText("owes you")))));
        // Check that it the correct amount.
        onView(withId(R.id.debt_list))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.debt_amount), withText("$100.00")))));

        // Forgive half of it
        onView(withId(R.id.debt_pay_button))
                .perform(click());

        onView(withId(R.id.debt_amount))
                .perform(replaceText("50"));
        onView(withText("Forgive"))
                .perform(click());
        sleep(1000);

        scenario.close();

        // Check that half of it is actually forgiven.
        scenario = loginAs(user2);

        onView(withId(R.id.text_are_owed))
                .check(matches(withText("$0.00")));
        onView(withId(R.id.text_owe))
                .check(matches(withText("$50.00")));

        scenario.close();
    }
}
