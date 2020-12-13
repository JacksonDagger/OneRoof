package ca.oneroof.oneroof.ui;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.databinding.DataBindingUtil;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.google.android.material.textfield.TextInputEditText;

import ca.oneroof.oneroof.R;
import ca.oneroof.oneroof.api.BudgetUpdate;
import ca.oneroof.oneroof.databinding.FragmentBudgetBinding;
import ca.oneroof.oneroof.viewmodel.HouseViewModel;

public class BudgetFragment extends Fragment {
    private HouseViewModel viewmodel;
    private TextInputEditText editBudget;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewmodel = new ViewModelProvider(getActivity()).get(HouseViewModel.class);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        super.onCreateView(inflater, container, savedInstanceState);
        FragmentBudgetBinding binding = DataBindingUtil.inflate(inflater,
                R.layout.fragment_budget, container, false);
        binding.setViewmodel(viewmodel);
        binding.setFragment(this);
        binding.setLifecycleOwner(this);

        viewmodel.budgetStats.refresh();

        View view = binding.getRoot();
        editBudget = view.findViewById(R.id.monthly_budget_text_input);
        
        return view;
    }

    public void clickUpdateBudget(View v) {
        try {
            float budget = Float.parseFloat(editBudget.getText().toString());
            int budgetCents = (int) (budget * 100);
            BudgetUpdate update = new BudgetUpdate();
            update.limit = budgetCents;
            viewmodel.patchBudget(update);
        } catch (NumberFormatException e) {
            // Ignore invalid budgets
        }
    }

    public String formatLikelihood(double x) { return String.format("%.0f", x * 100.0) + "%"; }
}
