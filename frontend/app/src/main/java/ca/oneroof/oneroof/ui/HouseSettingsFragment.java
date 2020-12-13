package ca.oneroof.oneroof.ui;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;

import androidx.databinding.DataBindingUtil;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.navigation.Navigation;

import com.google.android.material.textfield.TextInputEditText;

import ca.oneroof.oneroof.R;
import ca.oneroof.oneroof.api.AddRoommate;
import ca.oneroof.oneroof.databinding.FragmentHouseSettingsBinding;
import ca.oneroof.oneroof.viewmodel.HouseViewModel;

public class HouseSettingsFragment extends Fragment {
    private HouseViewModel viewmodel;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        viewmodel = new ViewModelProvider(getActivity()).get(HouseViewModel.class);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {
        FragmentHouseSettingsBinding binding = DataBindingUtil.inflate(inflater,
                R.layout.fragment_house_settings, container, false);
        binding.setFragment(this);
        binding.setViewmodel(viewmodel);
        binding.setLifecycleOwner(this);
        View view = binding.getRoot();

        // for invite code input
        TextInputEditText inviteCodeInput = view.findViewById(R.id.invite_code);

        Button addRoommateBtn = view.findViewById(R.id.add_roommate_btn);
        addRoommateBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                AddRoommate addRoommate = new AddRoommate();
                try {
                    addRoommate.inviteCode = Integer.parseInt(inviteCodeInput.getText().toString());
                } catch (Exception e) {
                    // ignore invalid invites
                    return;
                }
                viewmodel.patchRoommates(addRoommate);
                Navigation.findNavController(view).navigate(HouseSettingsFragmentDirections.actionHouseSettingsFragmentToHomePgHasHouseFragment());
            }
        });

        return view;
    }

    public void clickDelete(View v) {
        AlertDialog.Builder builder = new AlertDialog.Builder(getContext());
        builder.setTitle("Are you sure you want to delete the house?");

        // get confirmation before actually deleting
        builder.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) {
                // delete house, and direct user to home screen to create or join a new house
                viewmodel.deleteHouse(viewmodel.houseId.getValue());
                Navigation.findNavController(v)
                        .navigate(HouseSettingsFragmentDirections.actionHouseSettingsFragmentToLoginFragment());
            }
        });

        builder.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialogInterface, int i) { dialogInterface.cancel(); }
        });

        builder.show();
    }

}