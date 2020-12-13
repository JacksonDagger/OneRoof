package ca.oneroof.oneroof.ui.common;

import android.view.ViewGroup;

import androidx.annotation.NonNull;
import androidx.databinding.ViewDataBinding;
import androidx.lifecycle.LifecycleOwner;
import androidx.lifecycle.LiveData;
import androidx.recyclerview.widget.RecyclerView;

import org.jetbrains.annotations.NotNull;

import java.util.ArrayList;
import java.util.List;

import ca.oneroof.oneroof.api.Resource;

/**
 * Translation of the suggested class found in the Android Architecture Components samples.
 *
 * Takes a type T, of the items in the list, and a type V, of the generated view binding.
 */
public abstract class DataBoundListAdapter<T, V extends ViewDataBinding>
    extends RecyclerView.Adapter<DataBoundViewHolder<V>> {

    private List<T> items;

    @Override
    public final DataBoundViewHolder<V> onCreateViewHolder(@NotNull ViewGroup parent, int viewType) {
        V binding = createBinding(parent);
        return new DataBoundViewHolder<>(binding);
    }

    @Override
    public void onBindViewHolder(@NonNull DataBoundViewHolder<V> holder, int position) {
        bind(holder.binding, items.get(position));
        holder.binding.executePendingBindings();
    }

    @Override
    public int getItemCount() {
        return items == null ? 0 : items.size();
    }

    public void replace(List<T> update) {
        items = update;
        notifyDataSetChanged();
    }

    public void observe(LifecycleOwner owner, LiveData<Resource<ArrayList<T>>> data) {
        data.observe(owner, d -> {
            if (d.isSuccess()) {
                replace(d.data);
            }
        });
    }

    protected abstract V createBinding(ViewGroup parent);
    protected abstract void bind(V binding, T item);
}
