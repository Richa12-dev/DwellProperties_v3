

// propertiesSlice.js - Fixed version with memoized selectors
import { createSlice, createSelector } from '@reduxjs/toolkit';
import { getProperties, getLandlordProperties, getProperty, createProperty, updateProperty, deleteProperty , getTenantProperties} from './services';

const initialState = {
  properties: [],
  landlordProperties: [],
    tenantProperties: [],
  currentProperty: null,
  loading: false,
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
    updatePropertyLocally: (state, action) => {
      // Update in both arrays
      const updateProperty = (properties, payload) => {
        const index = properties.findIndex(p => p.id === payload.id || p.ID === payload.id);
        if (index !== -1) {
          properties[index] = { ...properties[index], ...payload };
        }
      };
      
      updateProperty(state.properties, action.payload);
      updateProperty(state.landlordProperties, action.payload);
    },
    calculateTotals: (state) => {
      state.totalProperties = state.landlordProperties.length;
      state.totalUnits = state.landlordProperties.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
      state.occupiedUnits = state.landlordProperties.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
      state.vacantUnits = state.totalUnits - state.occupiedUnits;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get properties
      .addCase(getProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.properties = payload;
        
        // Calculate totals
        state.totalProperties = payload.length;
        state.totalUnits = payload.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
        state.occupiedUnits = payload.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(getProperties.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || 'Failed to load properties';
      })

      // Get landlord's own properties
      .addCase(getLandlordProperties.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLandlordProperties.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.landlordProperties = payload;
        
        // Calculate totals based on landlord properties
        state.totalProperties = payload.length;
        state.totalUnits = payload.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
        state.occupiedUnits = payload.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(getLandlordProperties.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || 'Failed to load landlord properties';
      })

      // Get single property
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
        state.error = payload || error.message || 'Failed to load property';
      })

      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Add the new property to the list
        const newProperty = payload.property || payload;
        state.properties.push(newProperty);
        state.landlordProperties.push(newProperty);
        
        // Recalculate totals based on landlord properties
        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
        state.occupiedUnits = state.landlordProperties.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(createProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || 'Failed to create property';
      })

      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, { payload }) => {
        state.loading = false;

        // Update the property in both lists
        const updatedProperty = payload.property || payload;
        
        const updateInArray = (array) => {
          const index = array.findIndex(p => p.id === updatedProperty.id || p.ID === updatedProperty.id);
          if (index !== -1) {
            array[index] = updatedProperty;
          }
        };
        
        updateInArray(state.properties);
        updateInArray(state.landlordProperties);
        
        // Update current property if it's the same one
        if (state.currentProperty && (state.currentProperty.id === updatedProperty.id || state.currentProperty.ID === updatedProperty.id)) {
          state.currentProperty = updatedProperty;
        }
        
        // Recalculate totals based on landlord properties
        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
        state.occupiedUnits = state.landlordProperties.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(updateProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || 'Failed to update property';
      })

      // Get tenant's rented properties
.addCase(getTenantProperties.pending, (state) => {
  state.loading = true;
  state.error = null;
})
.addCase(getTenantProperties.fulfilled, (state, { payload }) => {
  state.loading = false;
  state.tenantProperties = payload;
  
  // Calculate tenant-specific totals
  state.totalProperties = payload.length;
  state.totalUnits = payload.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
  // For tenant view, occupied = rented properties, vacant = 0
  state.occupiedUnits = payload.filter(p => p.rental_status === 'active').length;
  state.vacantUnits = 0; // Tenants don't see vacant properties
})
.addCase(getTenantProperties.rejected, (state, { payload, error }) => {
  state.loading = false;
  state.error = payload || error.message || 'Failed to load tenant properties';
})




      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, { payload }) => {
        state.loading = false;
        
        // Remove the property from both lists
        const propertyId = payload.propertyId;
        state.properties = state.properties.filter(p => p.id !== propertyId && p.ID !== propertyId);
        state.landlordProperties = state.landlordProperties.filter(p => p.id !== propertyId && p.ID !== propertyId);
        
        // Clear current property if it's the deleted one
        if (state.currentProperty && (state.currentProperty.id === propertyId || state.currentProperty.ID === propertyId)) {
          state.currentProperty = null;
        }
        
        // Recalculate totals based on landlord properties
        state.totalProperties = state.landlordProperties.length;
        state.totalUnits = state.landlordProperties.reduce((acc, p) => acc + (parseInt(p.bedrooms) || 1), 0);
        state.occupiedUnits = state.landlordProperties.reduce((acc, p) => acc + (p.is_available ? 0 : 1), 0);
        state.vacantUnits = state.totalUnits - state.occupiedUnits;
      })
      .addCase(deleteProperty.rejected, (state, { payload, error }) => {
        state.loading = false;
        state.error = payload || error.message || 'Failed to delete property';
      });
  },
});

export const propertiesReducer = propertiesSlice.reducer;
export const {
  clearError,
  clearCurrentProperty,
  updatePropertyLocally,
  calculateTotals,
} = propertiesSlice.actions;

// Base selectors
const selectPropertiesState = (state) => state.properties || state.propertiesData || {};

// Memoized selectors to prevent unnecessary re-renders
export const propertiesSelectors = {
  getPropertiesData: createSelector(
    [selectPropertiesState],
    (propertiesState) => ({
      loading: propertiesState.loading || false,
      properties: propertiesState.properties || [],
      landlordProperties: propertiesState.landlordProperties || [],
      tenantProperties: propertiesState.tenantProperties || [],
      currentProperty: propertiesState.currentProperty,
      error: propertiesState.error,
      totalProperties: propertiesState.totalProperties || 0,
      totalUnits: propertiesState.totalUnits || 0,
      occupiedUnits: propertiesState.occupiedUnits || 0,
      vacantUnits: propertiesState.vacantUnits || 0,
    })
  ),
  
  getProperties: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.properties || []
  ),

  getLandlordProperties: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.landlordProperties || []
  ),

  // Add new selector for tenant properties
  getTenantProperties: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.tenantProperties || []
  ),

  getCurrentProperty: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.currentProperty
  ),
  
  isLoading: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.loading || false
  ),
  
  getError: createSelector(
    [selectPropertiesState],
    (propertiesState) => propertiesState.error
  ),
};

export default propertiesSlice.reducer;