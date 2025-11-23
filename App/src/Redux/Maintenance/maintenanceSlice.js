// src/redux/slices/Maintenance/maintenanceSlice.js
import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  createMaintenanceRequest,
  getMaintenanceRequests,
  getMaintenanceDetails,
  updateMaintenanceStatus,
} from "./services";

const initialState = {
  maintenanceRequests: [],
  currentRequest: null,
  loading: false,
  error: null,
  totalRequests: 0,
  openRequests: 0,
  closedRequests: 0,
  lastUpdated: null,
};

const maintenanceSlice = createSlice({
  name: "maintenance",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRequest: (state) => {
      state.currentRequest = null;
    },
    updateRequestLocally: (state, { payload }) => {
      const updateInArray = (array) => {
        const index = array.findIndex(
          (r) => r.id === payload.id || r.request_id === payload.request_id
        );
        if (index !== -1) {
          array[index] = { ...array[index], ...payload };
        }
      };

      updateInArray(state.maintenanceRequests);

      if (
        state.currentRequest &&
        (state.currentRequest.id === payload.id ||
          state.currentRequest.request_id === payload.request_id)
      ) {
        state.currentRequest = { ...state.currentRequest, ...payload };
      }
    },
    calculateTotals: (state) => {
      state.totalRequests = state.maintenanceRequests.length;
      state.openRequests = state.maintenanceRequests.filter(
        (r) => r.status !== "Closed" && r.status !== "Resolved"
      ).length;
      state.closedRequests = state.maintenanceRequests.filter(
        (r) => r.status === "Closed" || r.status === "Resolved"
      ).length;
      state.lastUpdated = new Date().toISOString();
    },
  },

  extraReducers: (builder) => {
    builder
      // Create maintenance request
      .addCase(createMaintenanceRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMaintenanceRequest.fulfilled, (state, { payload }) => {
        state.loading = false;
        const newRequest =
          payload.request || payload.maintenanceRequest || payload;
        state.maintenanceRequests.push(newRequest);
        state.totalRequests = state.maintenanceRequests.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(
        createMaintenanceRequest.rejected,
        (state, { payload, error }) => {
          state.loading = false;
          state.error =
            payload || error.message || "Failed to create maintenance request";
        }
      )

      // Get all maintenance requests
      .addCase(getMaintenanceRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaintenanceRequests.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.maintenanceRequests = payload?.items || payload || [];
        state.totalRequests = state.maintenanceRequests.length;
        state.openRequests = state.maintenanceRequests.filter(
          (r) => r.status !== "Closed" && r.status !== "Resolved"
        ).length;
        state.closedRequests = state.maintenanceRequests.filter(
          (r) => r.status === "Closed" || r.status === "Resolved"
        ).length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(
        getMaintenanceRequests.rejected,
        (state, { payload, error }) => {
          state.loading = false;
          state.error =
            payload || error.message || "Failed to fetch maintenance requests";
        }
      )

      // Get maintenance details
      .addCase(getMaintenanceDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMaintenanceDetails.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentRequest = payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getMaintenanceDetails.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || "Failed to fetch maintenance details";
      })

      // Update maintenance status
      .addCase(updateMaintenanceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMaintenanceStatus.fulfilled, (state, { payload }) => {
        state.loading = false;
        const updated =
          payload.request || payload.maintenanceRequest || payload;

        const updateInArray = (array) => {
          const index = array.findIndex(
            (r) => r.id === updated.id || r.request_id === updated.request_id
          );
          if (index !== -1) array[index] = { ...array[index], ...updated };
        };

        updateInArray(state.maintenanceRequests);

        if (
          state.currentRequest &&
          (state.currentRequest.id === updated.id ||
            state.currentRequest.request_id === updated.request_id)
        ) {
          state.currentRequest = { ...state.currentRequest, ...updated };
        }

        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateMaintenanceStatus.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || "Failed to update maintenance status";
      });
  },
});

// ✅ Export actions
export const {
  clearError,
  clearCurrentRequest,
  updateRequestLocally,
  calculateTotals,
} = maintenanceSlice.actions;

// ✅ Selectors
const selectMaintenanceState = (state) => state.maintenance || {};

export const maintenanceSelectors = {
  getMaintenanceData: createSelector([selectMaintenanceState], (maintenanceState) => ({
    loading: maintenanceState.loading || false,
    requests: maintenanceState.maintenanceRequests || [],
    currentRequest: maintenanceState.currentRequest,
    totalRequests: maintenanceState.totalRequests || 0,
    openRequests: maintenanceState.openRequests || 0,
    closedRequests: maintenanceState.closedRequests || 0,
    lastUpdated: maintenanceState.lastUpdated,
    error: maintenanceState.error,
  })),

  getAllRequests: createSelector(
    [selectMaintenanceState],
    (maintenanceState) => maintenanceState.maintenanceRequests || []
  ),

  getCurrentRequest: createSelector(
    [selectMaintenanceState],
    (maintenanceState) => maintenanceState.currentRequest
  ),

  isLoading: createSelector(
    [selectMaintenanceState],
    (maintenanceState) => maintenanceState.loading || false
  ),

  getError: createSelector(
    [selectMaintenanceState],
    (maintenanceState) => maintenanceState.error
  ),

  getOpenRequests: createSelector(
    [selectMaintenanceState],
    (maintenanceState) =>
      (maintenanceState.maintenanceRequests || []).filter(
        (r) => r.status !== "Closed" && r.status !== "Resolved"
      )
  ),
};

// ✅ Export reducer (only ONE export)
export default maintenanceSlice.reducer;
