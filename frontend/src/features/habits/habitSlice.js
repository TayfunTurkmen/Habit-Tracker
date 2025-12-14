import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

// Helper function to get token from localStorage
const getToken = () => {
  const userInfo = localStorage.getItem('userInfo');
  return userInfo ? JSON.parse(userInfo).token : null;
};

// Async thunks
export const createHabit = createAsyncThunk(
  'habits/createHabit',
  async (habitData, { rejectWithValue }) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post('/api/v1/habits', habitData, config);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create habit'
      );
    }
  }
);

export const getHabits = createAsyncThunk(
  'habits/getHabits',
  async (_, { rejectWithValue }) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get('/api/v1/habits', config);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch habits'
      );
    }
  }
);

export const updateHabit = createAsyncThunk(
  'habits/updateHabit',
  async ({ id, habitData }, { rejectWithValue }) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        `/api/v1/habits/${id}`,
        habitData,
        config
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update habit'
      );
    }
  }
);

export const deleteHabit = createAsyncThunk(
  'habits/deleteHabit',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/v1/habits/${id}`, config);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete habit'
      );
    }
  }
);

export const toggleHabitCompletion = createAsyncThunk(
  'habits/toggleHabitCompletion',
  async (id, { rejectWithValue }) => {
    try {
      const token = getToken();
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.put(
        `/api/v1/habits/${id}/complete`,
        {},
        config
      );
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update habit completion'
      );
    }
  }
);

const initialState = {
  habits: [],
  loading: false,
  error: null,
  success: false,
};

const habitSlice = createSlice({
  name: 'habits',
  initialState,
  reducers: {
    resetHabitState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    // Create Habit
    builder.addCase(createHabit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createHabit.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.habits.push(payload);
      toast.success('Habit created successfully');
    });
    builder.addCase(createHabit.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      toast.error(payload);
    });

    // Get Habits
    builder.addCase(getHabits.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getHabits.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.habits = payload;
    });
    builder.addCase(getHabits.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      toast.error(payload);
    });

    // Update Habit
    builder.addCase(updateHabit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateHabit.fulfilled, (state, { payload }) => {
      state.loading = false;
      state.success = true;
      state.habits = state.habits.map((habit) =>
        habit._id === payload._id ? payload : habit
      );
      toast.success('Habit updated successfully');
    });
    builder.addCase(updateHabit.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      toast.error(payload);
    });

    // Delete Habit
    builder.addCase(deleteHabit.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteHabit.fulfilled, (state, { payload: habitId }) => {
      state.loading = false;
      state.success = true;
      state.habits = state.habits.filter((habit) => habit._id !== habitId);
      toast.success('Habit deleted successfully');
    });
    builder.addCase(deleteHabit.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      toast.error(payload);
    });

    // Toggle Habit Completion
    builder.addCase(toggleHabitCompletion.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(
      toggleHabitCompletion.fulfilled,
      (state, { payload: updatedHabit }) => {
        state.loading = false;
        state.habits = state.habits.map((habit) =>
          habit._id === updatedHabit._id ? updatedHabit : habit
        );
      }
    );
    builder.addCase(toggleHabitCompletion.rejected, (state, { payload }) => {
      state.loading = false;
      state.error = payload;
      toast.error(payload);
    });
  },
});

export const { resetHabitState } = habitSlice.actions;
export default habitSlice.reducer;
