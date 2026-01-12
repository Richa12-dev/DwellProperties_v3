// src/Redux/Contractor/contractorSlice.js - FIXED VERSION
import { createSlice, createSelector } from "@reduxjs/toolkit";
import {
  getContractorJob,
  acceptContractorJob,
  declineContractorJob,
  getAllContractorJobs,
  getOfferedJobs,
  getUnassignedJobs,
  submitContractorServices,
  createContractorInvoice,
  getContractorInvoice,
} from "./services";

const initialState = {
  jobs: [],
  offeredJobs: [],
  unassignedJobs: [],
  currentJob: null,
  pendingJobs: [],
  loading: false,
  error: null,
  lastUpdated: null,
  appliedFilters: null,
  totalCount: 0,
  servicesUsedForFilter: [],
  services: {
    submitted: [],
    loading: false,
    error: null,
  },
  invoice: {
    loading: false,
    error: null,
    lastCreated: null,
  },
};

const contractorSlice = createSlice({
  name: "contractor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      if (state.services) {
        state.services.error = null;
      }
      if (state.invoice) {
        state.invoice.error = null;
      }
    },
    clearCurrentJob: (state) => {
      state.currentJob = null;
    },
    addPendingJob: (state, { payload }) => {
      if (!state.pendingJobs) state.pendingJobs = [];
      const exists = state.pendingJobs.find(j => j.ticket_id === payload.ticket_id);
      if (!exists) {
        state.pendingJobs.unshift(payload);
      }
    },
    removePendingJob: (state, { payload }) => {
      if (!state.pendingJobs) state.pendingJobs = [];
      state.pendingJobs = state.pendingJobs.filter(j => j.ticket_id !== payload.ticket_id);
    },
    updateJobLocally: (state, { payload }) => {
      const updateInArray = (array) => {
        if (!array) return;
        const index = array.findIndex(j => j.ticket_id === payload.ticket_id);
        if (index !== -1) {
          array[index] = { ...array[index], ...payload };
        }
      };

      updateInArray(state.jobs);
      updateInArray(state.pendingJobs);
      updateInArray(state.offeredJobs);
      updateInArray(state.unassignedJobs);

      if (state.currentJob?.ticket_id === payload.ticket_id) {
        state.currentJob = { ...state.currentJob, ...payload };
      }
    },
    setAppliedFilters: (state, { payload }) => {
      state.appliedFilters = payload;
    },
    clearInvoiceError: (state) => {
      if (state.invoice) {
        state.invoice.error = null;
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // Submit contractor services
      .addCase(submitContractorServices.pending, (state) => {
        if (!state.services) {
          state.services = { submitted: [], loading: false, error: null };
        }
        state.services.loading = true;
        state.services.error = null;
      })
      .addCase(submitContractorServices.fulfilled, (state, { payload }) => {
        if (!state.services) {
          state.services = { submitted: [], loading: false, error: null };
        }
        state.services.loading = false;
        state.services.submitted = payload.services || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(submitContractorServices.rejected, (state, { payload, error }) => {
        if (!state.services) {
          state.services = { submitted: [], loading: false, error: null };
        }
        state.services.loading = false;
        state.services.error = payload || error.message || "Failed to submit services";
      })

      // Get single contractor job
      .addCase(getContractorJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getContractorJob.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentJob = payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getContractorJob.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to fetch job";
      })

      // Get all contractor jobs (with filters)
      .addCase(getAllContractorJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllContractorJobs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.jobs = payload.jobs || [];
        state.totalCount = payload.count || 0;
        state.appliedFilters = payload.filters || null;
        state.servicesUsedForFilter = payload.services_used_for_filter || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getAllContractorJobs.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to fetch jobs";
      })

      // Get offered jobs
      .addCase(getOfferedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOfferedJobs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.offeredJobs = payload.jobs || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getOfferedJobs.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to fetch offered jobs";
      })

      // Get unassigned jobs
      .addCase(getUnassignedJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUnassignedJobs.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.unassignedJobs = payload.jobs || [];
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(getUnassignedJobs.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to fetch unassigned jobs";
      })

      // Accept job
      .addCase(acceptContractorJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(acceptContractorJob.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Ensure arrays exist
        if (!state.jobs) state.jobs = [];
        if (!state.pendingJobs) state.pendingJobs = [];
        if (!state.offeredJobs) state.offeredJobs = [];
        if (!state.unassignedJobs) state.unassignedJobs = [];
        
        const jobIndex = state.jobs.findIndex(j => j.ticket_id === payload.ticket_id);
        if (jobIndex !== -1) {
          state.jobs[jobIndex] = {
            ...state.jobs[jobIndex],
            ...payload,
            status: payload.status || 'OPEN',
            contractor_assignment: {
              ...payload.contractor_assignment,
              state: payload.contractor_assignment?.state || 'ACCEPTED'
            }
          };
        } else {
          state.jobs.unshift(payload);
        }

        // Remove from other arrays
        state.pendingJobs = state.pendingJobs.filter(j => j.ticket_id !== payload.ticket_id);
        state.offeredJobs = state.offeredJobs.filter(j => j.ticket_id !== payload.ticket_id);
        state.unassignedJobs = state.unassignedJobs.filter(j => j.ticket_id !== payload.ticket_id);
        
        if (state.currentJob?.ticket_id === payload.ticket_id) {
          state.currentJob = payload;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(acceptContractorJob.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to accept job";
      })

      // Decline job
      .addCase(declineContractorJob.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(declineContractorJob.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Ensure arrays exist
        if (!state.jobs) state.jobs = [];
        if (!state.pendingJobs) state.pendingJobs = [];
        if (!state.offeredJobs) state.offeredJobs = [];
        if (!state.unassignedJobs) state.unassignedJobs = [];
        
        state.jobs = state.jobs.filter(j => j.ticket_id !== payload.ticket_id);
        state.pendingJobs = state.pendingJobs.filter(j => j.ticket_id !== payload.ticket_id);
        state.offeredJobs = state.offeredJobs.filter(j => j.ticket_id !== payload.ticket_id);
        state.unassignedJobs = state.unassignedJobs.filter(j => j.ticket_id !== payload.ticket_id);
        
        if (state.currentJob?.ticket_id === payload.ticket_id) {
          state.currentJob = null;
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(declineContractorJob.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || "Failed to decline job";
      })

      // ✅ Get Invoice - Update job with invoice data
      .addCase(getContractorInvoice.pending, (state) => {
        // Don't set global loading for invoice fetch
        if (!state.invoice) {
          state.invoice = { loading: false, error: null, lastCreated: null };
        }
      })
      .addCase(getContractorInvoice.fulfilled, (state, { payload }) => {
        if (payload && payload.ticket_id) {
          console.log('✅ Redux: Updating job with invoice data:', payload.ticket_id);
          
          const updateInArray = (array) => {
            if (!array) return;
            const index = array.findIndex(j => j.ticket_id === payload.ticket_id);
            if (index !== -1) {
              console.log('📝 Redux: Found job in array, updating with invoice');
              array[index] = {
                ...array[index],
                invoice: payload.invoice,
                has_invoice: payload.has_invoice
              };
            }
          };

          updateInArray(state.jobs);
          updateInArray(state.pendingJobs);
          updateInArray(state.offeredJobs);
          updateInArray(state.unassignedJobs);
          
          if (state.currentJob?.ticket_id === payload.ticket_id) {
            state.currentJob = {
              ...state.currentJob,
              invoice: payload.invoice,
              has_invoice: payload.has_invoice
            };
          }
        }
      })
      .addCase(getContractorInvoice.rejected, (state, { payload, error }) => {
        console.log('⚠️ Redux: Invoice fetch rejected:', payload || error);
        // Don't set error for 404s (invoice not found)
        if (payload && !payload.includes('not found')) {
          if (!state.invoice) {
            state.invoice = { loading: false, error: null, lastCreated: null };
          }
          state.invoice.error = payload || error.message || "Failed to fetch invoice";
        }
      })

      // Create invoice
      .addCase(createContractorInvoice.pending, (state) => {
        if (!state.invoice) {
          state.invoice = { loading: false, error: null, lastCreated: null };
        }
        state.invoice.loading = true;
        state.invoice.error = null;
      })
      .addCase(createContractorInvoice.fulfilled, (state, { payload }) => {
        if (!state.invoice) {
          state.invoice = { loading: false, error: null, lastCreated: null };
        }
        state.invoice.loading = false;
        state.invoice.lastCreated = payload;
        
        console.log('✅ Redux: Invoice created, updating job:', payload.ticket_id);
        
        // Update the job with invoice info
        const updateInArray = (array) => {
          if (!array) return;
          const index = array.findIndex(j => j.ticket_id === payload.ticket_id);
          if (index !== -1) {
            console.log('📝 Redux: Updating job with new invoice');
            array[index] = {
              ...array[index],
              invoice: payload.invoice,
              has_invoice: true
            };
          }
        };

        updateInArray(state.jobs);
        updateInArray(state.pendingJobs);
        updateInArray(state.offeredJobs);
        updateInArray(state.unassignedJobs);
        
        if (state.currentJob?.ticket_id === payload.ticket_id) {
          state.currentJob = {
            ...state.currentJob,
            invoice: payload.invoice,
            has_invoice: true
          };
        }
        
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(createContractorInvoice.rejected, (state, { payload, error }) => {
        if (!state.invoice) {
          state.invoice = { loading: false, error: null, lastCreated: null };
        }
        state.invoice.loading = false;
        state.invoice.error = payload || error.message || "Failed to create invoice";
        console.error('❌ Redux: Invoice creation failed:', payload || error);
      });
  },
});

export const {
  clearError,
  clearCurrentJob,
  addPendingJob,
  removePendingJob,
  updateJobLocally,
  setAppliedFilters,
  clearInvoiceError,
} = contractorSlice.actions;

const selectContractorState = (state) => state.contractor || {};

export const contractorSelectors = {
  getContractorData: createSelector([selectContractorState], (contractorState) => ({
    loading: contractorState.loading || false,
    jobs: contractorState.jobs || [],
    pendingJobs: contractorState.pendingJobs || [],
    offeredJobs: contractorState.offeredJobs || [],
    unassignedJobs: contractorState.unassignedJobs || [],
    currentJob: contractorState.currentJob,
    lastUpdated: contractorState.lastUpdated,
    error: contractorState.error,
    totalCount: contractorState.totalCount || 0,
    appliedFilters: contractorState.appliedFilters,
    servicesUsedForFilter: contractorState.servicesUsedForFilter || [],
  })),

  getAllJobs: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.jobs || []
  ),

  getOfferedJobs: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.offeredJobs || []
  ),

  getUnassignedJobs: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.unassignedJobs || []
  ),

  getPendingJobs: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.pendingJobs || []
  ),

  getCurrentJob: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.currentJob
  ),

  isLoading: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.loading || false
  ),

  getError: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.error
  ),

  getNewJobsCount: createSelector(
    [selectContractorState],
    (contractorState) => (contractorState.pendingJobs || []).length
  ),

  getTotalCount: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.totalCount || 0
  ),

  getAppliedFilters: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.appliedFilters
  ),

  getServicesData: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.services || { submitted: [], loading: false, error: null }
  ),

  isServicesLoading: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.services?.loading || false
  ),

  getServicesError: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.services?.error
  ),

  getSubmittedServices: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.services?.submitted || []
  ),

  getInvoiceData: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.invoice || { loading: false, error: null, lastCreated: null }
  ),

  isInvoiceLoading: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.invoice?.loading || false
  ),

  getInvoiceError: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.invoice?.error
  ),

  getLastCreatedInvoice: createSelector(
    [selectContractorState],
    (contractorState) => contractorState.invoice?.lastCreated
  ),
};

export default contractorSlice.reducer;
