import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';
import { Config } from '../../config';
import { navigate, resetRoot } from '../../navigation/RouterServices';
import { clearLoginData } from './loginSlice';
import { Buffer } from 'buffer';
import { Linking } from 'react-native';


const base_url = Config.PROPERTIES_API_URL;

const GEOCODING_API_URL = 'https://ispmhrf3y4.execute-api.us-east-1.amazonaws.com/geocode';

// Geocoding service function
export const geocodeAddress = async (address) => {
  try {


    const response = await fetch(GEOCODING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: address
      }),
    });



    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      const errorText = await response.text();
      console.error(' Geocoding API Error:', errorText);
      throw new Error(`Geocoding failed: ${response.status}`);
    }
  } catch (error) {
    console.error(' Geocoding Error:', error);
    throw error;
  }
};

// Function to open location in Google Maps
export const openLocationInMaps = async (property) => {
  try {
    // Format the property address
    const formatAddress = (property) => {
      const parts = [];
      if (property.address) parts.push(property.address);
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      if (property.zip_code) parts.push(property.zip_code);
      return parts.join(', ');
    };

    const address = formatAddress(property);

    if (!address.trim()) {
      Toast.show('No address available for this property');
      return;
    }

    // Try to get coordinates first
    try {
      const geocodeResult = await geocodeAddress(address);

      if (geocodeResult && geocodeResult.lat && geocodeResult.lng) {
        // Use coordinates for more accurate mapping
        const coordinatesUrl = `https://www.google.com/maps/search/?api=1&query=${geocodeResult.lat},${geocodeResult.lng}`;
        const supported = await Linking.canOpenURL(coordinatesUrl);

        if (supported) {
          await Linking.openURL(coordinatesUrl);
          return;
        }
      }
    } catch (geocodeError) {
      console.warn('Geocoding failed, falling back to address search:', geocodeError);
    }

    // Fallback to address-based search
    const encodedAddress = encodeURIComponent(address);
    const addressUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    const supported = await Linking.canOpenURL(addressUrl);
    if (supported) {
      await Linking.openURL(addressUrl);
    } else {
      Toast.show('Unable to open maps application');
    }

  } catch (error) {
    console.error(' Error opening maps:', error);
    Toast.show('Failed to open location in maps');
  }
};

// const PROPERTIES_API_URL = 'https://1vmmxi10ue.execute-api.us-east-1.amazonaws.com/items';

// GET all properties
export const getProperties = createAsyncThunk(
  'properties/getProperties',
  async (_, { getState, rejectWithValue }) => {
    try {


      // Get token from state if needed
      const state = getState();
      const token = state.loginData?.token || state.login?.token;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(base_url, {
        method: 'GET',
        headers,
      });



      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();

        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { items: [], message: textResponse };
        }
      }



      if (response.ok) {
        // Handle different response structures
        // const properties = data.items || data.properties || data.data || data || [];
        let properties = data?.items ?? data?.properties ?? data?.data ?? [];

        return Array.isArray(properties) ? properties : [];
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(' API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error(' Network/Parse Error:', err);

      let errorMessage = 'Failed to fetch properties';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


// GET landlord's own properties (new function for landlord dashboard)
// export const getLandlordProperties = createAsyncThunk(
//   'properties/getLandlordProperties',
//   async (landlordId, { getState, rejectWithValue }) => {
//     try {


//       // Get token from state if needed
//       const state = getState();
//       const token = state.loginData?.token || state.login?.token;

//       // If no landlordId provided, get from current user
//       const currentLandlordId = landlordId || state.loginData?.user?.id || state.login?.user?.id;

//       if (!currentLandlordId) {
//         return rejectWithValue('Landlord ID not found. Please login again.');
//       }

//       const headers = {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       };

//       // Add authorization header if token exists
//       if (token) {
//         headers['Authorization'] = `Bearer ${token}`;
//       }

//       // Try with query parameter first
//       const url = `${base_url}?landlord_id=${currentLandlordId}`;


//       const response = await fetch(url, {
//         method: 'GET',
//         headers,
//       });


//       let data;
//       const contentType = response.headers.get('content-type');

//       if (contentType && contentType.includes('application/json')) {
//         data = await response.json();
//       } else {
//         const textResponse = await response.text();

//         try {
//           data = JSON.parse(textResponse);
//         } catch {
//           data = { items: [], message: textResponse };
//         }
//       }



//       if (response.ok) {
//         // Handle different response structures
//         // let properties = data.items || data.properties || data.data || data || [];
//         let properties = data?.items ?? data?.properties ?? data?.data ?? [];


//         // Ensure we have an array
//         if (!Array.isArray(properties)) {
//           properties = [];
//         }

//         // Filter by landlord_id if the API doesn't support query filtering
//         // This is a fallback in case your API doesn't support query parameters
//         const filteredProperties = properties.filter(property => {
//           return property.landlord_id === currentLandlordId ||
//             property.owner_id === currentLandlordId ||
//             property.user_id === currentLandlordId;
//         });



//         return filteredProperties;
//       } else {
//         const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
//         console.error('API Error:', errorMessage);
//         Toast.show(errorMessage);
//         return rejectWithValue(errorMessage);
//       }
//     } catch (err) {
//       console.error('Network/Parse Error:', err);

//       let errorMessage = 'Failed to fetch landlord properties';

//       if (err.name === 'TypeError' && err.message.includes('fetch')) {
//         errorMessage = 'Network error. Please check your internet connection.';
//       } else if (err.name === 'SyntaxError') {
//         errorMessage = 'Invalid response from server';
//       } else {
//         errorMessage = err.message || errorMessage;
//       }

//       Toast.show(errorMessage);
//       return rejectWithValue(errorMessage);
//     }
//   }
// );

// Fixed getLandlordProperties function in services.js
export const getLandlordProperties = createAsyncThunk(
  'properties/getLandlordProperties',
  async (params, { getState, rejectWithValue }) => {
    try {
      console.log('🔍 Getting landlord properties with params:', params);

      // Handle both old parameter style (just landlordId) and new style ({ landlordId, token })
      let landlordId, token;

      if (typeof params === 'string') {
        // Old style - just landlordId string
        landlordId = params;
        // Fallback to getting token from state
        const state = getState();
        token = state.loginData?.token || state.login?.token;
      } else {
        // New style - object with landlordId and token
        landlordId = params.landlordId;
        token = params.token;
      }

      // Validate required data
      if (!landlordId) {
        console.error('❌ No landlord ID provided');
        return rejectWithValue('Landlord ID is required');
      }

      if (!token) {
        console.error('❌ No authentication token provided');
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      console.log('✅ Using landlord ID:', landlordId, 'with token:', !!token);

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // Try with query parameter first
      const url = `${base_url}?landlord_id=${landlordId}`;
      console.log('🌐 API URL:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      console.log('📡 Response status:', response.status);

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.log('📄 Text response:', textResponse);
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { items: [], message: textResponse };
        }
      }

      console.log('📦 Raw data received:', data);

      if (response.ok) {
        // Handle different response structures
        let properties = data?.items ?? data?.properties ?? data?.data ?? data ?? [];
        console.log('📋 Initial properties:', properties);

        // Ensure we have an array
        if (!Array.isArray(properties)) {
          console.warn('⚠️ Properties is not an array:', typeof properties);
          properties = [];
        }

        // Filter by landlord_id if the API doesn't support query filtering
        const filteredProperties = properties.filter(property => {
          const matches = property.landlord_id === landlordId ||
            property.owner_id === landlordId ||
            property.user_id === landlordId;

          if (!matches) {
        
          }

          return matches;
        });



        return filteredProperties;
      } else if (response.status === 401) {

        return rejectWithValue('Session expired. Please login again.');
      } else if (response.status === 403) {
        return rejectWithValue('Access denied. Please check your permissions.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(' API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error(' Network/Parse Error:', err);

      let errorMessage = 'Failed to fetch landlord properties';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// GET single property by ID (with optional ownership verification)
export const getProperty = createAsyncThunk(
  'properties/getProperty',
  async (propertyId, { getState, rejectWithValue }) => {
    try {

      // Get token from state if needed
      const state = getState();
      const token = state.loginData?.token || state.login?.token;

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${base_url}/${propertyId}`, {
        method: 'GET',
        headers,
      });

      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();

        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { property: null, message: textResponse };
        }
      }



      if (response.ok) {
        // Handle different response structures
        const property = data.item || data.property || data.data || data;
        return property;
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(' API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Network/Parse Error:', err);

      let errorMessage = 'Failed to fetch property';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Updated createProperty function to match your API structure
export const createProperty = createAsyncThunk(
  'properties/createProperty',
  async (params, { rejectWithValue }) => {
    try {
      const { propertyData, token, landlordId } = params;

      // Validate required data
      if (!propertyData.name?.trim()) {
        return rejectWithValue('Property name is required');
      }

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!landlordId) {
        return rejectWithValue('Landlord ID is required. Please login again.');
      }



      // The API expects the data structure from your cURL example
      const apiPayload = {
        ...propertyData,
        // Ensure landlord ownership
        landlord_id: landlordId,
        // Timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const response = await fetch(base_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });



      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();

        try {
          data = JSON.parse(textResponse);
        } catch {
          // If parsing fails, assume success and return the payload
          data = { success: true, message: 'Property created', property: apiPayload };
        }
      }

      if (response.ok) {

        Toast.show('Property created successfully!');

        return {
          ...data,
          property: data.property || data.item || data.data || apiPayload,
          timestamp: new Date().toISOString(),
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Create API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error(' Create Network/Parse Error:', err);

      let errorMessage = 'Failed to create property';
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// CORRECTED updateProperty function in services.js
export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async (params, { rejectWithValue }) => {
    try {
      const { propertyId, propertyData, token, landlordId } = params;

      // Validate required data
      if (!propertyData.name?.trim()) {
        return rejectWithValue('Property name is required');
      }

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!landlordId) {
        return rejectWithValue('Landlord ID is required. Please login again.');
      }

      if (!propertyId) {
        return rejectWithValue('Property ID is required for updates.');
      }

      console.log('🔄 Updating property:', propertyId, 'with data:', propertyData);


      const url = `${base_url}/${propertyId}`;
      const method = 'PUT'; // Or 'PATCH' based on your API

      const apiPayload = {
        ...propertyData,
        // Ensure landlord ownership is preserved
        landlord_id: landlordId,
        // Update timestamp
        updated_at: new Date().toISOString(),
        updated_by: landlordId
      };



      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(apiPayload),
      });



      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();

        try {
          data = JSON.parse(textResponse);
        } catch {
          // If parsing fails, assume success and return the payload
          data = { success: true, message: 'Property updated', property: { ...apiPayload, id: propertyId } };
        }
      }

      if (response.ok) {

        Toast.show('Property updated successfully!');

        return {
          ...data,
          property: data.property || data.item || data.data || { ...apiPayload, id: propertyId },
          timestamp: new Date().toISOString(),
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
        console.error(' Update API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error(' Update Network/Parse Error:', err);

      let errorMessage = 'Failed to update property';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Enhanced getTenantProperties function in services.js
// Fixed getTenantProperties function in services.js
export const getTenantProperties = createAsyncThunk(
  'properties/getTenantProperties',
  async (params, { rejectWithValue }) => {
    const { tenantId, token } = params;

    try {



      // Validate parameters
      if (!token || typeof token !== 'string') {
        console.error(' Invalid or missing token');
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!tenantId || typeof tenantId !== 'string') {
        console.error(' Invalid or missing tenant ID');
        return rejectWithValue('Tenant ID is required.');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      // 🔧 STRATEGY 1: Try API filtering first
      let url = `${base_url}?tenant_id=${tenantId}`;


      let response = await fetch(url, {
        method: 'GET',
        headers,
      });



      let data;
      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();

        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { items: [], message: textResponse };
        }
      }



      if (response.ok) {
        let properties = [];

        // 🔧 Handle different response structures
        if (Array.isArray(data)) {
          // Direct array response
          properties = data;
        } else if (data && Array.isArray(data.items)) {
          properties = data.items;
        } else if (data && Array.isArray(data.properties)) {
          properties = data.properties;
        } else if (data && Array.isArray(data.data)) {
          properties = data.data;
        }


        // 🔧 If we got properties from the filtered API call, use them directly
        if (properties.length > 0) {


          // Validate that these properties actually belong to the tenant
          const validatedProperties = properties.filter(property => {
            const normalizedTenantId = String(tenantId).trim().toLowerCase();

            // Check multiple possible tenant fields with normalization
            const checks = [
              String(property.tenant_id || '').trim().toLowerCase(),
              String(property.current_tenant_id || '').trim().toLowerCase(),
              String(property.assigned_tenant_id || '').trim().toLowerCase(),
              String(property.renter_id || '').trim().toLowerCase()
            ];

            const hasMatch = checks.some(check => check === normalizedTenantId);


            return hasMatch;
          });

          const enrichedProperties = validatedProperties.map(property => ({
            ...property,
            rental_status: property.rental_status || 'active',
            rental_start_date: property.rental_start_date ||
              property.lease_start_date ||
              property.created_at ||
              new Date().toISOString(),
            rental_end_date: property.rental_end_date ||
              property.lease_end_date,
            is_available: false, // Tenant properties are always occupied

            // Ensure consistent tenant reference
            tenant_id: property.tenant_id || tenantId,
            current_tenant_id: property.current_tenant_id || tenantId,
          }));


          return enrichedProperties;
        }

        url = base_url;


        response = await fetch(url, {
          method: 'GET',
          headers,
        });



        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          try {
            data = JSON.parse(textResponse);
          } catch {
            data = { items: [], message: textResponse };
          }
        }



        // Extract properties from second response
        if (Array.isArray(data)) {
          properties = data;
        } else if (data && Array.isArray(data.items)) {
          properties = data.items;
        } else if (data && Array.isArray(data.properties)) {
          properties = data.properties;
        } else if (data && Array.isArray(data.data)) {
          properties = data.data;
        }



        const tenantProperties = properties.filter((property, index) => {
          const normalizedTenantId = String(tenantId).trim().toLowerCase();



          // Normalize and compare all possible tenant fields
          const tenantFields = [
            String(property.tenant_id || '').trim().toLowerCase(),
            String(property.current_tenant_id || '').trim().toLowerCase(),
            String(property.assigned_tenant_id || '').trim().toLowerCase(),
            String(property.renter_id || '').trim().toLowerCase()
          ];

          const hasMatch = tenantFields.some(field => field === normalizedTenantId);

          // Also check rental records if available
          let rentalMatch = false;
          if (property.rentals && Array.isArray(property.rentals)) {

            const activeRental = property.rentals.find(rental => {
              const normalizedRentalTenant = String(rental.tenant_id || '').trim().toLowerCase();
              const isActive = (rental.status === 'active' || rental.is_active === true);
              const matches = normalizedRentalTenant === normalizedTenantId && isActive;


              return matches;
            });
            rentalMatch = !!activeRental;
          }

          const finalMatch = hasMatch || rentalMatch;

          if (finalMatch) {
            console.log(`✅ [${index}] MATCH FOUND for:`, property.name, {
              tenant_id_match: String(property.tenant_id || '').trim().toLowerCase() === normalizedTenantId,
              rental_match: rentalMatch
            });
          } else {
            console.log(` [${index}] NO MATCH for:`, property.name);
          }

          return finalMatch;
        });

        tenantProperties.forEach((prop, idx) => {

        });

        // 🔧 ENHANCED PROPERTY DATA
        const enrichedProperties = tenantProperties.map(property => ({
          ...property,
          rental_status: property.rental_status || 'active',
          rental_start_date: property.rental_start_date ||
            property.lease_start_date ||
            property.created_at ||
            new Date().toISOString(),
          rental_end_date: property.rental_end_date ||
            property.lease_end_date,
          is_available: false, // Tenant properties are always occupied

          // Ensure consistent tenant reference
          tenant_id: property.tenant_id || tenantId,
          current_tenant_id: property.current_tenant_id || tenantId,
        }));



        return enrichedProperties;

      } else if (response.status === 401) {
        console.error(' Unauthorized - token may be expired');
        return rejectWithValue('Session expired. Please login again.');
      } else if (response.status === 403) {
        console.error('Forbidden - access denied');
        return rejectWithValue('Access denied. Please check your permissions.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error(' API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }

    } catch (err) {
      console.error(' Network/Parse Error:', err);

      let errorMessage = 'Failed to fetch tenant properties';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);



// Enhanced tenant validation with better error handling
export const validateTenantIdSimple = createAsyncThunk(
  'properties/validateTenantIdSimple',
  async (tenantId, { rejectWithValue }) => {
    try {


      if (!tenantId || !tenantId.trim()) {
        return {
          isValid: false,
          message: 'Tenant ID is required',
          tenantInfo: null
        };
      }

      // Enhanced validation for the expected tenant ID format
      const tenantIdPattern = /^tenant-\d{13}$/;

      if (tenantIdPattern.test(tenantId.trim())) {
        // Extract timestamp from tenant ID for additional validation
        const timestamp = tenantId.replace('tenant-', '');
        const timestampNum = parseInt(timestamp, 10);
        const currentTime = Date.now();

        // Check if timestamp is reasonable (not too far in the future or too old)
        if (timestampNum > 0 && timestampNum <= currentTime && timestampNum > (currentTime - (10 * 365 * 24 * 60 * 60 * 1000))) {


          return {
            isValid: true,
            message: 'Tenant ID is valid',
            tenantInfo: {
              id: tenantId.trim(),
              name: `Tenant ${tenantId.slice(-4)}`, // Use last 4 digits as name
              email: `tenant${tenantId.slice(-4)}@example.com`,
              phone: '+1234567890',
              currentPropertyId: null,
              currentPropertyName: null
            }
          };
        }
      }

      return {
        isValid: false,
        message: 'Invalid tenant ID format. Expected format: tenant-1234567890123',
        tenantInfo: null
      };

    } catch (error) {
      console.error(' Error in tenant validation:', error);
      return rejectWithValue({
        isValid: false,
        message: 'Failed to validate tenant ID',
        tenantInfo: null
      });
    }
  }
);


// Updated deleteProperty function
export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (params, { rejectWithValue }) => {
    try {
      const { propertyId, token, landlordId } = params;

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!landlordId) {
        return rejectWithValue('Landlord ID is required. Please login again.');
      }

      const response = await fetch(`${base_url}/${propertyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${params.token}`,
        },
      });

      let data;
      try {
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          try {
            data = JSON.parse(textResponse);
          } catch {
            data = { success: true, message: textResponse };
          }
        }
      } catch {
        data = { success: true, message: 'Property deleted successfully' };
      }

      if (response.ok) {
        Toast.show('Property deleted successfully!');
        return {
          ...data,
          propertyId,
          timestamp: new Date().toISOString(),
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Network/Parse Error:', err);

      let errorMessage = 'Failed to delete property';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (err.name === 'SyntaxError') {
        errorMessage = 'Invalid response from server';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);



export const validateTenantId = createAsyncThunk(
  'properties/validateTenantId',
  async (params, { rejectWithValue }) => {
    const { tenantId, token } = params;

    try {


      // Validate input params
      if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
        return rejectWithValue('Tenant ID is required and must be a non-empty string');
      }

      if (!token || typeof token !== 'string') {
        return rejectWithValue('Authentication token is required');
      }

      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      };

      const tenantsUrl = base_url.replace('/properties', '/tenants');

      const response = await fetch(`${tenantsUrl}/${tenantId}`, {
        method: 'GET',
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = null;
        }
      }

      if (response.ok && data) {
        const tenantInfo = data.tenant || data.item || data.data || data;

        return {
          isValid: true,
          message: 'Tenant ID is valid',
          tenantInfo: {
            id: tenantInfo.id || tenantInfo.tenantId || tenantId,
            name: `${tenantInfo.firstName || ''} ${tenantInfo.lastName || ''}`.trim() || null,
            email: tenantInfo.email || null,
            phone: tenantInfo.phone || tenantInfo.phoneNumber || null
          }
        };
      }

      return {
        isValid: false,
        message: 'Tenant ID not found in database',
        tenantInfo: null
      };

    } catch (error) {
      console.error(' Error validating tenant ID:', error);

      return rejectWithValue({
        isValid: false,
        message: error.message || 'Failed to validate tenant ID',
        tenantInfo: null
      });
    }
  }
);



