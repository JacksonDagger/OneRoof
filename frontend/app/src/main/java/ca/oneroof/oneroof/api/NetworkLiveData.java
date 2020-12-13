package ca.oneroof.oneroof.api;

import android.util.Log;

import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class NetworkLiveData<R> {
    private MutableLiveData<Resource<R>> data_ = new MutableLiveData<>();
    public LiveData<Resource<R>> data = data_;

    protected LiveData<Call<R>> calls;

    public NetworkLiveData(LiveData<Call<R>> calls) {
        this.calls = calls;

        calls.observeForever(call -> refresh());

        refresh();
    }

    public void refresh() {
        data_.setValue(new Resource<>());
        Call<R> call = calls.getValue();
        if (call != null) {
            call = call.clone();
            call.enqueue(new Callback<R>() {
                @Override
                public void onResponse(Call<R> call, Response<R> response) {
                    if (response.isSuccessful()) {
                        data_.setValue(new Resource<>(response.body()));
                    } else {
                        Log.d("OneRoof", "Unsuccessful request: " + response.message());
                        data_.setValue(new Resource<>(response.message()));
                    }
                }

                @Override
                public void onFailure(Call<R> call, Throwable t) {
                    Log.d("OneRoof", "Failed request: " + t.getMessage());
                    data_.setValue(new Resource<>(t.getMessage()));
                }
            });
        }
    }
}
