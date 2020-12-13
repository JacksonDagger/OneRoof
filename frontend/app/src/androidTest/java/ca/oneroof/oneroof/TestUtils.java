package ca.oneroof.oneroof;

import android.content.Intent;
import android.view.View;
import android.widget.TextView;

import androidx.test.core.app.ActivityScenario;
import androidx.test.core.app.ApplicationProvider;
import androidx.test.espresso.UiController;
import androidx.test.espresso.ViewAction;
import androidx.test.espresso.ViewInteraction;

import org.hamcrest.Matcher;

import ca.oneroof.oneroof.ui.MainActivity;

import static androidx.test.espresso.Espresso.onData;
import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.replaceText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.contrib.RecyclerViewActions.scrollToPosition;
import static androidx.test.espresso.matcher.ViewMatchers.hasDescendant;
import static androidx.test.espresso.matcher.ViewMatchers.isAssignableFrom;
import static androidx.test.espresso.matcher.ViewMatchers.isDisplayed;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static org.hamcrest.Matchers.allOf;
import static org.hamcrest.Matchers.anything;
import static android.os.SystemClock.sleep;

public class TestUtils {
    public static String getText(ViewInteraction matcher) {
        final String[] result = new String[1];
        matcher.perform(new ViewAction() {
            @Override
            public Matcher<View> getConstraints() {
                return isAssignableFrom(TextView.class);
            }

            @Override
            public String getDescription() {
                return "Get text";
            }

            @Override
            public void perform(UiController uiController, View view) {
                result[0] = ((TextView) view).getText().toString();
            }
        });
        return result[0];
    }

    /**
     * Creates a house user user1, then invites user2 to the house with the invite code.
     */
    public static void createHouseInviteOther(String houseName, String user1, String user2) {
        ActivityScenario<MainActivity> scenario;
        scenario = loginAs(user1);

        // Make sure we don't have a house.
        onView(withId(R.id.no_house_header))
                .check(matches(isDisplayed()));

        // Create a new house.
        onView(withId(R.id.create_house_button))
                .perform(click());
        onView(withId(R.id.house_name))
                .perform(replaceText(houseName));
        onView(withText("Create"))
                .perform(click());
        sleep(1000);

        // We should be in the house right now.  Check that we see a list of purchases.
        onView(withId(R.id.house_purchases))
                .check(matches(isDisplayed()));
        // No debts yet
        onView(withId(R.id.text_owe))
                .check(matches(withText("$0.00")));
        onView(withId(R.id.text_are_owed))
                .check(matches(withText("$0.00")));

        scenario.close();

        loginAs(user2);

        // Record our invite code.
        String inviteCode;
        onView(withId(R.id.invite_code))
                .check(matches(isDisplayed()));
        inviteCode = getText(onView(withId(R.id.invite_code)));

        scenario.close();

        // Go back to the other user, to invite user2
        loginAs(user1);

        onView(withId(R.id.action_profile))
                .perform(click());
        onView(withId(R.id.house_settings_btn))
                .perform(click());

        // Type in the invite code, and add them
        onView(withId(R.id.invite_code))
                .perform(replaceText(inviteCode));

        onView(withId(R.id.add_roommate_btn))
                .perform(click());
        sleep(1000);

        // Check that we're back in the home page
        onView(withId(R.id.house_purchases))
                .check(matches(isDisplayed()));

        scenario.close();
    }

    public static ActivityScenario<MainActivity> loginAs(String user) {
        Intent intent = new Intent(ApplicationProvider.getApplicationContext(), MainActivity.class);
        intent.putExtra("authDisabled", true);
        intent.putExtra("authTestUser", user);
        ActivityScenario<MainActivity> scenario = ActivityScenario.launch(intent);

        // Check that a login button exists.
        onView(withId(R.id.login_button))
                .check(matches(isDisplayed()));

        // Click login button with the mock login setup.
        onView(withId(R.id.login_button))
                .perform(click());
        sleep(1000);

        return scenario;
    }

    /**
     * Have user1 make a purchase for $10.00 + user2Cents*100, with the shared part being assigned
     * to user2.
     */
    public static void createSharedPurchase(String user1, String user2, int user2Cents, String memo) {
        // Make a purchase as user1, shared between user1 and 2
        ActivityScenario<MainActivity> scenario = loginAs(user1);

        // Hit the add purchase button.
        onView(withId(R.id.add_purchase_button))
                .perform(click());
        sleep(1000);

        // Type "10" into the first division.
        onData(anything())
                .inAdapterView(withId(R.id.division_list)).atPosition(0)
                .onChildView(withId(R.id.division_amount))
                .perform(replaceText("10"));

        onView(withId(R.id.purchase_total))
                .check(matches(withText("10.00")));

        // Add a division.
        onView(withId(R.id.add_division_btn))
                .perform(click());

        // Type "20" into the second division.
        onData(anything())
                .inAdapterView(withId(R.id.division_list)).atPosition(1)
                .onChildView(withId(R.id.division_amount))
                .perform(replaceText(DollarUtils.formatDollars(user2Cents)));

        // Make the second user owe us for the 20 dollars.
        onData(anything())
                .inAdapterView(withId(R.id.division_list)).atPosition(1)
                .onChildView(allOf(withId(R.id.roommate_toggle), withText(user2)))
                .perform(click());
        sleep(1000);

        // Total should now read 30.
        onView(withId(R.id.purchase_total))
                .check(matches(withText(DollarUtils.formatDollars(1000 + user2Cents))));

        onView(withId(R.id.memo_text))
                .perform(replaceText(memo));

        // Make the purchase.
        onView(withId(R.id.action_save_purchase))
                .perform(click());
        sleep(1000);

        scenario.close();

        scenario = loginAs(user2);

        // Make sure the new purchase shows up on the list for the other user.
        onView(withId(R.id.house_purchases))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.purchase_purchaser), withText(user1)))));
        onView(withId(R.id.house_purchases))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.purchase_amount),
                        withText("$" + DollarUtils.formatDollars(1000 + user2Cents))))));
        onView(withId(R.id.house_purchases))
                .perform(scrollToPosition(0))
                .check(matches(hasDescendant(allOf(withId(R.id.purchase_memo), withText(memo)))));

        scenario.close();
    }

    public static void checkStats(String budget, String monthly_spending, String avg_purchase_price,
                                  String num_purchases, String most_expensive_purchase) {
        onView(withId(R.id.current_monthly_budget))
                .check(matches(withText(budget)));
        onView(withId(R.id.monthly_spending_data))
                .check(matches(withText(monthly_spending)));
        onView(withId(R.id.avg_purchase_price_data))
                .check(matches(withText(avg_purchase_price)));
        onView(withId(R.id.num_purchases_data))
                .check(matches(withText(num_purchases)));
        onView(withId(R.id.most_expensive_purchase_data))
                .check(matches(withText(most_expensive_purchase)));
    }

    public static void setBudget(String newBudget) {
        // enter a new budget and click on update
        onView(withId(R.id.monthly_budget_text_input))
                .perform(replaceText(newBudget));
        onView(withId(R.id.update_budget_btn))
                .perform(click());
        sleep(1000);
    }
}
