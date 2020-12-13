package ca.oneroof.oneroof.ui;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;

import ca.oneroof.oneroof.R;

// reference: https://guides.codepath.com/android/using-the-recyclerview
public class RoommateNameAdapter extends RecyclerView.Adapter<RoommateNameAdapter.ViewHolder> {
    private ArrayList<String> roommates;

    public class ViewHolder extends RecyclerView.ViewHolder {
        public TextView nameTextView;

        public ViewHolder(View itemView) {
            super(itemView);

            nameTextView = (TextView) itemView.findViewById(R.id.roommate_name);
        }
    }

    public RoommateNameAdapter(ArrayList<String> roommates) {
        this.roommates = roommates;
    }

    @Override
    public RoommateNameAdapter.ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        Context context = parent.getContext();
        LayoutInflater inflater = LayoutInflater.from(context);

        View roommateNameView = inflater.inflate(R.layout.item_roommate_name, parent, false);
        ViewHolder viewHolder = new ViewHolder(roommateNameView);
        return viewHolder;
    }

    @Override
    public void onBindViewHolder(RoommateNameAdapter.ViewHolder holder, int position) {
        String roommate = roommates.get(position);

        TextView textView = holder.nameTextView;
        textView.setText(roommate);
    }

    @Override
    public int getItemCount() {
        return roommates.size();
    }
}
