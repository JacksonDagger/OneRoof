package ca.oneroof.oneroof.viewmodel;

import android.util.Log;

import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Transformations;
import androidx.lifecycle.ViewModel;

import java.util.ArrayList;
import java.util.Map;

import ca.oneroof.oneroof.api.AddRoommate;
import ca.oneroof.oneroof.api.BudgetStats;
import ca.oneroof.oneroof.api.BudgetUpdate;
import ca.oneroof.oneroof.api.Debt;
import ca.oneroof.oneroof.api.DebtSummary;
import ca.oneroof.oneroof.api.House;
import ca.oneroof.oneroof.api.IdResponse;
import ca.oneroof.oneroof.api.LoginRequest;
import ca.oneroof.oneroof.api.LoginResponse;
import ca.oneroof.oneroof.api.NetworkLiveData;
import ca.oneroof.oneroof.api.OneRoofAPI;
import ca.oneroof.oneroof.api.OneRoofAPIUtils;
import ca.oneroof.oneroof.api.Payment;
import ca.oneroof.oneroof.api.Purchase;
import ca.oneroof.oneroof.ui.common.ClickCallback;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class HouseViewModel extends ViewModel {
    public final OneRoofAPI api;

    public MutableLiveData<Integer> houseId = new MutableLiveData<>();
    public MutableLiveData<Integer> roommateId = new MutableLiveData<>();
    public MutableLiveData<String> roommateName = new MutableLiveData<>();
    public NetworkLiveData<House> house;
    public NetworkLiveData<ArrayList<Purchase>> purchases;
    public MutableLiveData<Boolean> isHouseLeader = new MutableLiveData<>();
    public NetworkLiveData<BudgetStats> budgetStats;
    public NetworkLiveData<DebtSummary> debtStats;
    public NetworkLiveData<Map<Integer, Integer>> debts;
    public NetworkLiveData<ArrayList<Debt>> detailDebts;

    public HouseViewModel(OneRoofAPI api) {
        this.api = api;

        house = new NetworkLiveData<>(Transformations.map(houseId, api::getHouse));
        purchases = new NetworkLiveData<>(Transformations.map(houseId, api::getPurchases));
        debtStats = new NetworkLiveData<>(OneRoofAPIUtils.doubleTransform(houseId, roommateId, api::getDebtSummary));
        budgetStats = new NetworkLiveData<>(Transformations.map(roommateId, api::getBudgetStats));
        detailDebts = new NetworkLiveData<>(OneRoofAPIUtils.doubleTransform(houseId, roommateId, api::getDebtsDetailed));
    }

    public void postPurchase(Purchase purchase) {
        api.postPurchase(houseId.getValue(), purchase).enqueue(new Callback<IdResponse>() {
            @Override
            public void onResponse(Call<IdResponse> call, Response<IdResponse> response) {
                purchases.refresh();
                budgetStats.refresh();
                debtStats.refresh();
                detailDebts.refresh();
            }

            @Override
            public void onFailure(Call<IdResponse> call, Throwable t) {
                // Empty
            }
        });
    }

    public void patchBudget(BudgetUpdate update) {
        api.patchBudget(roommateId.getValue(), update).enqueue(new Callback() {
            @Override
            public void onResponse(Call call, Response response) {
                budgetStats.refresh();
            }

            @Override
            public void onFailure(Call call, Throwable t) {
                // Empty
            }
        });
    }

    public void patchRoommates(AddRoommate addRoommate) {
        api.patchRoommate(addRoommate).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                // get house data again to show update of new roommate
                house.refresh();
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // Empty
            }
        });
    }

    public void postPayment(int roommate, int amount) {
        Payment p = new Payment();
        p.you = roommateId.getValue();
        p.me = roommate;
        p.amount = amount;
        api.postPayment(p).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                debtStats.refresh();
                detailDebts.refresh();
                budgetStats.refresh();
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // empty
            }
        });
    }

    public void deleteHouse(int houseId) {
        api.deleteHouse(houseId).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                house.refresh();
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                // Empty
            }
        });
    }

    public void doLogin(String token, ClickCallback onHasHouse, ClickCallback onNoHouse) {
        api.postLogin(new LoginRequest(token))
                .enqueue(new Callback<LoginResponse>() {
                    @Override
                    public void onResponse(Call<LoginResponse> call, Response<LoginResponse> response) {
                        if (response.isSuccessful()) {
                            Log.d("OneRoof", "Roommate id: " + response.body().roommateId);
                            Log.d("OneRoof", "House id: " + response.body().houseId);
                            roommateId.setValue(response.body().roommateId);
                            roommateName.setValue(response.body().name);
                            if (response.body().houseId == null) {
                                onNoHouse.click(null);
                            } else {
                                houseId.setValue(response.body().houseId);
                                isHouseLeader.setValue(response.body().roommateId == response.body().admin);
                                onHasHouse.click(null);
                            }
                        } else {
                            Log.d("OneRoof",
                                    "Failure to receive roommate id: " + response.message());
                        }
                    }

                    @Override
                    public void onFailure(Call<LoginResponse> call, Throwable t) {
                        Log.d("OneRoof", "Failure to post FCM token: "
                                + t.getLocalizedMessage());
                        Log.d("OneRoof", "Failed to log in");
                    }
                });
    }
}
