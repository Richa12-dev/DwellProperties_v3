// propertiesSlice.js - Fixed version with memoized selectors
import { createSlice, createSelector } from '@reduxjs/toolkit';
import {
  getProperties,
  getLandlordProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getTenantProperties,
  getTenantById,
} from './services';

const initialState = {
  properties: [],
  landlordProperties: [],
  tenantProperties: [],
  currentProperty: null,
  currentTenant: null,
  loading: false,
  tenantLoading: false,
  error: null,
  totalProperties: 0,
  totalUnits: 0,
  occupiedUnits: 0,
  vacantUnits: 0,
};

const propertiesSlice = createSlice({
  name: 'properties',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentProperty: (state) => {
      state.currentProperty = null;
    },
    clearCurrentTenant: (state) => {
      state.currentTenant = null;
    },

    updatePropertyLocally: (state, action) => {
      const updateProperty = (properties, payload) => {
        const index = properties.findIndex(
          (p) => p.id === payload.id || p.ID === payload.id
        );
        if (index !== -1) {
          properties[index] = { ...properties[index], ...payload };
        }
      };

      updateProperty(state.properties, action.payload);
      updateProperty(state.landlordProperties, action.payload);
    },

    calculateTotals: (state) => {
      state.totalProperties = state.landlordProperties.length;
      state.totalUnits = state.landlordProperties.reduce(
        (acc, p) => acc + (parseInt(p.bedrooms) || 1),
        0
      );
      state.occupiedUnits = state.landlordProperties.reduce(
        (acc, p) => acc + (p.is_available ? 0 : 1),
        0
      );
      state.vacantUnits = state.totalUnits - state.occupiedUnits;
    },
  },

  extraReducers: (builder) => {
    builder
      // ------------------------------------------------------
      // GET PROPERTIES
      // ------------------------------------------------------
      .addCase(getProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.properties = payload;

        state.totalProperties = payload.length;
        state.totalUnits = payload.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = payload.reduce(
          (acc, p) => acc + (p.is_available ? 0 : 1),
          0
        );
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(getProperties.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to load properties';
      })

      // ------------------------------------------------------
      // GET LANDLORD PROPERTIES
      // ------------------------------------------------------
      .addCase(getLandlordProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLandlordProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.landlordProperties = payload;

        state.totalProperties = payload.length;
        state.totalUnits = payload.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = payload.reduce(
          (acc, p) => acc + (p.is_available ? 0 : 1),
          0
        );
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(getLandlordProperties.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to load landlord properties';
      })

      // ------------------------------------------------------
      // GET SINGLE PROPERTY
      // ------------------------------------------------------
      .addCase(getProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.currentProperty = payload;
      })
      .addCase(getProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to load property';
      })

      // ------------------------------------------------------
      // CREATE PROPERTY
      // ------------------------------------------------------
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        const newProperty = payload.property || payload;

        state.properties.push(newProperty);
        state.landlordProperties.push(newProperty);

        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (p.is_available ? 0 : 1),
          0
        );
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(createProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to create property';
      })

      // ------------------------------------------------------
      // UPDATE PROPERTY
      // ------------------------------------------------------
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        const updatedProperty = payload.property || payload;

        const updateArray = (arr) => {
          const index = arr.findIndex(
            (p) => p.propertyId === updatedProperty.propertyId
          );
          if (index !== -1) arr[index] = updatedProperty;
        };

        updateArray(state.properties);
        updateArray(state.landlordProperties);

        if (
          state.currentProperty &&
          state.currentProperty.propertyId === updatedProperty.propertyId
        ) {
          state.currentProperty = updatedProperty;
        }

        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (p.is_available ? 0 : 1),
          0
        );
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(updateProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to update property';
      })

      // ------------------------------------------------------
      // GET TENANT RENTED PROPERTIES
      // ------------------------------------------------------
      .addCase(getTenantProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTenantProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.tenantProperties = payload;

        state.totalProperties = payload.length;
        state.totalUnits = payload.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = payload.filter(
          (p) => p.availability === 'occupied'
        ).length;
        state.vacantUnits = 0;
      })
      .addCase(getTenantProperties.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to load tenant properties';
      })

      // ------------------------------------------------------
      // DELETE PROPERTY
      // ------------------------------------------------------
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, { payload }) => {
        state.loading = false;

        const propertyId = payload.propertyId;

        state.properties = state.properties.filter(
          (p) => p.propertyId !== propertyId
        );
        state.landlordProperties = state.landlordProperties.filter(
          (p) => p.propertyId !== propertyId
        );

        if (state.currentProperty?.propertyId === propertyId) {
          state.currentProperty = null;
        }

        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (parseInt(p.bedrooms) || 1),
          0
        );
        state.occupiedUnits = state.landlordProperties.reduce(
          (acc, p) => acc + (p.is_available ? 0 : 1),
          0
        );
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(deleteProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error =
          payload || error.message || 'Failed to delete property';
      })

      // ------------------------------------------------------
      // ⭐ GET TENANT BY ID (PLACED CORRECTLY)
      // ------------------------------------------------------
      .addCase(getTenantById.pending, (state) => {
        state.tenantLoading = true;
        state.error = null;
      })
      .addCase(getTenantById.fulfilled, (state, { payload }) => {
        state.tenantLoading = false;
        state.currentTenant = payload;
      })
      .addCase(getTenantById.rejected, (state, { payload, error }) => {
        state.tenantLoading = false;
        state.error =
          payload || error.message || 'Failed to load tenant';
        state.currentTenant = null;
      });
  },
});

// ------------------------------------------------------
// EXPORT REDUCER + ACTIONS
// ------------------------------------------------------

export const propertiesReducer = propertiesSlice.reducer;

export const {
  clearError,
  clearCurrentProperty,
  clearCurrentTenant,
  updatePropertyLocally,
  calculateTotals,
} = propertiesSlice.actions;

// ------------------------------------------------------
// SELECTORS
// ------------------------------------------------------

const selectPropertiesState = (state) =>
  state.properties || state.propertiesData || {};

export const propertiesSelectors = {
  getPropertiesData: createSelector(
    [selectPropertiesState],
    (s) => ({
      loading: s.loading || false,
      tenantLoading: s.tenantLoading || false,
      properties: s.properties || [],
      landlordProperties: s.landlordProperties || [],
      tenantProperties: s.tenantProperties || [],
      currentProperty: s.currentProperty,
      currentTenant: s.currentTenant,
      error: s.error,
      totalProperties: s.totalProperties || 0,
      totalUnits: s.totalUnits || 0,
      occupiedUnits: s.occupiedUnits || 0,
      vacantUnits: s.vacantUnits || 0,
    })
  ),

  getProperties: createSelector(
    [selectPropertiesState],
    (s) => s.properties || []
  ),

  getLandlordProperties: createSelector(
    [selectPropertiesState],
    (s) => s.landlordProperties || []
  ),

  getTenantProperties: createSelector(
    [selectPropertiesState],
    (s) => s.tenantProperties || []
  ),

  getCurrentProperty: createSelector(
    [selectPropertiesState],
    (s) => s.currentProperty
  ),

  getCurrentTenant: createSelector(
    [selectPropertiesState],
    (s) => s.currentTenant
  ),

  isLoading: createSelector(
    [selectPropertiesState],
    (s) => s.loading || false
  ),

  isTenantLoading: createSelector(
    [selectPropertiesState],
    (s) => s.tenantLoading || false
  ),

  getError: createSelector(
    [selectPropertiesState],
    (s) => s.error
  ),
};

export default propertiesSlice.reducer;
