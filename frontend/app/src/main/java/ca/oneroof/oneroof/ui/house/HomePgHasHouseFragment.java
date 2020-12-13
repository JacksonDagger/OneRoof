package ca.oneroof.oneroof.ui.house;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.databinding.DataBindingUtil;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import ca.oneroof.oneroof.R;
import ca.oneroof.oneroof.databinding.FragmentHomePgHasHouseBinding;
import ca.oneroof.oneroof.viewmodel.HouseViewModel;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link HomePgHasHouseFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class HomePgHasHouseFragment extends Fragment {
    private HouseViewModel viewmodel;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewmodel = new ViewModelProvider(getActivity()).get(HouseViewModel.class);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);
        ((AppCompatActivity) getActivity()).getSupportActionBar().show();
        FragmentHomePgHasHouseBinding binding = DataBindingUtil.inflate(inflater,
                R.layout.fragment_home_pg_has_house, container, false);
        binding.setViewmodel(viewmodel);
        binding.setFragment(this);
        binding.setLifecycleOwner(this);

        PurchaseListAdapter purchaseListAdapter = new PurchaseListAdapter(p -> {

        });
        RecyclerView purchaseRecycler = (RecyclerView) binding.getRoot().findViewById(R.id.house_purchases);
        purchaseRecycler.setAdapter(purchaseListAdapter);
        purchaseRecycler.setLayoutManager(new LinearLayoutManager(getContext()));
        purchaseListAdapter.observe(getViewLifecycleOwner(), viewmodel.purchases.data);

        setHasOptionsMenu(true);
        AppCompatActivity appCompatActivity = (AppCompatActivity) getActivity();
        viewmodel.house.data.observe(getViewLifecycleOwner(), r -> {
            if (r.data != null) {
                appCompatActivity.getSupportActionBar().setSubtitle(r.data.name);
            }
        });

        View view = binding.getRoot();
        return view;
    }

    public void clickAddPurchase(View v) {
        Navigation.findNavController(v)
                .navigate(HomePgHasHouseFragmentDirections.actionHomePgHasHouseFragmentToAddPurchaseFragment());
    }

    public void clickDebts(View v) {
        Navigation.findNavController(v)
                .navigate(HomePgHasHouseFragmentDirections.actionHomePgHasHouseFragmentToDebtSummaryFragment());
    }

    @Override
    public void onCreateOptionsMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.menu_house, menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_profile) {
            Navigation.findNavController(getView())
                    .navigate(HomePgHasHouseFragmentDirections.actionHomePgHasHouseFragmentToHouseLeaderProfileFragment());
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}
