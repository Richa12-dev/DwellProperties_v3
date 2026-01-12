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



import { createAsyncThunk } from '@reduxjs/toolkit';
import Toast from 'react-native-simple-toast';
import { Config } from '../../config';
import { Linking } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const PROPERTIES_API_URL = 'https://70q2ntiu1f.execute-api.us-east-1.amazonaws.com/prod/properties';
const GEOCODING_API_URL = 'https://ispmhrf3y4.execute-api.us-east-1.amazonaws.com/geocode';

const S3_BASE_URL = 'https://dp-properties.s3.us-east-1.amazonaws.com';

const transformPropertyResponse = (backendResponse, propertyId, sentPayload) => {
  // Extract the property data from various possible response formats
  const propertyData = backendResponse.property || backendResponse.item || backendResponse.data || backendResponse;
  
  // Start with the sent payload as base
  const transformedProperty = {
    ...sentPayload,
    property_id: propertyId,
    ...propertyData,
  };

  // ✅ Transform media.photos to image_urls array with full S3 URLs
  if (propertyData.media && Array.isArray(propertyData.media.photos)) {
    transformedProperty.image_urls = propertyData.media.photos.map(photoPath => {
      // If it's already a full URL, keep it
      if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
      }
      // Construct full S3 URL
      return `${S3_BASE_URL}/${photoPath}`;
    });
    
    console.log('✅ Transformed images:', transformedProperty.image_urls);
  }
  // Keep existing images if backend didn't return media.photos
  else if (Array.isArray(propertyData.image_urls) && propertyData.image_urls.length > 0) {
    transformedProperty.image_urls = propertyData.image_urls;
  }
  // Fallback to sent payload images
  else if (!transformedProperty.image_urls || transformedProperty.image_urls.length === 0) {
    transformedProperty.image_urls = sentPayload.image_urls || [];
  }

  return transformedProperty;
};


const compressImage = async (localUri) => {
  try {
    console.log('🔄 Compressing image:', localUri);
    
    // Resize and compress image
    const resizedImage = await ImageResizer.createResizedImage(
      localUri,
      1200, // maxWidth
      1200, // maxHeight
      'JPEG', // format
      80, // quality (0-100)
      0, // rotation
      null, // outputPath
      false, // keepMeta
      { mode: 'contain', onlyScaleDown: true } // options
    );
    
    return resizedImage.uri;
  } catch (error) {
    console.warn('⚠️ Compression failed, using original:', error);
    return localUri; // Fallback to original if compression fails
  }
};

/**
 * ✅ Convert local image to base64 format with compression
 */
const convertImageToBase64 = async (localUri) => {
  try {
    
    // First compress the image
    const compressedUri = await compressImage(localUri);
    
    // Read file as base64
    const base64String = await RNFS.readFile(compressedUri, 'base64');
    
    // Get file extension and mime type
    const extension = compressedUri.split('.').pop().toLowerCase();
    const mimeType = extension === 'jpg' || extension === 'jpeg'
      ? 'image/jpeg'
      : `image/${extension}`;
    
    // Return data URI format (what backend can process)
    const dataUri = `data:${mimeType};base64,${base64String}`;
    console.log('✅ Converted to base64, size:', dataUri.length, '(~' + Math.round(dataUri.length/1024) + 'KB)');
    
    return dataUri;
  } catch (error) {
    console.error('❌ Error converting image:', error);
    throw error;
  }
};

/**
 * ✅ Process images: keep URLs, convert local files to base64
 * Limits to 3 images to avoid API size limits
 */
const processPropertyImages = async (images) => {
  if (!Array.isArray(images) || images.length === 0) {
    return [];
  }

  // ✅ Limit to 3 images max to avoid API size limits
  const imagesToProcess = images.slice(0, 3);
  
  if (images.length > 3) {
    console.warn(`⚠️ Only processing first 3 of ${images.length} images to avoid API size limit`);
    Toast.show(`Processing first 3 images only (API size limit)`);
  }

  const processedImages = [];

  for (const imageUri of imagesToProcess) {
    try {
      // If it's already a URL (starts with http/https), keep it as is
      if (imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
        processedImages.push(imageUri);
        console.log('✅ Keeping existing URL:', imageUri.substring(0, 50) + '...');
      }
      // If it's a data URI (already base64), keep it
      else if (imageUri.startsWith('data:')) {
        processedImages.push(imageUri);
        console.log('✅ Keeping existing base64 image');
      }
      // If it's a local file (file:// or local path), convert to base64
      else {
        console.log('🔄 Converting local image to base64...');
        const base64Image = await convertImageToBase64(imageUri);
        processedImages.push(base64Image);
      }
    } catch (error) {
      console.error(' Error processing image:', imageUri, error);
      Toast.show('Warning: Some images could not be processed');
      // Continue with other images even if one fails
    }
  }

  return processedImages;
};


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
        console.error('No landlord ID provided');
        return rejectWithValue('Landlord ID is required');
      }

      if (!token) {
        console.error('No authentication token provided');
        return rejectWithValue('Authentication token is required. Please login again.');
      }


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

      if (response.ok) {
        let properties = data?.items || data?.properties || data?.data || data || [];

        if (!Array.isArray(properties)) {
          properties = [];
        }

        const filteredProperties = properties.filter(property =>
          property.landlord_id === landlordId
        );

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

// Replace the getProperty function in your services.js with this enhanced version

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
    
        
        // ✅ If landlord info is missing, try to fetch it from landlord_id
        if (property && property.landlord_id && !property.landlord) {
          
          try {
            // Attempt to fetch landlord information
            const landlordResponse = await fetch(
              `https://70q2ntiu1f.execute-api.us-east-1.amazonaws.com/prod/landlords/${property.landlord_id}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            
            if (landlordResponse.ok) {
              const landlordData = await landlordResponse.json();
              const landlord = landlordData.item || landlordData.landlord || landlordData.data || landlordData;
              
              // ✅ Merge landlord data into property
              property.landlord = {
                name: landlord.name || landlord.full_name ||
                      (landlord.firstName && landlord.lastName
                        ? `${landlord.firstName} ${landlord.lastName}`
                        : null),
                email: landlord.email,
                phone: landlord.phone || landlord.phoneNumber,
                full_name: landlord.full_name,
                firstName: landlord.firstName,
                lastName: landlord.lastName,
              };
              
              // Also set top-level fields for easier access
              property.landlord_name = property.landlord.name;
              property.landlord_email = property.landlord.email;
              property.landlord_phone = property.landlord.phone;
              
            } else {
              console.warn(' Failed to fetch landlord info:', landlordResponse.status);
            }
          } catch (landlordError) {
            console.warn('Error fetching landlord:', landlordError);
          }
        }
        
        return property;
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('❌ Error fetching property:', err);
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
        
        let processedImages = [];
             
             if (Array.isArray(propertyData.images) && propertyData.images.length > 0) {
               try {
                 console.log(`📸 Processing ${propertyData.images.length} images...`);
                 processedImages = await processPropertyImages(propertyData.images);
                 console.log(`✅ Processed ${processedImages.length} images successfully`);
               } catch (error) {
                 console.error('❌ Image processing failed:', error);
                 Toast.show('Warning: Some images could not be processed');
               }
             }

      // ✅ FIXED: Convert amenities from boolean object to array of strings
      const selectedAmenities = Object.keys(propertyData.amenities || {})
        .filter(key => propertyData.amenities[key] === true);
        
        const areaValue = propertyData.area_sqft ?
              parseInt(propertyData.area_sqft.toString().replace(/[^\d]/g, '')) : 0;

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
          area: areaValue,// ✅ FIXED: Format as string with units
        year_built: parseInt(propertyData.year_built) || null,
        monthly_rent: parseFloat(propertyData.monthly_rent) || 0,
        security_deposit: parseFloat(propertyData.security_deposit) || 0,
        amenities: selectedAmenities, // ✅ FIXED: Array of strings instead of boolean object
          image_urls: processedImages,
          
        landlord_id: landlordId, // ✅ ADDED: landlord_id
      };

      // ✅ FIXED: Add description if provided
      if (propertyData.description?.trim()) {
        apiPayload.description = propertyData.description.trim().substring(0, 4000);
      }

      // ✅ FIXED: Handle tenant assignment properly
      if (propertyData.tenant_email?.trim() && propertyData.availability_status !== 'Available') {
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

        console.log('📤 Sending to API:', {
               ...apiPayload,
               image_urls: apiPayload.image_urls.map((url, idx) =>
                 url.startsWith('data:') ? `[base64 image ${idx + 1}, size: ${url.length}]` : url
               )
             });
        
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
        
        let processedImages = [];
             
             if (Array.isArray(propertyData.images) && propertyData.images.length > 0) {
               try {
                 console.log(`📸 Processing ${propertyData.images.length} images...`);
                 processedImages = await processPropertyImages(propertyData.images);
                 console.log(`✅ Processed ${processedImages.length} images successfully`);
               } catch (error) {
                 console.error('❌ Image processing failed:', error);
                 Toast.show('Warning: Some images could not be processed');
               }
             }

      // ✅ FIXED: Convert amenities from boolean object to array
      const selectedAmenities = Object.keys(propertyData.amenities || {})
        .filter(key => propertyData.amenities[key] === true);

        
        const areaValue = propertyData.area_sqft ?
               parseInt(propertyData.area_sqft.toString().replace(/[^\d]/g, '')) : 0;

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
          area: areaValue,// ✅ FIXED: Format with units
        year_built: parseInt(propertyData.year_built) || null,
        monthly_rent: parseFloat(propertyData.monthly_rent) || 0,
        security_deposit: parseFloat(propertyData.security_deposit) || 0,
        amenities: selectedAmenities, // ✅ FIXED: Array of strings
          image_urls: processedImages,
        landlord_id: landlordId, // ✅ ADDED: Preserve landlord_id
      };

      // ✅ FIXED: Add description if provided
      if (propertyData.description !== undefined) {
        apiPayload.description = propertyData.description?.trim().substring(0, 4000) || '';
      }

      // ✅ FIXED: Handle tenant assignment properly
      if (propertyData.tenant_email?.trim() && propertyData.availability_status !== 'Available') {
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

        console.log('📤 Update payload:', {
                ...apiPayload,
                image_urls: apiPayload.image_urls.map((url, idx) =>
                  url.startsWith('data:') ? `[base64 image ${idx + 1}]` : url
                )
              });

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

export const transformPropertyImages = (property) => {
  if (!property) return [];
  
  // If property has media.photos, transform to full URLs
  if (property.media?.photos && property.media.photos.length > 0) {
    return property.media.photos.map(photoPath => {
      if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
        return photoPath;
      }
      return `${S3_BASE_URL}/${photoPath}`;
    });
  }
  
  // Otherwise return existing image_urls
  return property.image_urls || [];
};


// delete properties
// Fixed deleteProperty function in services.js

export const deleteProperty = createAsyncThunk(
  'properties/deleteProperty',
  async ({ propertyId, token, landlordId }, { rejectWithValue }) => {
    try {
      console.log('🗑️ Deleting property:', propertyId);
      
      if (!token) {
          console.log(token ,"token");
        return rejectWithValue("Authentication token is required. Please login again.");
      }

      if (!propertyId) {
          console.log(propertyId, "propertyId")
        return rejectWithValue("Property ID is required.");
      }

      const response = await fetch(
    `${PROPERTIES_API_URL}/${propertyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`, 
          }
        }
      );

      console.log('📡 Delete Response Status:', response.status);

      let data;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const textResponse = await response.text();
          console.log('📄 Delete Text Response:', textResponse);
          try {
            data = JSON.parse(textResponse);
          } catch {
            data = { success: true, message: textResponse };
          }
        }
      } catch {
        data = { success: true, message: 'Property deleted successfully' };
      }

      console.log('📦 Delete Response Data:', data);

      if (response.ok) {
        Toast.show('Property deleted successfully!');
        return {
          propertyId,
          landlordId,
          timestamp: new Date().toISOString()
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else if (response.status === 403) {
        return rejectWithValue('Access denied. You do not have permission to delete this property.');
      } else if (response.status === 404) {
        return rejectWithValue('Property not found.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ Delete API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('❌ Delete Network/Parse Error:', err);
      
      let errorMessage = 'Failed to delete property';
      
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


// Fixed getTenantProperties function for services.js
export const getTenantProperties = createAsyncThunk(
  'properties/getTenantProperties',
  async (params, { rejectWithValue }) => {
    const { tenantId, token } = params;

    try {
      console.log('🔍 getTenantProperties called with:', { tenantId, hasToken: !!token });

      if (!token) {
        console.error('❌ Invalid or missing token');
        return rejectWithValue('Authentication token is required.');
      }

      if (!tenantId) {
        console.error('❌ Invalid or missing tenant ID');
        return rejectWithValue('Tenant ID is required.');
      }

      console.log('🌐 Fetching from:', PROPERTIES_API_URL);
      console.log('🔑 Token (first 20 chars):', token.substring(0, 20) + '...');

      const response = await fetch(PROPERTIES_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Response Status:', response.status);
      console.log('📡 Response Headers:', Object.fromEntries(response.headers.entries()));

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.log('📄 Text Response:', textResponse);
        try {
          data = JSON.parse(textResponse);
        } catch {
          data = { items: [] };
        }
      }

      console.log('📦 Full API Response:', JSON.stringify(data, null, 2));

      if (response.ok) {
        // ✅ Extract properties array from response
        let properties = data?.items || data?.properties || data?.data || [];
        
        if (!Array.isArray(properties)) {
          console.warn('⚠️ Properties is not an array:', typeof properties);
          properties = [];
        }

        console.log(`📋 Total properties fetched: ${properties.length}`);

        // ✅ Filter properties where THIS tenant is in tenant_ids array
        const tenantProperties = properties.filter((property, index) => {
          console.log(`\n🔍 Checking property [${index}]:`, {
            name: property.name,
            property_id: property.property_id,
            tenant_ids: property.tenant_ids,
            landlord_id: property.landlord_id
          });

          // Check if tenant_ids array contains this tenant
          if (property.tenant_ids && Array.isArray(property.tenant_ids)) {
            const isMatch = property.tenant_ids.includes(tenantId);
            console.log(`  ${isMatch ? '✅' : '❌'} Match result:`, isMatch);
            return isMatch;
          }

          // Fallback: check old tenant_id field
          if (property.tenant_id === tenantId) {
            console.log('  ✅ Match via tenant_id field');
            return true;
          }

          console.log('  ❌ No match');
          return false;
        });

        console.log(`\n✅ Filtered tenant properties: ${tenantProperties.length}`);
        
        if (tenantProperties.length === 0) {
          console.warn('⚠️ No properties found for tenant:', tenantId);
          console.warn('Available properties:', properties.map(p => ({
            name: p.name,
            tenant_ids: p.tenant_ids
          })));
        }

        return tenantProperties;

      } else if (response.status === 401) {
        console.error('❌ Unauthorized - token may be expired');
        Toast.show('Session expired. Please login again.');
        return rejectWithValue('Session expired. Please login again.');
      } else if (response.status === 403) {
        console.error('❌ Forbidden - access denied');
        return rejectWithValue('Access denied. Please check your permissions.');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', errorMessage);
        Toast.show(errorMessage);
        return rejectWithValue(errorMessage);
      }

    } catch (err) {
      console.error('❌ Network/Parse Error:', err);
      console.error('Error stack:', err.stack);

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



export const getTenantById = createAsyncThunk(
  'properties/getTenantById',
  async (params, { rejectWithValue }) => {
    try {
      const { tenantId, token } = params;

      if (!tenantId) {
        return rejectWithValue('Tenant ID is required');
      }

      if (!token) {
        return rejectWithValue('Authentication token is required');
      }

      console.log('🔍 Fetching tenant:', tenantId);

      const TENANT_API_URL = 'https://70q2ntiu1f.execute-api.us-east-1.amazonaws.com/prod/tenants';

      const response = await fetch(`${TENANT_API_URL}/${tenantId}`, {
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
          data = null;
        }
      }

      console.log('📦 Tenant Response:', data);

      if (response.ok && data) {
        const tenant = data.tenant || data.item || data.data || data;

        return {
          id: tenant.tenant_id || tenant.id || tenantId,
          name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.name || 'Unknown Tenant',
          email: tenant.email || null,
          phone: tenant.phoneNumber || tenant.phone || null,
          avatar: tenant.avatar || tenant.profileImage || null,
          lease_start: tenant.lease_start_date || null,
          lease_end: tenant.lease_end_date || null,
        };
      } else if (response.status === 401) {
        return rejectWithValue('Session expired. Please login again.');
      } else if (response.status === 404) {
        return rejectWithValue('Tenant not found');
      } else {
        const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
        console.error('❌ API Error:', errorMessage);
        return rejectWithValue(errorMessage);
      }
    } catch (err) {
      console.error('❌ Network/Parse Error:', err);
      let errorMessage = 'Failed to fetch tenant';

      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = err.message || errorMessage;
      }

      return rejectWithValue(errorMessage);
    }
  }
);
