// src/Redux/Contractor/services.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';

const contractor_jobs_url = 'https://b3bhds2qt5.execute-api.us-east-1.amazonaws.com/prod/contractor/jobs';
const contractor_services_url = 'https://3hc254p0l3.execute-api.us-east-1.amazonaws.com/prod/contractor/services';

const jobs_base_url =
  'https://b3bhds2qt5.execute-api.us-east-1.amazonaws.com/prod/jobs';


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

// Get consistent token
const getToken = (getState) => {
  const state = getState().loginData;
  return state?.idToken || state?.accessToken || state?.token || null;
};

/**
 * ✅ Get all contractor jobs with optional filters
 */
export const getAllContractorJobs = createAsyncThunk(
  'contractor/getAllJobs',
  async (filters = {}, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.limit) {
        params.append('limit', filters.limit.toString());
      }
      
      if (filters.offered_only) {
        params.append('offered_only', '1');
      }
      
      if (filters.unassigned_only) {
        params.append('unassigned_only', '1');
      }
      
      if (filters.status) {
        params.append('status', filters.status);
      }

      const queryString = params.toString();
      const url = queryString
        ? `${contractor_jobs_url}?${queryString}`
        : contractor_jobs_url;

      console.log('📡 Fetching All Contractor Jobs:', url);
      console.log('🔍 Filters Applied:', filters);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      const data = await parseSafeJSON(response);
      console.log('📥 All Jobs Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        const jobs = data.items || data.jobs || (Array.isArray(data) ? data : []);
          
          
        console.log('✅ Parsed Jobs Count:', jobs.length);
        
        return {
          jobs,
          count: data.count || jobs.length,
          filters: data.filters || filters,
          services_used_for_filter: data.services_used_for_filter || [],
        };
      }

      const errorMsg = data?.message || 'Failed to fetch jobs';
      console.error('❌ API Error:', errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Fetch All Jobs Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ✅ Get only jobs offered to this contractor
 */
export const getOfferedJobs = createAsyncThunk(
  'contractor/getOfferedJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      const url = `${contractor_jobs_url}?offered_only=1`;
      console.log('📡 Fetching Offered Jobs:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Offered Jobs Response:', data);

      if (response.ok) {
        const jobs = data.items || data.jobs || [];
        return {
          jobs,
          count: data.count || jobs.length,
        };
      }

      const errorMsg = data?.message || 'Failed to fetch offered jobs';
      console.error('❌ API Error:', errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Fetch Offered Jobs Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ✅ Get unassigned jobs
 */
export const getUnassignedJobs = createAsyncThunk(
  'contractor/getUnassignedJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      const url = `${contractor_jobs_url}?unassigned_only=1`;
      console.log('📡 Fetching Unassigned Jobs:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Unassigned Jobs Response:', data);

      if (response.ok) {
        const jobs = data.items || data.jobs || [];
        return {
          jobs,
          count: data.count || jobs.length,
        };
      }

      const errorMsg = data?.message || 'Failed to fetch unassigned jobs';
      console.error('❌ API Error:', errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Fetch Unassigned Jobs Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ✅ Submit contractor services
 */
export const submitContractorServices = createAsyncThunk(
  'contractor/submitServices',
  async ({ services, token: providedToken }, { getState, rejectWithValue }) => {
    try {
      const token = providedToken || getToken(getState);

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      if (!Array.isArray(services) || services.length === 0) {
        console.error('❌ No services provided');
        return rejectWithValue('Please select at least one service.');
      }

      const formattedServices = services.map(s => s.toLowerCase());
      const payload = { services: formattedServices };

      console.log('📤 Submitting Contractor Services:', payload);

      const response = await fetch(contractor_services_url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 Response Status:', response.status);

      const data = await parseSafeJSON(response);
      console.log('📥 Submit Services Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        Toast.show('Services submitted successfully!');
        return data;
      }

      const errorMsg = data?.message || data?.error || 'Failed to submit services';
      console.error('❌ API Error:', errorMsg);
      Toast.show(errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Submit Services Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Fetch contractor job details by ticket_id
 */
export const getContractorJob = createAsyncThunk(
  'contractor/getJob',
  async ({ ticket_id }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) {
        console.error('❌ No ticket_id provided');
        return rejectWithValue('Ticket ID is required.');
      }

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      const url = `${contractor_jobs_url}/${ticket_id}`;
      console.log('📡 Fetching Contractor Job:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      const data = await parseSafeJSON(response);
      console.log('📥 Contractor Job Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        return data.job || data.ticket || data;
      }

      const errorMsg = data?.message || 'Failed to fetch job details';
      console.error('❌ API Error:', errorMsg);
      Toast.show(errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Fetch Job Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ✅ FIXED: Accept a contractor job
 * Uses /respond endpoint with decision: "ACCEPT"
 */
export const acceptContractorJob = createAsyncThunk(
  'contractor/acceptJob',
  async ({ ticket_id }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) return rejectWithValue('Ticket ID is required.');
      if (!token) return rejectWithValue('Authentication token missing.');

      // ✅ FIXED: Use /respond endpoint
      const url = `${contractor_jobs_url}/${ticket_id}/respond`;
      console.log('📡 Accepting Job:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // ✅ FIXED: Send decision as "ACCEPT"
        body: JSON.stringify({ decision: 'ACCEPT' }),
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Accept Job Response:', data);

      if (response.ok) {
        Toast.show('Job accepted successfully!');
        // ✅ FIXED: Return ticket object from response
        return data.ticket || data.job || data;
      }

      Toast.show(data?.message || 'Failed to accept job');
      return rejectWithValue(data?.message);
    } catch (err) {
      console.error('❌ Accept Job Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

/**
 * ✅ FIXED: Decline a contractor job
 * Uses /respond endpoint with decision: "DENY"
 */
export const declineContractorJob = createAsyncThunk(
  'contractor/declineJob',
  async ({ ticket_id, reason }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) return rejectWithValue('Ticket ID is required.');
      if (!token) return rejectWithValue('Authentication token missing.');

      // ✅ FIXED: Use /respond endpoint
      const url = `${contractor_jobs_url}/${ticket_id}/respond`;
      console.log('📡 Declining Job:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        // ✅ FIXED: Send decision as "DENY" with reason
        body: JSON.stringify({
          decision: 'DENY',
          reason: reason || 'Not available'
        }),
      });

      const data = await parseSafeJSON(response);
      console.log('📥 Decline Job Response:', data);

      if (response.ok) {
        Toast.show('Job declined');
        // ✅ FIXED: Return ticket object from response
        return {
          ticket_id,
          ...(data.ticket || data.job || data)
        };
      }

      Toast.show(data?.message || 'Failed to decline job');
      return rejectWithValue(data?.message);
    } catch (err) {
      console.error('❌ Decline Job Error:', err);
      Toast.show('Network error');
      return rejectWithValue(err.message);
    }
  }
);

export const createContractorInvoice = createAsyncThunk(
  'contractor/createInvoice',
  async ({ ticket_id, invoiceData }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) {
        console.error('❌ No ticket_id provided');
        return rejectWithValue('Ticket ID is required.');
      }

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

      const url = `${contractor_jobs_url}/${ticket_id}/invoice`;
      console.log('📡 Creating Invoice:', url);
      console.log('📤 Invoice Data:', invoiceData);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      console.log('📡 Response Status:', response.status);

      const data = await parseSafeJSON(response);
      console.log('📥 Create Invoice Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        Toast.show('Invoice created successfully!');
        
        // ✅ FIXED: Return the correct structure
        // The API returns { message, invoice } where invoice contains ticket_id
        return {
          ticket_id: ticket_id, // Use the parameter ticket_id
          invoice: data.invoice || data,
          message: data.message
        };
      }

      const errorMsg = data?.message || 'Failed to create invoice';
      console.error('❌ API Error:', errorMsg);
      Toast.show(errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Create Invoice Error:', err);
      Toast.show('Network error while creating invoice');
      return rejectWithValue(err.message);
    }
  }
);



/**
 * ✅ Get Invoice for a Job
 */
export const getContractorInvoice = createAsyncThunk(
  'contractor/getInvoice',
  async ({ ticket_id }, { getState, rejectWithValue }) => {
    try {
      const token = getToken(getState);

      if (!ticket_id) {
        console.error('❌ No ticket_id provided');
        return rejectWithValue('Ticket ID is required.');
      }

      if (!token) {
        console.error('❌ No authentication token');
        return rejectWithValue('Authentication token missing.');
      }

        const url = `${jobs_base_url}/${ticket_id}/invoice`;

      console.log('📡 Fetching Invoice:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response Status:', response.status);

      const data = await parseSafeJSON(response);
      console.log('📥 Invoice Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        // Return invoice data with ticket_id
        return {
          ticket_id: ticket_id,
          invoice: data.invoice || data,
          has_invoice: true
        };
      }

      // If invoice doesn't exist (404), return null instead of error
      if (response.status === 404) {
        console.log('ℹ️ No invoice found for this job');
        return {
          ticket_id: ticket_id,
          invoice: null,
          has_invoice: false
        };
      }

      const errorMsg = data?.message || 'Failed to fetch invoice';
      console.error('❌ API Error:', errorMsg);
      return rejectWithValue(errorMsg);
    } catch (err) {
      console.error('❌ Fetch Invoice Error:', err);
      return rejectWithValue(err.message);
    }
  }
);
