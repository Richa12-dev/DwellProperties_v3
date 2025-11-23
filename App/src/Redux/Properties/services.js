//import { createAsyncThunk } from '@reduxjs/toolkit';
//import Toast from 'react-native-simple-toast';
//import { Config } from '../../config';
//import { navigate, resetRoot } from '../../navigation/RouterServices';
//import { clearLoginData } from './loginSlice';
//import { Buffer } from 'buffer';
//import { Linking } from 'react-native';
//
//
//const base_url = Config.PROPERTIES_API_URL;
//
//const GEOCODING_API_URL = 'https://ispmhrf3y4.execute-api.us-east-1.amazonaws.com/geocode';
//
//// Geocoding service function
//export const geocodeAddress = async (address) => {
//  try {
//
//
//    const response = await fetch(GEOCODING_API_URL, {
//      method: 'POST',
//      headers: {
//        'Content-Type': 'application/json',
//      },
//      body: JSON.stringify({
//        address: address
//      }),
//    });
//
//
//
//    if (response.ok) {
//      const data = await response.json();
//
//      return data;
//    } else {
//      const errorText = await response.text();
//      console.error(' Geocoding API Error:', errorText);
//      throw new Error(`Geocoding failed: ${response.status}`);
//    }
//  } catch (error) {
//    console.error(' Geocoding Error:', error);
//    throw error;
//  }
//};
//
//// Function to open location in Google Maps
//export const openLocationInMaps = async (property) => {
//  try {
//    // Format the property address
//    const formatAddress = (property) => {
//      const parts = [];
//      if (property.address) parts.push(property.address);
//      if (property.city) parts.push(property.city);
//      if (property.state) parts.push(property.state);
//      if (property.zip_code) parts.push(property.zip_code);
//      return parts.join(', ');
//    };
//
//    const address = formatAddress(property);
//
//    if (!address.trim()) {
//      Toast.show('No address available for this property');
//      return;
//    }
//
//    // Try to get coordinates first
//    try {
//      const geocodeResult = await geocodeAddress(address);
//
//      if (geocodeResult && geocodeResult.lat && geocodeResult.lng) {
//        // Use coordinates for more accurate mapping
//        const coordinatesUrl = `https://www.google.com/maps/search/?api=1&query=${geocodeResult.lat},${geocodeResult.lng}`;
//        const supported = await Linking.canOpenURL(coordinatesUrl);
//
//        if (supported) {
//          await Linking.openURL(coordinatesUrl);
//          return;
//        }
//      }
//    } catch (geocodeError) {
//      console.warn('Geocoding failed, falling back to address search:', geocodeError);
//    }
//
//    // Fallback to address-based search
//    const encodedAddress = encodeURIComponent(address);
//    const addressUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
//
//    const supported = await Linking.canOpenURL(addressUrl);
//    if (supported) {
//      await Linking.openURL(addressUrl);
//    } else {
//      Toast.show('Unable to open maps application');
//    }
//
//  } catch (error) {
//    console.error(' Error opening maps:', error);
//    Toast.show('Failed to open location in maps');
//  }
//};
//
//// const PROPERTIES_API_URL = 'https://1vmmxi10ue.execute-api.us-east-1.amazonaws.com/items';
//
//// GET all properties
//export const getProperties = createAsyncThunk(
//  'properties/getProperties',
//  async (_, { getState, rejectWithValue }) => {
//    try {
//
//
//      // Get token from state if needed
//      const state = getState();
//      const token = state.loginData?.token || state.login?.token;
//
//      const headers = {
//        'Content-Type': 'application/json',
//        'Accept': 'application/json',
//      };
//
//      // Add authorization header if token exists
//      if (token) {
//        headers['Authorization'] = `Bearer ${token}`;
//      }
//
//      const response = await fetch(base_url, {
//        method: 'GET',
//        headers,
//      });
//
//
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          data = { items: [], message: textResponse };
//        }
//      }
//
//
//
//      if (response.ok) {
//        // Handle different response structures
//        // const properties = data.items || data.properties || data.data || data || [];
//        let properties = data?.items ?? data?.properties ?? data?.data ?? [];
//
//        return Array.isArray(properties) ? properties : [];
//      } else {
//        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
//        console.error(' API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error(' Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to fetch properties';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//
//
//// Fixed getLandlordProperties function in services.js
//export const getLandlordProperties = createAsyncThunk(
//  'properties/getLandlordProperties',
//  async (params, { getState, rejectWithValue }) => {
//    try {
//      console.log('🔍 Getting landlord properties with params:', params);
//
//      // Handle both old parameter style (just landlordId) and new style ({ landlordId, token })
//      let landlordId, token;
//
//      if (typeof params === 'string') {
//        // Old style - just landlordId string
//        landlordId = params;
//        // Fallback to getting token from state
//        const state = getState();
//        token = state.loginData?.token || state.login?.token;
//      } else {
//        // New style - object with landlordId and token
//        landlordId = params.landlordId;
//        token = params.token;
//      }
//
//      // Validate required data
//      if (!landlordId) {
//        console.error('❌ No landlord ID provided');
//        return rejectWithValue('Landlord ID is required');
//      }
//
//      if (!token) {
//        console.error('❌ No authentication token provided');
//        return rejectWithValue('Authentication token is required. Please login again.');
//      }
//
//      console.log('✅ Using landlord ID:', landlordId, 'with token:', !!token);
//
//      const headers = {
//        'Content-Type': 'application/json',
//        'Accept': 'application/json',
//        'Authorization': `Bearer ${token}`,
//      };
//
//      // Try with query parameter first
//      const url = `${base_url}?landlord_id=${landlordId}`;
//      console.log('🌐 API URL:', url);
//
//      const response = await fetch(url, {
//        method: 'GET',
//        headers,
//      });
//
//      console.log('📡 Response status:', response.status);
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//        console.log('📄 Text response:', textResponse);
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          data = { items: [], message: textResponse };
//        }
//      }
//
//      console.log('📦 Raw data received:', data);
//
//      if (response.ok) {
//        // Handle different response structures
//        let properties = data?.items ?? data?.properties ?? data?.data ?? data ?? [];
//        console.log('📋 Initial properties:', properties);
//
//        // Ensure we have an array
//        if (!Array.isArray(properties)) {
//          console.warn('⚠️ Properties is not an array:', typeof properties);
//          properties = [];
//        }
//
//        // Filter by landlord_id if the API doesn't support query filtering
//        const filteredProperties = properties.filter(property => {
//          const matches = property.landlord_id === landlordId ||
//            property.owner_id === landlordId ||
//            property.user_id === landlordId;
//
//          if (!matches) {
//        
//          }
//
//          return matches;
//        });
//
//
//
//        return filteredProperties;
//      } else if (response.status === 401) {
//
//        return rejectWithValue('Session expired. Please login again.');
//      } else if (response.status === 403) {
//        return rejectWithValue('Access denied. Please check your permissions.');
//      } else {
//        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
//        console.error(' API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error(' Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to fetch landlord properties';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//// GET single property by ID (with optional ownership verification)
//export const getProperty = createAsyncThunk(
//  'properties/getProperty',
//  async (propertyId, { getState, rejectWithValue }) => {
//    try {
//
//      // Get token from state if needed
//      const state = getState();
//      const token = state.loginData?.token || state.login?.token;
//
//      const headers = {
//        'Content-Type': 'application/json',
//        'Accept': 'application/json',
//      };
//
//      // Add authorization header if token exists
//      if (token) {
//        headers['Authorization'] = `Bearer ${token}`;
//      }
//
//      const response = await fetch(`${base_url}/${propertyId}`, {
//        method: 'GET',
//        headers,
//      });
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          data = { property: null, message: textResponse };
//        }
//      }
//
//
//
//      if (response.ok) {
//        // Handle different response structures
//        const property = data.item || data.property || data.data || data;
//        return property;
//      } else {
//        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
//        console.error(' API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error('Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to fetch property';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//// Updated createProperty function to match your API structure
//export const createProperty = createAsyncThunk(
//  'properties/createProperty',
//  async (params, { rejectWithValue }) => {
//    try {
//      const { propertyData, token, landlordId } = params;
//
//      // Validate required data
//      if (!propertyData.name?.trim()) {
//        return rejectWithValue('Property name is required');
//      }
//
//      if (!token) {
//        return rejectWithValue('Authentication token is required. Please login again.');
//      }
//
//      if (!landlordId) {
//        return rejectWithValue('Landlord ID is required. Please login again.');
//      }
//
//
//
//      // The API expects the data structure from your cURL example
//      const apiPayload = {
//        ...propertyData,
//        // Ensure landlord ownership
//        landlord_id: landlordId,
//        // Timestamps
//        created_at: new Date().toISOString(),
//        updated_at: new Date().toISOString()
//      };
//
//      const response = await fetch(base_url, {
//        method: 'POST',
//        headers: {
//          'Content-Type': 'application/json',
//          'Accept': 'application/json',
//          'Authorization': `Bearer ${token}`,
//        },
//        body: JSON.stringify(apiPayload),
//      });
//
//
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          // If parsing fails, assume success and return the payload
//          data = { success: true, message: 'Property created', property: apiPayload };
//        }
//      }
//
//      if (response.ok) {
//
//        Toast.show('Property created successfully!');
//
//        return {
//          ...data,
//          property: data.property || data.item || data.data || apiPayload,
//          timestamp: new Date().toISOString(),
//        };
//      } else if (response.status === 401) {
//        return rejectWithValue('Session expired. Please login again.');
//      } else {
//        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
//        console.error('Create API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error(' Create Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to create property';
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//// CORRECTED updateProperty function in services.js
//export const updateProperty = createAsyncThunk(
//  'properties/updateProperty',
//  async (params, { rejectWithValue }) => {
//    try {
//      const { propertyId, propertyData, token, landlordId } = params;
//
//      // Validate required data
//      if (!propertyData.name?.trim()) {
//        return rejectWithValue('Property name is required');
//      }
//
//      if (!token) {
//        return rejectWithValue('Authentication token is required. Please login again.');
//      }
//
//      if (!landlordId) {
//        return rejectWithValue('Landlord ID is required. Please login again.');
//      }
//
//      if (!propertyId) {
//        return rejectWithValue('Property ID is required for updates.');
//      }
//
//      console.log('🔄 Updating property:', propertyId, 'with data:', propertyData);
//
//
//      const url = `${base_url}/${propertyId}`;
//      const method = 'PUT'; // Or 'PATCH' based on your API
//
//      const apiPayload = {
//        ...propertyData,
//        // Ensure landlord ownership is preserved
//        landlord_id: landlordId,
//        // Update timestamp
//        updated_at: new Date().toISOString(),
//        updated_by: landlordId
//      };
//
//
//
//      const response = await fetch(url, {
//        method: method,
//        headers: {
//          'Content-Type': 'application/json',
//          'Accept': 'application/json',
//          'Authorization': `Bearer ${token}`,
//        },
//        body: JSON.stringify(apiPayload),
//      });
//
//
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          // If parsing fails, assume success and return the payload
//          data = { success: true, message: 'Property updated', property: { ...apiPayload, id: propertyId } };
//        }
//      }
//
//      if (response.ok) {
//
//        Toast.show('Property updated successfully!');
//
//        return {
//          ...data,
//          property: data.property || data.item || data.data || { ...apiPayload, id: propertyId },
//          timestamp: new Date().toISOString(),
//        };
//      } else if (response.status === 401) {
//        return rejectWithValue('Session expired. Please login again.');
//      } else {
//        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
//        console.error(' Update API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error(' Update Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to update property';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//// Enhanced getTenantProperties function in services.js
//// Fixed getTenantProperties function in services.js
//export const getTenantProperties = createAsyncThunk(
//  'properties/getTenantProperties',
//  async (params, { rejectWithValue }) => {
//    const { tenantId, token } = params;
//
//    try {
//
//
//
//      // Validate parameters
//      if (!token || typeof token !== 'string') {
//        console.error(' Invalid or missing token');
//        return rejectWithValue('Authentication token is required. Please login again.');
//      }
//
//      if (!tenantId || typeof tenantId !== 'string') {
//        console.error(' Invalid or missing tenant ID');
//        return rejectWithValue('Tenant ID is required.');
//      }
//
//      const headers = {
//        'Content-Type': 'application/json',
//        'Accept': 'application/json',
//        'Authorization': `Bearer ${token}`,
//      };
//
//      // 🔧 STRATEGY 1: Try API filtering first
//      let url = `${base_url}?tenant_id=${tenantId}`;
//
//
//      let response = await fetch(url, {
//        method: 'GET',
//        headers,
//      });
//
//
//
//      let data;
//      const contentType = response.headers.get('content-type');
//
//      if (contentType && contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          data = { items: [], message: textResponse };
//        }
//      }
//
//
//
//      if (response.ok) {
//        let properties = [];
//
//        // 🔧 Handle different response structures
//        if (Array.isArray(data)) {
//          // Direct array response
//          properties = data;
//        } else if (data && Array.isArray(data.items)) {
//          properties = data.items;
//        } else if (data && Array.isArray(data.properties)) {
//          properties = data.properties;
//        } else if (data && Array.isArray(data.data)) {
//          properties = data.data;
//        }
//
//
//        // 🔧 If we got properties from the filtered API call, use them directly
//        if (properties.length > 0) {
//
//
//          // Validate that these properties actually belong to the tenant
//          const validatedProperties = properties.filter(property => {
//            const normalizedTenantId = String(tenantId).trim().toLowerCase();
//
//            // Check multiple possible tenant fields with normalization
//            const checks = [
//              String(property.tenant_id || '').trim().toLowerCase(),
//              String(property.current_tenant_id || '').trim().toLowerCase(),
//              String(property.assigned_tenant_id || '').trim().toLowerCase(),
//              String(property.renter_id || '').trim().toLowerCase()
//            ];
//
//            const hasMatch = checks.some(check => check === normalizedTenantId);
//
//
//            return hasMatch;
//          });
//
//          const enrichedProperties = validatedProperties.map(property => ({
//            ...property,
//            rental_status: property.rental_status || 'active',
//            rental_start_date: property.rental_start_date ||
//              property.lease_start_date ||
//              property.created_at ||
//              new Date().toISOString(),
//            rental_end_date: property.rental_end_date ||
//              property.lease_end_date,
//            is_available: false, // Tenant properties are always occupied
//
//            // Ensure consistent tenant reference
//            tenant_id: property.tenant_id || tenantId,
//            current_tenant_id: property.current_tenant_id || tenantId,
//          }));
//
//
//          return enrichedProperties;
//        }
//
//        url = base_url;
//
//
//        response = await fetch(url, {
//          method: 'GET',
//          headers,
//        });
//
//
//
//        if (contentType && contentType.includes('application/json')) {
//          data = await response.json();
//        } else {
//          const textResponse = await response.text();
//          try {
//            data = JSON.parse(textResponse);
//          } catch {
//            data = { items: [], message: textResponse };
//          }
//        }
//
//
//
//        // Extract properties from second response
//        if (Array.isArray(data)) {
//          properties = data;
//        } else if (data && Array.isArray(data.items)) {
//          properties = data.items;
//        } else if (data && Array.isArray(data.properties)) {
//          properties = data.properties;
//        } else if (data && Array.isArray(data.data)) {
//          properties = data.data;
//        }
//
//
//
//        const tenantProperties = properties.filter((property, index) => {
//          const normalizedTenantId = String(tenantId).trim().toLowerCase();
//
//
//
//          // Normalize and compare all possible tenant fields
//          const tenantFields = [
//            String(property.tenant_id || '').trim().toLowerCase(),
//            String(property.current_tenant_id || '').trim().toLowerCase(),
//            String(property.assigned_tenant_id || '').trim().toLowerCase(),
//            String(property.renter_id || '').trim().toLowerCase()
//          ];
//
//          const hasMatch = tenantFields.some(field => field === normalizedTenantId);
//
//          // Also check rental records if available
//          let rentalMatch = false;
//          if (property.rentals && Array.isArray(property.rentals)) {
//
//            const activeRental = property.rentals.find(rental => {
//              const normalizedRentalTenant = String(rental.tenant_id || '').trim().toLowerCase();
//              const isActive = (rental.status === 'active' || rental.is_active === true);
//              const matches = normalizedRentalTenant === normalizedTenantId && isActive;
//
//
//              return matches;
//            });
//            rentalMatch = !!activeRental;
//          }
//
//          const finalMatch = hasMatch || rentalMatch;
//
//          if (finalMatch) {
//            console.log(`✅ [${index}] MATCH FOUND for:`, property.name, {
//              tenant_id_match: String(property.tenant_id || '').trim().toLowerCase() === normalizedTenantId,
//              rental_match: rentalMatch
//            });
//          } else {
//            console.log(` [${index}] NO MATCH for:`, property.name);
//          }
//
//          return finalMatch;
//        });
//
//        tenantProperties.forEach((prop, idx) => {
//
//        });
//
//        // 🔧 ENHANCED PROPERTY DATA
//        const enrichedProperties = tenantProperties.map(property => ({
//          ...property,
//          rental_status: property.rental_status || 'active',
//          rental_start_date: property.rental_start_date ||
//            property.lease_start_date ||
//            property.created_at ||
//            new Date().toISOString(),
//          rental_end_date: property.rental_end_date ||
//            property.lease_end_date,
//          is_available: false, // Tenant properties are always occupied
//
//          // Ensure consistent tenant reference
//          tenant_id: property.tenant_id || tenantId,
//          current_tenant_id: property.current_tenant_id || tenantId,
//        }));
//
//
//
//        return enrichedProperties;
//
//      } else if (response.status === 401) {
//        console.error(' Unauthorized - token may be expired');
//        return rejectWithValue('Session expired. Please login again.');
//      } else if (response.status === 403) {
//        console.error('Forbidden - access denied');
//        return rejectWithValue('Access denied. Please check your permissions.');
//      } else {
//        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
//        console.error(' API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//
//    } catch (err) {
//      console.error(' Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to fetch tenant properties';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//
//
//// Enhanced tenant validation with better error handling
//export const validateTenantIdSimple = createAsyncThunk(
//  'properties/validateTenantIdSimple',
//  async (tenantId, { rejectWithValue }) => {
//    try {
//
//
//      if (!tenantId || !tenantId.trim()) {
//        return {
//          isValid: false,
//          message: 'Tenant ID is required',
//          tenantInfo: null
//        };
//      }
//
//      // Enhanced validation for the expected tenant ID format
//      const tenantIdPattern = /^tenant-\d{13}$/;
//
//      if (tenantIdPattern.test(tenantId.trim())) {
//        // Extract timestamp from tenant ID for additional validation
//        const timestamp = tenantId.replace('tenant-', '');
//        const timestampNum = parseInt(timestamp, 10);
//        const currentTime = Date.now();
//
//        // Check if timestamp is reasonable (not too far in the future or too old)
//        if (timestampNum > 0 && timestampNum <= currentTime && timestampNum > (currentTime - (10 * 365 * 24 * 60 * 60 * 1000))) {
//
//
//          return {
//            isValid: true,
//            message: 'Tenant ID is valid',
//            tenantInfo: {
//              id: tenantId.trim(),
//              name: `Tenant ${tenantId.slice(-4)}`, // Use last 4 digits as name
//              email: `tenant${tenantId.slice(-4)}@example.com`,
//              phone: '+1234567890',
//              currentPropertyId: null,
//              currentPropertyName: null
//            }
//          };
//        }
//      }
//
//      return {
//        isValid: false,
//        message: 'Invalid tenant ID format. Expected format: tenant-1234567890123',
//        tenantInfo: null
//      };
//
//    } catch (error) {
//      console.error(' Error in tenant validation:', error);
//      return rejectWithValue({
//        isValid: false,
//        message: 'Failed to validate tenant ID',
//        tenantInfo: null
//      });
//    }
//  }
//);
//
//
//// Updated deleteProperty function
//export const deleteProperty = createAsyncThunk(
//  'properties/deleteProperty',
//  async (params, { rejectWithValue }) => {
//    try {
//      const { propertyId, token, landlordId } = params;
//
//      if (!token) {
//        return rejectWithValue('Authentication token is required. Please login again.');
//      }
//
//      if (!landlordId) {
//        return rejectWithValue('Landlord ID is required. Please login again.');
//      }
//
//      const response = await fetch(`${base_url}/${propertyId}`, {
//        method: 'DELETE',
//        headers: {
//          'Content-Type': 'application/json',
//          'Accept': 'application/json',
//          'Authorization': `Bearer ${params.token}`,
//        },
//      });
//
//      let data;
//      try {
//        const contentType = response.headers.get('content-type');
//
//        if (contentType && contentType.includes('application/json')) {
//          data = await response.json();
//        } else {
//          const textResponse = await response.text();
//          try {
//            data = JSON.parse(textResponse);
//          } catch {
//            data = { success: true, message: textResponse };
//          }
//        }
//      } catch {
//        data = { success: true, message: 'Property deleted successfully' };
//      }
//
//      if (response.ok) {
//        Toast.show('Property deleted successfully!');
//        return {
//          ...data,
//          propertyId,
//          timestamp: new Date().toISOString(),
//        };
//      } else if (response.status === 401) {
//        return rejectWithValue('Session expired. Please login again.');
//      } else {
//        const errorMessage = data?.message || data?.error || data?.details || `HTTP ${response.status}: ${response.statusText}`;
//        console.error('API Error:', errorMessage);
//        Toast.show(errorMessage);
//        return rejectWithValue(errorMessage);
//      }
//    } catch (err) {
//      console.error('Network/Parse Error:', err);
//
//      let errorMessage = 'Failed to delete property';
//
//      if (err.name === 'TypeError' && err.message.includes('fetch')) {
//        errorMessage = 'Network error. Please check your internet connection.';
//      } else if (err.name === 'SyntaxError') {
//        errorMessage = 'Invalid response from server';
//      } else {
//        errorMessage = err.message || errorMessage;
//      }
//
//      Toast.show(errorMessage);
//      return rejectWithValue(errorMessage);
//    }
//  }
//);
//
//
//
//export const validateTenantId = createAsyncThunk(
//  'properties/validateTenantId',
//  async (params, { rejectWithValue }) => {
//    const { tenantId, token } = params;
//
//    try {
//
//
//      // Validate input params
//      if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
//        return rejectWithValue('Tenant ID is required and must be a non-empty string');
//      }
//
//      if (!token || typeof token !== 'string') {
//        return rejectWithValue('Authentication token is required');
//      }
//
//      const headers = {
//        'Content-Type': 'application/json',
//        'Accept': 'application/json',
//        'Authorization': `Bearer ${token}`,
//      };
//
//      const tenantsUrl = base_url.replace('/properties', '/tenants');
//
//      const response = await fetch(`${tenantsUrl}/${tenantId}`, {
//        method: 'GET',
//        headers,
//      });
//
//      const contentType = response.headers.get('content-type') || '';
//      let data = null;
//
//      if (contentType.includes('application/json')) {
//        data = await response.json();
//      } else {
//        const textResponse = await response.text();
//        try {
//          data = JSON.parse(textResponse);
//        } catch {
//          data = null;
//        }
//      }
//
//      if (response.ok && data) {
//        const tenantInfo = data.tenant || data.item || data.data || data;
//
//        return {
//          isValid: true,
//          message: 'Tenant ID is valid',
//          tenantInfo: {
//            id: tenantInfo.id || tenantInfo.tenantId || tenantId,
//            name: `${tenantInfo.firstName || ''} ${tenantInfo.lastName || ''}`.trim() || null,
//            email: tenantInfo.email || null,
//            phone: tenantInfo.phone || tenantInfo.phoneNumber || null
//          }
//        };
//      }
//
//      return {
//        isValid: false,
//        message: 'Tenant ID not found in database',
//        tenantInfo: null
//      };
//
//    } catch (error) {
//      console.error(' Error validating tenant ID:', error);
//
//      return rejectWithValue({
//        isValid: false,
//        message: error.message || 'Failed to validate tenant ID',
//        tenantInfo: null
//      });
//    }
//  }
//);
//
//
//

import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';
import { Config } from '../../config';
import { Linking } from 'react-native';

const PROPERTIES_API_URL = 'https://70q2ntiu1f.execute-api.us-east-1.amazonaws.com/prod/prop';
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
      console.error('Geocoding API Error:', errorText);
      throw new Error(`Geocoding failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Geocoding Error:', error);
    throw error;
  }
};

// Function to open location in Google Maps
export const openLocationInMaps = async (property) => {
  try {
    const formatAddress = (property) => {
      const parts = [];
      if (property.street) parts.push(property.street);
      if (property.city) parts.push(property.city);
      if (property.state) parts.push(property.state);
      if (property.zipcode) parts.push(property.zipcode);
      return parts.join(', ');
    };

    const address = formatAddress(property);

    if (!address.trim()) {
      Toast.show('No address available for this property');
      return;
    }

    try {
      const geocodeResult = await geocodeAddress(address);

      if (geocodeResult && geocodeResult.lat && geocodeResult.lng) {
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

    const encodedAddress = encodeURIComponent(address);
    const addressUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

    const supported = await Linking.canOpenURL(addressUrl);
    if (supported) {
      await Linking.openURL(addressUrl);
    } else {
      Toast.show('Unable to open maps application');
    }

  } catch (error) {
    console.error('Error opening maps:', error);
    Toast.show('Failed to open location in maps');
  }
};

// GET all properties with optional filters
export const getProperties = createAsyncThunk(
  'properties/getProperties',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.loginData?.accessToken || state.login?.accessToken;

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      const queryParams = new URLSearchParams();
      if (params.property_type) queryParams.append('property_type', params.property_type);
      if (params.availability) queryParams.append('availability', params.availability);

      const url = queryParams.toString()
        ? `${PROPERTIES_API_URL}?${queryParams.toString()}`
        : PROPERTIES_API_URL;

      console.log('📡 Fetching properties from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

      console.log('📦 API Response:', data);

      if (response.ok) {
        const properties = data.items || data.properties || data.data || data || [];
        return Array.isArray(properties) ? properties : [];
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Network/Parse Error:', err);
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

// GET landlord's properties
export const getLandlordProperties = createAsyncThunk(
  'properties/getLandlordProperties',
  async (params, { getState, rejectWithValue }) => {
    try {
      let landlordId, token;

      if (typeof params === 'string') {
        landlordId = params;
        const state = getState();
        token = state.loginData?.accessToken || state.login?.accessToken;
      } else {
        landlordId = params.landlordId;
        token = params.token;
      }

      if (!landlordId) {
        console.error('❌ No landlord ID provided');
        return rejectWithValue('Landlord ID is required');
      }

      if (!token) {
        console.error('❌ No authentication token provided');
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      console.log('✅ Fetching properties for landlord:', landlordId);

      const response = await fetch(PROPERTIES_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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

      console.log('📦 Landlord Properties Response:', data);

      if (response.ok) {
        let properties = data?.items || data?.properties || data?.data || data || [];

        if (!Array.isArray(properties)) {
          properties = [];
        }

        const filteredProperties = properties.filter(property =>
          property.landlord_id === landlordId
        );

        console.log('✅ Filtered Properties:', filteredProperties.length);

        return filteredProperties;
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Network/Parse Error:', err);
      let errorMessage = 'Failed to fetch landlord properties';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// GET single property by ID
export const getProperty = createAsyncThunk(
  'properties/getProperty',
  async (propertyId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.loginData?.accessToken || state.login?.accessToken;

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      const response = await fetch(`${PROPERTIES_API_URL}/${propertyId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
        const property = data.item || data.property || data.data || data;
        return property;
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching property:', err);
      const errorMessage = err.message || 'Failed to fetch property';
      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// CREATE property
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

      console.log('🏠 Creating property with data:', propertyData);

      // ✅ FIXED: Convert amenities from boolean object to array of strings
      const selectedAmenities = Object.keys(propertyData.amenities || {})
        .filter(key => propertyData.amenities[key] === true);

      // ✅ FIXED: Map form fields to API fields with correct structure
      const apiPayload = {
        name: propertyData.name.trim().substring(0, 140),
        street: propertyData.street?.trim().substring(0, 512) || '',
        city: propertyData.city?.trim().substring(0, 512) || '',
        state: propertyData.state?.trim().substring(0, 512) || '', // ✅ ADDED: state field
        zipcode: propertyData.zip_code?.trim().substring(0, 512) || '',
        property_type: (propertyData.property_type?.toLowerCase() || 'apartment').substring(0, 64),
        availability: propertyData.availability_status === 'Available' ? 'available' : 'occupied',
        liked: false, // ✅ ADDED: liked field (default false)
        bedrooms: parseInt(propertyData.bedrooms) || 0,
        bathrooms: parseInt(propertyData.bathrooms) || 0,
        area: propertyData.area_sqft ? `${propertyData.area_sqft} sqft` : '0 sqft', // ✅ FIXED: Format as string with units
        year_built: parseInt(propertyData.year_built) || null,
        monthly_rent: parseFloat(propertyData.monthly_rent) || 0,
        security_deposit: parseFloat(propertyData.security_deposit) || 0,
        amenities: selectedAmenities, // ✅ FIXED: Array of strings instead of boolean object
        image_urls: Array.isArray(propertyData.images) ? propertyData.images : [], // ✅ FIXED: Ensure array
        landlord_id: landlordId, // ✅ ADDED: landlord_id
      };

      // ✅ FIXED: Add description if provided
      if (propertyData.description?.trim()) {
        apiPayload.description = propertyData.description.trim().substring(0, 4000);
      }

      // ✅ FIXED: Handle tenant assignment properly
      if (propertyData.tenant_id?.trim() && propertyData.availability_status !== 'Available') {
        apiPayload.tenants = [
          {
            email: propertyData.tenant_email?.trim() || `tenant${Date.now()}@example.com`,
            name: propertyData.tenant_name?.trim() || `Tenant ${propertyData.tenant_id.slice(-4)}`
          }
        ];
        // Ensure availability is set to occupied when tenant is assigned
        apiPayload.availability = 'occupied';
      } else {
        apiPayload.tenants = []; // ✅ ADDED: Empty tenants array if no tenant
      }

      console.log('📤 Sending to API:', JSON.stringify(apiPayload, null, 2));

      const response = await fetch(PROPERTIES_API_URL, {
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
        console.log('📄 Text response:', textResponse);
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { success: true, message: 'Property created', property: apiPayload };
        }
      }

      console.log('✅ Create Response:', data);

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
        console.error('Error details:', data);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Create Network/Parse Error:', err);
      let errorMessage = 'Failed to create property';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// UPDATE property
export const updateProperty = createAsyncThunk(
  'properties/updateProperty',
  async (params, { rejectWithValue }) => {
    try {
      const { propertyId, propertyData, token, landlordId } = params;

      if (!propertyData.name?.trim()) {
        return rejectWithValue('Property name is required');
      }

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!propertyId) {
        return rejectWithValue('Property ID is required for updates.');
      }

      console.log('🔄 Updating property:', propertyId);

      // ✅ FIXED: Convert amenities from boolean object to array
      const selectedAmenities = Object.keys(propertyData.amenities || {})
        .filter(key => propertyData.amenities[key] === true);

      // ✅ FIXED: Build complete update payload with correct structure
      const apiPayload = {
        name: propertyData.name.trim().substring(0, 140),
        street: propertyData.street?.trim().substring(0, 512) || '',
        city: propertyData.city?.trim().substring(0, 512) || '',
        state: propertyData.state?.trim().substring(0, 512) || '', // ✅ ADDED: state field
        zipcode: propertyData.zip_code?.trim().substring(0, 512) || '',
        property_type: (propertyData.property_type?.toLowerCase() || 'apartment').substring(0, 64),
        availability: propertyData.availability_status === 'Available' ? 'available' : 'occupied',
        bedrooms: parseInt(propertyData.bedrooms) || 0,
        bathrooms: parseInt(propertyData.bathrooms) || 0,
        area: propertyData.area_sqft ? `${propertyData.area_sqft} sqft` : '0 sqft', // ✅ FIXED: Format with units
        year_built: parseInt(propertyData.year_built) || null,
        monthly_rent: parseFloat(propertyData.monthly_rent) || 0,
        security_deposit: parseFloat(propertyData.security_deposit) || 0,
        amenities: selectedAmenities, // ✅ FIXED: Array of strings
        image_urls: Array.isArray(propertyData.images) ? propertyData.images : [],
        landlord_id: landlordId, // ✅ ADDED: Preserve landlord_id
      };

      // ✅ FIXED: Add description if provided
      if (propertyData.description !== undefined) {
        apiPayload.description = propertyData.description?.trim().substring(0, 4000) || '';
      }

      // ✅ FIXED: Handle tenant assignment properly
      if (propertyData.tenant_id?.trim() && propertyData.availability_status !== 'Available') {
        apiPayload.tenants = [
          {
            email: propertyData.tenant_email?.trim() || `tenant${Date.now()}@example.com`,
            name: propertyData.tenant_name?.trim() || `Tenant ${propertyData.tenant_id.slice(-4)}`
          }
        ];
        apiPayload.availability = 'occupied';
      } else {
        apiPayload.tenants = [];
      }

      console.log('📤 Update payload:', JSON.stringify(apiPayload, null, 2));

      const response = await fetch(`${PROPERTIES_API_URL}/${propertyId}`, {
        method: 'PATCH',
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
        console.log('📄 Text response:', textResponse);
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { success: true, message: 'Property updated', property: { ...apiPayload, property_id: propertyId } };
        }
      }

      if (response.ok) {
        Toast.show('Property updated successfully!');
        return {
          ...data,
          property: data.property || data.item || data.data || { ...apiPayload, property_id: propertyId },
          timestamp: new Date().toISOString(),
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('Update API Error:', errorMessage);
        console.error('Error details:', data);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Update Error:', err);
      const errorMessage = err.message || 'Failed to update property';
      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);



// ✅ FIXED: DELETE property - Matching cURL format exactly
export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async (params, { rejectWithValue }) => {
    try {
      const { propertyId, token, landlordId } = params;

      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!propertyId) {
        return rejectWithValue('Property ID is required.');
      }

      console.log('🗑️ Deleting property:', propertyId);
      console.log('🔑 Token (first 20 chars):', token?.substring(0, 20));

      const deleteUrl = `${PROPERTIES_API_URL}/${propertyId}`;
      console.log('🌐 DELETE URL:', deleteUrl);

      // ✅ CRITICAL FIX: Match cURL format EXACTLY
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // ✅ Only Authorization header, like cURL
        },
        // ✅ NO body - DELETE doesn't need Content-Type or body
      });

      console.log('📡 Delete Response status:', response.status);
      console.log('📡 Response Headers:', [...response.headers.entries()]);

      // ✅ Handle successful deletion
      if (response.ok || response.status === 204) {
        console.log('✅ DELETE successful!');
        Toast.show('Property deleted successfully!');
        return {
          success: true,
          propertyId,
          landlordId,
          timestamp: new Date().toISOString(),
        };
      }

      // Handle error responses
      let errorData;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          const textResponse = await response.text();
          console.log('📄 Error text:', textResponse);
          errorData = { message: textResponse || response.statusText };
        }
      } catch (parseError) {
        console.log('⚠️ Could not parse error response');
        errorData = { message: response.statusText };
      }

      console.log('❌ Error Data:', errorData);

      if (response.status === 401 || response.status === 403) {
        const msg = 'Authentication failed. Please login again.';
        Toast.show(msg);
        return rejectWithValue(msg);
      }

      if (response.status === 404) {
        const msg = 'Property not found or already deleted';
        Toast.show(msg);
        return {
          success: true,
          propertyId,
          landlordId,
          message: msg,
        };
      }

      const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}: ${response.statusText}`;
      console.error('❌ DELETE failed:', errorMessage);
      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);

    } catch (err) {
      console.error('❌ DELETE Exception:', err);
      const errorMessage = err.message || 'Failed to delete property';
      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);


// GET tenant properties
export const getTenantProperties = createAsyncThunk(
  'properties/getTenantProperties',
  async (params, { rejectWithValue }) => {
    const { tenantId, token } = params;

    try {
      if (!token) {
        return rejectWithValue('Authentication token is required. Please login again.');
      }

      if (!tenantId) {
        return rejectWithValue('Tenant ID is required.');
      }

      console.log('🏠 Fetching properties for tenant:', tenantId);

      const response = await fetch(PROPERTIES_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
          data = { items: [] };
        }
      }

      if (response.ok) {
        let properties = data?.items || data?.properties || data?.data || [];

        if (!Array.isArray(properties)) {
          properties = [];
        }

        // Filter properties where tenant is assigned
        const tenantProperties = properties.filter(property => {
          if (property.tenants && Array.isArray(property.tenants)) {
            return property.tenants.some(tenant =>
              tenant.email === tenantId || tenant.name === tenantId
            );
          }
          return false;
        });

        return tenantProperties;
      } else {
        const errorMessage = data?.message || data?.error || 'Failed to fetch tenant properties';
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('Error fetching tenant properties:', err);
      const errorMessage = err.message || 'Failed to fetch tenant properties';
      Toast.show(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

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

      const tenantIdPattern = /^tenant-\d{13}$/;

      if (tenantIdPattern.test(tenantId.trim())) {
        const timestamp = tenantId.replace('tenant-', '');
        const timestampNum = parseInt(timestamp, 10);
        const currentTime = Date.now();

        if (timestampNum > 0 && timestampNum <= currentTime && timestampNum > (currentTime - (10 * 365 * 24 * 60 * 60 * 1000))) {
          return {
            isValid: true,
            message: 'Tenant ID is valid',
            tenantInfo: {
              id: tenantId.trim(),
              name: `Tenant ${tenantId.slice(-4)}`,
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
        message: 'Invalid tenant ID format',
        tenantInfo: null
      };

    } catch (error) {
      console.error('Error in tenant validation:', error);
      return rejectWithValue({
        isValid: false,
        message: 'Failed to validate tenant ID',
        tenantInfo: null
      });
    }
  }
);
