package ca.oneroof.oneroof.viewmodel;

import android.util.Log;

import androidx.annotation.Nullable;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.Observer;
import androidx.lifecycle.Transformations;
import androidx.lifecycle.ViewModel;

import ca.oneroof.oneroof.api.ApiResponse;
import ca.oneroof.oneroof.api.House;
import ca.oneroof.oneroof.api.LoginRequest;
import ca.oneroof.oneroof.api.NetworkLiveData;
import ca.oneroof.oneroof.api.OneRoofAPI;

public class HouseViewModel extends ViewModel {
    private final OneRoofAPI api;

    public MutableLiveData<Integer> houseId = new MutableLiveData<>();
    public MutableLiveData<Integer> roommateId = new MutableLiveData<>();
    public NetworkLiveData<House> house;

    public HouseViewModel(OneRoofAPI api) {
        this.api = api;

        house = new NetworkLiveData<>(Transformations.map(houseId, id -> {
            return api.getHouse(id);
        }));
    }
}
