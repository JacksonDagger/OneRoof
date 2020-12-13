package ca.oneroof.oneroof.ui;

import androidx.test.core.app.ActivityScenario;
import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.Random;

import ca.oneroof.oneroof.R;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;
import static ca.oneroof.oneroof.TestUtils.createHouseInviteOther;
import static ca.oneroof.oneroof.TestUtils.loginAs;

@RunWith(AndroidJUnit4.class)
public class InviteTests {

    // To run this test, run the backend with AUTH_DISABLED=1.
    @Test
    public void inviteTest() {
        // Make a random user for this test.  User1 with invite User2.
        Random random = new Random();
        String user1 = "User1" + random.nextInt();
        String user2 = "User2" + random.nextInt();

        // Do the invite.
        createHouseInviteOther("Test house", user1, user2);

        // Check that the invite worked.
        ActivityScenario<MainActivity> scenario = loginAs(user2);

        onView(withId(R.id.action_profile))
                .perform(click());
        onView(withId(R.id.house_name))
                .check(matches(withText("Test house")));

        scenario.close();
    }

}
