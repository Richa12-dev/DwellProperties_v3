import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';
import { Config } from '../../config';

const maintenance_url = Config.MAINTENANCE_API_URL;

/**
 * 🔧 Helper: Safely parse JSON
 */
const parseSafeJSON = async (response) => {
  try {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      return await response.json();
    }
    const text = await response.text();
    return JSON.parse(text);
  } catch {
    return { message: 'Invalid server response' };
  }
};

/**
 * 🔧 Helper: Get token from Redux safely
 */
const getToken = (getState) => {
  const state = getState().loginData;
  return state?.accessToken || state?.idToken || null;
};



/**
 * 🛠 Create Maintenance Request
 */
export const createMaintenanceRequest = createAsyncThunk(
  'maintenance/createRequest',
  async (params, { getState, rejectWithValue }) => {
    try {
      const {
        title, description, category, priority, location,
        landlord_id, property_id, preferred_start, preferred_end, timezone
      } = params;

      const token = getToken(getState);

      if (!token) return rejectWithValue('Authentication token is required.');
      if (!title || !description || !category || !priority || !location)
        return rejectWithValue('All required fields must be filled.');

      const payload = {
        title,
        description,
        category,
        priority,
        location,
        landlord_id,
        property_id,
        preferred_start,
        preferred_end,
        timezone: timezone || 'Asia/Kolkata',
      };

      console.log('📤 Sending Maintenance Request:', payload);

      const response = await fetch(maintenance_url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Maintenance Response:', data);

      if (response.ok) {
        Toast.show('Maintenance request created successfully!');
        return data;
      } else {
        const msg = data?.message || 'Failed to create ticket';
        Toast.show(msg);
        return rejectWithValue(msg);
      }
    } catch (err) {
      console.error('❌ Create Maintenance Error:', err);
      Toast.show('Network error, try again.');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * 🛠 Fetch All Maintenance Requests for a Tenant
 */
export const getMaintenanceRequests = createAsyncThunk(
  'maintenance/getRequests',
  async (tenantId, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!tenantId) return rejectWithValue('Tenant ID is required.');
      if (!token) return rejectWithValue('Authentication token missing.');

      const url = `${maintenance_url}?role=tenant&party_id=${tenantId}`;
      console.log('📡 Fetching Requests:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Maintenance List:', data);

      if (response.ok) return data;

      Toast.show(data?.message || 'Failed to fetch maintenance list');
      return rejectWithValue(data?.message);
    } catch (err) {
      console.error('❌ Fetch Requests Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * 🛠 Fetch Specific Maintenance Details
 */
export const getMaintenanceDetails = createAsyncThunk(
  'maintenance/getDetails',
  async ({ ticket_id }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) return rejectWithValue('Ticket ID is required.');
      if (!token) return rejectWithValue('Authentication token missing.');

      const url = `${maintenance_url}/${ticket_id}`;
      console.log('📡 Fetching Ticket Details:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Ticket Details:', data);

      if (response.ok) return data;

      Toast.show(data?.message || 'Failed to fetch details');
      return rejectWithValue(data?.message);
    } catch (err) {
      console.error('❌ Ticket Details Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * 🛠 Update Maintenance Ticket Status
 */
export const updateMaintenanceStatus = createAsyncThunk(
  'maintenance/updateStatus',
  async ({ ticket_id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) return rejectWithValue('Ticket ID is required.');
      if (!status) return rejectWithValue('Status is required.');
      if (!token) return rejectWithValue('Authentication token missing.');

      const url = `${maintenance_url}/${ticket_id}`;

      console.log('📡 Updating Status:', url);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Update Status Response:', data);

      if (response.ok) {
        Toast.show('Status updated successfully!');
        return data;
      }

      Toast.show(data?.message || 'Failed to update status');
      return rejectWithValue(data?.message);
    } catch (err) {
      console.error('❌ Update Status Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);
