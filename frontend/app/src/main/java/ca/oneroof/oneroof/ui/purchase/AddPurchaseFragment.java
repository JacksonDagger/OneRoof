package ca.oneroof.oneroof.ui.purchase;

import android.app.Activity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.ListView;

import androidx.annotation.NonNull;
import androidx.databinding.DataBindingUtil;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import java.util.ArrayList;

import ca.oneroof.oneroof.R;
import ca.oneroof.oneroof.api.Division;
import ca.oneroof.oneroof.api.Purchase;
import ca.oneroof.oneroof.databinding.FragmentAddPurchaseBinding;
import ca.oneroof.oneroof.viewmodel.HouseViewModel;

/**
 * A simple {@link Fragment} subclass.
 * Use the {@link AddPurchaseFragment#newInstance} factory method to
 * create an instance of this fragment.
 */
public class AddPurchaseFragment extends Fragment {
    public MutableLiveData<Integer> totalAmount = new MutableLiveData<>(0);
    private HouseViewModel viewmodel;
    private EditText memoText;
    private ArrayList<DivisionEdit> divisions = new ArrayList<>();
    private DivisionEditAdapter divisionEditAdapter;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        viewmodel = new ViewModelProvider(getActivity()).get(HouseViewModel.class);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);
        FragmentAddPurchaseBinding binding = DataBindingUtil.inflate(inflater,
                R.layout.fragment_add_purchase, container, false);
        binding.setViewmodel(viewmodel);
        binding.setFragment(this);
        binding.setLifecycleOwner(this);

        setHasOptionsMenu(true);

        View view = binding.getRoot();

        memoText = view.findViewById(R.id.memo_text);

        DivisionEdit divEdit = new DivisionEdit(
                viewmodel.house.data.getValue().data.roommateNames,
                viewmodel.house.data.getValue().data.roommates);
        divEdit.roommateEnables.set(viewmodel.house.data.getValue().data.roommates.indexOf(
                viewmodel.roommateId.getValue()
        ), true);
        divisions.add(divEdit);

        ListView divisionList = view.findViewById(R.id.division_list);
        divisionEditAdapter = new DivisionEditAdapter(getContext(), R.layout.item_division_edit, divisions, totalAmount);
        divisionList.setAdapter(divisionEditAdapter);

        return view;
    }

    public void clickAddDivision(View v) {
        divisionEditAdapter.add(new DivisionEdit(
                viewmodel.house.data.getValue().data.roommateNames,
                viewmodel.house.data.getValue().data.roommates));
    }

    public void clickSavePurchase() {
        InputMethodManager inputMethodManager = (InputMethodManager)
                getActivity().getSystemService(Activity.INPUT_METHOD_SERVICE);
        inputMethodManager.hideSoftInputFromWindow(getView().getWindowToken(), 0);

        Purchase purchase = new Purchase();
        purchase.memo = memoText.getText().toString();
        purchase.purchaser = viewmodel.roommateId.getValue();
        purchase.divisions = new ArrayList<>();
        purchase.amount = totalAmount.getValue();

        for (DivisionEdit edit : divisions) {
            Division division = new Division();
            division.amount = edit.amount;
            division.roommates = new ArrayList<>();
            for (int i = 0; i < edit.roommateEnables.size(); i++) {
                if (edit.roommateEnables.get(i)) {
                    division.roommates.add(edit.roommates.get(i));
                }
            }
            purchase.divisions.add(division);
        }

        viewmodel.postPurchase(purchase);

        Navigation.findNavController(getView())
                .popBackStack();
    }

    @Override
    public void onCreateOptionsMenu(@NonNull Menu menu, @NonNull MenuInflater inflater) {
        super.onCreateOptionsMenu(menu, inflater);
        inflater.inflate(R.menu.menu_add_purchase, menu);
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        if (item.getItemId() == R.id.action_save_purchase) {
            clickSavePurchase();
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}