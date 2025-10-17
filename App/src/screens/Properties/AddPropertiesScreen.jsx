import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  Alert as RNAlert,
  PermissionsAndroid
} from 'react-native';
import {
  VStack,
  HStack,
  Button,
  Text,
  Box,
  FormControl,
  Input,
  Select,
  CheckIcon,
  Switch,
  Alert,
  Spinner,
  Pressable,
  Image,
  FlatList, 
  Toast
} from 'native-base';
import { useNavigation , useRoute } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { createProperty, updateProperty, validateTenantIdSimple } from '../../Redux/Properties/services';
import { propertiesSelectors, clearError } from '../../Redux/Properties/propertiesSlice';
import { Colors } from '../../Theme';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';

const AddPropertyScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { loading, error } = useSelector(propertiesSelectors.getPropertiesData);

  // Get authentication data from Redux store
  const loginData = useSelector(state => state.loginData || state.login || {});
  const authToken = loginData?.token;
  const landlordId = loginData?.userData?.landlordId || loginData?.userData?.id || loginData?.user?.landlordId || loginData?.user?.id;

  console.log('🏠 AddProperty - Auth Info:', {
    hasToken: !!authToken,
    landlordId: landlordId,
    userRole: loginData?.userData?.role || loginData?.user?.role
  });

  // Check if route.params has property data for edit mode
  const editProperty = route?.params?.propertyData || null;
  const isEditMode = !!editProperty;

  const [formData, setFormData] = useState({
    name: editProperty?.name || '',
    address: editProperty?.address || '',
    city: editProperty?.city || '',
    state: editProperty?.state || '',
    zip_code: editProperty?.zip_code || '',
    property_type: editProperty?.property_type || 'Apartment',
    bedrooms: editProperty?.bedrooms?.toString() || '1',
    bathrooms: editProperty?.bathrooms?.toString() || '1',
    square_footage: editProperty?.square_footage?.toString() || '',
    year_built: editProperty?.year_built?.toString() || '',
    monthly_rent: editProperty?.monthly_rent?.toString() || '',
    security_deposit: editProperty?.security_deposit?.toString() || '',
    is_available: editProperty?.is_available ?? true,
    furnished: editProperty?.furnished ?? false,
    parking: editProperty?.parking ?? false,
    elevator: editProperty?.elevator ?? false,
    description: editProperty?.description || '',
    images: editProperty?.images || [],
    tenant_id: editProperty?.tenant_id || '',
    tenant_name: editProperty?.tenant_name || '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [tenantValidation, setTenantValidation] = useState({
    isValidating: false,
    isValid: null,
    tenantInfo: null,
    error: null
  });

  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Auto-set availability based on tenant assignment
    if (formData.tenant_id && tenantValidation.isValid) {
      setFormData(prev => ({ ...prev, is_available: false }));
    } else if (!formData.tenant_id) {
      setFormData(prev => ({ ...prev, is_available: true }));
    }
  }, [formData.tenant_id, tenantValidation.isValid]);

  const resetForm = () => {
    if (editProperty) {
      // If editing, reset to original data
      setFormData({
        ...editProperty,
        bedrooms: editProperty?.bedrooms?.toString(),
        bathrooms: editProperty?.bathrooms?.toString(),
        square_footage: editProperty?.square_footage?.toString(),
        year_built: editProperty?.year_built?.toString(),
        monthly_rent: editProperty?.monthly_rent?.toString(),
        security_deposit: editProperty?.security_deposit?.toString(),
      });
    } else {
      // If adding new property, reset to empty
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        zip_code: '',
        property_type: 'Apartment',
        bedrooms: '1',
        bathrooms: '1',
        square_footage: '',
        year_built: '',
        monthly_rent: '',
        security_deposit: '',
        is_available: true,
        furnished: false,
        parking: false,
        elevator: false,
        description: '',
        images: [],
        tenant_id: '',
        tenant_name: '',
      });
    }
    setFormErrors({});
    setTenantValidation({
      isValidating: false,
      isValid: null,
      tenantInfo: null,
      error: null
    });
  };

  // Simple tenant validation function - uses the simple validation since main API might not be ready
  const validateTenant = async (tenantId) => {
    if (!tenantId.trim()) {
      setTenantValidation({
        isValidating: false,
        isValid: null,
        tenantInfo: null,
        error: null
      });
      return;
    }

    setTenantValidation(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      // Use simple validation for now
      const result = await dispatch(validateTenantIdSimple(tenantId)).unwrap();
      
      console.log('✅ Tenant validation result:', result);
      
      if (result.isValid) {
        setTenantValidation({
          isValidating: false,
          isValid: true,
          tenantInfo: result.tenantInfo,
          error: null
        });
        
        // Auto-fill tenant name if available
        if (result.tenantInfo.name) {
          setFormData(prev => ({ ...prev, tenant_name: result.tenantInfo.name }));
        }
      } else {
        setTenantValidation({
          isValidating: false,
          isValid: false,
          tenantInfo: null,
          error: result.message || 'Invalid tenant ID format'
        });
      }
    } catch (error) {
      console.error('❌ Tenant validation error:', error);
      
      setTenantValidation({
        isValidating: false,
        isValid: false,
        tenantInfo: null,
        error: error.message || 'Failed to validate tenant ID'
      });
    }
  };

  // Debounced tenant validation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.tenant_id !== (editProperty?.tenant_id || '')) {
        validateTenant(formData.tenant_id);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.tenant_id]);

  // Image handling functions (keeping existing ones)
  const convertToBase64 = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        const reader = new FileReader();
        reader.onloadend = function() {
          resolve(reader.result.split(',')[1]); // Remove data:image/...;base64, prefix
        };
        reader.readAsDataURL(xhr.response);
      };
      xhr.onerror = reject;
      xhr.open('GET', uri);
      xhr.responseType = 'blob';
      xhr.send();
    });
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    RNAlert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
    };

    launchCamera(options, handleImageResponse);
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
      selectionLimit: 5 - formData.images.length, // Limit total images to 5
    };

    launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = async (response) => {
    if (response.didCancel || response.error) return;

    try {
      const newImages = [];
      const assets = response.assets || [response];
      
      for (const asset of assets) {
        if (asset.uri) {
          const base64 = await convertToBase64(asset.uri);
          newImages.push(base64);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Max 5 images
      }));
    } catch (error) {
      console.error('Error converting image to base64:', error);
      RNAlert.alert('Error', 'Failed to process image');
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Property name is required';
    }

    if (formData.monthly_rent && isNaN(parseFloat(formData.monthly_rent))) {
      errors.monthly_rent = 'Monthly rent must be a valid number';
    }

    if (formData.security_deposit && isNaN(parseFloat(formData.security_deposit))) {
      errors.security_deposit = 'Security deposit must be a valid number';
    }

    if (formData.square_footage && isNaN(parseInt(formData.square_footage))) {
      errors.square_footage = 'Square footage must be a valid number';
    }

    if (formData.year_built && (isNaN(parseInt(formData.year_built)) || parseInt(formData.year_built) < 1800 || parseInt(formData.year_built) > new Date().getFullYear())) {
      errors.year_built = 'Year built must be a valid year';
    }

    if (formData.zip_code && formData.zip_code.length > 0 && !/^\d{5}(-\d{4})?$/.test(formData.zip_code)) {
      errors.zip_code = 'Zip code must be in format 12345 or 12345-6789';
    }

    // Tenant validation - only validate if tenant_id is provided
    if (formData.tenant_id && !tenantValidation.isValid) {
      errors.tenant_id = tenantValidation.error || 'Please enter a valid tenant ID';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Generate unique property ID
  const generatePropertyId = () => {
    return `prop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // CORRECTED handleSubmit function based on API structure
  const handleSubmit = async () => {
    // Validate authentication first
    if (!authToken || !landlordId) {
      RNAlert.alert('Authentication Error', 'Please login again to continue');
      return;
    }

    if (!validateForm()) return;

    // Generate property ID for new properties
    const propertyId = isEditMode ? (editProperty.id || editProperty.ID) : generatePropertyId();

    // Prepare payload based on your cURL example
    const propertyPayload = {
      // Basic property information
      name: formData.name.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      zip_code: formData.zip_code.trim(),
      property_type: formData.property_type,
      
      // Property specifications (keeping as strings to match API)
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      square_footage: formData.square_footage || null,
      year_built: formData.year_built || null,
      
      // Financial information (keeping as strings to match API)
      monthly_rent: formData.monthly_rent || null,
      security_deposit: formData.security_deposit || null,
      
      // Property status - CRITICAL: Based on tenant assignment
      is_available: !formData.tenant_id?.trim(), // false if tenant assigned, true otherwise
      
      // Amenities
      furnished: formData.furnished,
      parking: formData.parking,
      elevator: formData.elevator,
      
      // Description and images
      description: formData.description.trim(),
      images: formData.images,
      
      // CRITICAL: Tenant assignment fields - this is the key for tenant filtering
      tenant_id: formData.tenant_id?.trim() || null,
      tenant_name: formData.tenant_name?.trim() || null,
      
      // Property ownership (for landlord filtering)
      landlord_id: landlordId,
      owner_id: landlordId, // Alternative field
      user_id: landlordId,   // Alternative field
      
      // Timestamps
      created_at: isEditMode ? editProperty.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: isEditMode ? editProperty.created_by : landlordId,
      updated_by: landlordId,
    };

    // Add ID field for updates
    if (isEditMode) {
      propertyPayload.id = propertyId;
      propertyPayload.ID = propertyId; // Alternative field
    }

    console.log('🏠 Submitting property:', {
      isEditMode,
      propertyId,
      propertyName: propertyPayload.name,
      tenantId: propertyPayload.tenant_id,
      isAvailable: propertyPayload.is_available,
      landlordId: propertyPayload.landlord_id
    });

    try {
      let result;
      
      if (isEditMode) {
        // For updates, you might need to use PATCH based on your cURL example
        // But first try with the existing updateProperty function
        result = await dispatch(updateProperty({
          propertyId: propertyId,
          propertyData: propertyPayload,
          token: authToken,
          landlordId: landlordId
        })).unwrap();
        
        console.log('✅ Property updated successfully');
      } else {
        // Create new property
        result = await dispatch(createProperty({
          propertyData: propertyPayload,
          token: authToken,
          landlordId: landlordId
        })).unwrap();
        
        console.log('✅ Property created successfully');
      }

      // Show success message
      const tenantAssignmentMessage = formData.tenant_id?.trim() 
        ? ` and assigned to tenant ${formData.tenant_name || formData.tenant_id}`
        : '';
        
      RNAlert.alert(
        'Success', 
        `Property ${isEditMode ? 'updated' : 'created'} successfully${tenantAssignmentMessage}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetForm();
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Failed to save property:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      RNAlert.alert('Error', errorMessage);
    }
  };

  const handleSubmitTenant = async () => {
    if (!validateForm()) return;

    // Show confirmation if assigning tenant
    if (formData.tenant_id && tenantValidation.isValid) {
      const tenantName = tenantValidation.tenantInfo?.name || formData.tenant_id;
      RNAlert.alert(
        'Confirm Tenant Assignment',
        `Are you sure you want to assign "${tenantName}" to this property?\n\nThis will mark the property as occupied.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Assign', onPress: () => handleSubmit() }
        ]
      );
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (JSON.stringify(formData) !== JSON.stringify({
      name: editProperty?.name || '',
      address: editProperty?.address || '',
      city: editProperty?.city || '',
      state: editProperty?.state || '',
      zip_code: editProperty?.zip_code || '',
      property_type: editProperty?.property_type || 'Apartment',
      bedrooms: editProperty?.bedrooms?.toString() || '1',
      bathrooms: editProperty?.bathrooms?.toString() || '1',
      square_footage: editProperty?.square_footage?.toString() || '',
      year_built: editProperty?.year_built?.toString() || '',
      monthly_rent: editProperty?.monthly_rent?.toString() || '',
      security_deposit: editProperty?.security_deposit?.toString() || '',
      is_available: editProperty?.is_available ?? true,
      furnished: editProperty?.furnished ?? false,
      parking: editProperty?.parking ?? false,
      elevator: editProperty?.elevator ?? false,
      description: editProperty?.description || '',
      images: editProperty?.images || [],
      tenant_id: editProperty?.tenant_id || '',
      tenant_name: editProperty?.tenant_name || '',
    })) {
      RNAlert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Stay', style: 'cancel' },
          { text: 'Discard', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderImageItem = ({ item, index }) => (
    <Box mr={3} position="relative">
      <Image 
        source={{ uri: `data:image/jpeg;base64,${item}` }}
        alt={`Property image ${index + 1}`}
        size="lg"
        rounded="md"
      />
      <Pressable
        position="absolute"
        top={1}
        right={1}
        bg="red.500"
        rounded="full"
        p={1}
        onPress={() => removeImage(index)}
      >
        <Ionicons name="close" size={12} color="white" />
      </Pressable>
    </Box>
  );

  return (
    <>
      <RNStatusBar
        backgroundColor={Colors.black || Colors.red || "#FF0000"}
        barStyle="light-content"
        translucent={false}
      />
       <CollectionNavBar />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        flex={1}
        bg="#f5f5f5"
      >
        <ScrollView showsVerticalScrollIndicator={false} p={4}>
          <VStack space={4} p={4}>
            {/* Property Name */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <FormControl isRequired isInvalid={!!formErrors.name}>
                <FormControl.Label>
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="home-outline" size={18} color="#666" />
                    <Text fontSize="md" bold>Property Name</Text>
                  </HStack>
                </FormControl.Label>
                <Input
                  value={formData.name}
                  onChangeText={(text) => handleInputChange('name', text)}
                  placeholder="Enter property name"
                  _focus={{ borderColor: 'blue.500' }}
                />
                {formErrors.name && (
                  <FormControl.ErrorMessage>
                    <Text>{formErrors.name}</Text>
                  </FormControl.ErrorMessage>
                )}
              </FormControl>
            </Box>

            {/* Property Images */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="camera-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Property Images</Text>
                  <Text fontSize="sm" color="gray.500">({formData.images.length}/5)</Text>
                </HStack>

                {formData.images.length > 0 && (
                  <FlatList
                    data={formData.images}
                    renderItem={renderImageItem}
                    keyExtractor={(item, index) => index.toString()}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                  />
                )}

                <Button
                  variant="outline"
                  colorScheme="blue"
                  onPress={showImagePicker}
                  isDisabled={formData.images.length >= 5}
                  leftIcon={<Ionicons name="add-outline" size={18} color="#3182ce" />}
                >
                  <Text>Add Images</Text>
                </Button>
              </VStack>
            </Box>

            {/* Address Information */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="location-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Address Information</Text>
                </HStack>

                <FormControl>
                  <FormControl.Label>
                    <Text>Street Address</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.address}
                    onChangeText={(text) => handleInputChange('address', text)}
                    placeholder="Enter street address"
                    _focus={{ borderColor: 'blue.500' }}
                  />
                </FormControl>

                <HStack space={3}>
                  <FormControl flex={2}>
                    <FormControl.Label>
                      <Text>City</Text>
                    </FormControl.Label>
                    <Input
                      value={formData.city}
                      onChangeText={(text) => handleInputChange('city', text)}
                      placeholder="City"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                  </FormControl>
                  <FormControl flex={1}>
                    <FormControl.Label>
                      <Text>State</Text>
                    </FormControl.Label>
                    <Input
                      value={formData.state}
                      onChangeText={(text) => handleInputChange('state', text)}
                      placeholder="State"
                      maxLength={30}
                      _focus={{ borderColor: 'blue.500' }}
                    />
                  </FormControl>
                </HStack>

                <FormControl isInvalid={!!formErrors.zip_code}>
                  <FormControl.Label>
                    <Text>Zip Code</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.zip_code}
                    onChangeText={(text) => handleInputChange('zip_code', text)}
                    placeholder="12345 or 12345-6789"
                    keyboardType="numeric"
                    _focus={{ borderColor: 'blue.500' }}
                  />
                  {formErrors.zip_code && (
                    <FormControl.ErrorMessage>
                      <Text>{formErrors.zip_code}</Text>
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>
              </VStack>
            </Box>

            {/* Property Details */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="business-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Property Details</Text>
                </HStack>

                <FormControl>
                  <FormControl.Label>
                    <Text>Property Type</Text>
                  </FormControl.Label>
                  <Select
                    selectedValue={formData.property_type}
                    onValueChange={(value) => handleInputChange('property_type', value)}
                    _selectedItem={{
                      bg: "blue.100",
                      endIcon: <CheckIcon size="5" />
                    }}
                  >
                    <Select.Item label="Apartment" value="Apartment" />
                    <Select.Item label="House" value="House" />
                    <Select.Item label="Condo" value="Condo" />
                    <Select.Item label="Townhouse" value="Townhouse" />
                    <Select.Item label="Duplex" value="Duplex" />
                    <Select.Item label="Studio" value="Studio" />
                    <Select.Item label="Villa" value="Villa" />
                    <Select.Item label="Penthouse" value="Penthouse" />
                  </Select>
                </FormControl>

                <HStack space={3}>
                  <FormControl flex={1}>
                    <FormControl.Label>
                      <Text>Bedrooms</Text>
                    </FormControl.Label>
                    <Select
                      selectedValue={formData.bedrooms}
                      onValueChange={(value) => handleInputChange('bedrooms', value)}
                      _selectedItem={{
                        bg: "blue.100",
                        endIcon: <CheckIcon size="5" />
                      }}
                    >
                      <Select.Item label="Studio" value="0" />
                      <Select.Item label="1 BHK" value="1" />
                      <Select.Item label="2 BHK" value="2" />
                      <Select.Item label="3 BHK" value="3" />
                      <Select.Item label="4 BHK" value="4" />
                      <Select.Item label="5+ BHK" value="5" />
                    </Select>
                  </FormControl>
                  <FormControl flex={1}>
                    <FormControl.Label>
                      <Text>Bathrooms</Text>
                    </FormControl.Label>
                    <Select
                      selectedValue={formData.bathrooms}
                      onValueChange={(value) => handleInputChange('bathrooms', value)}
                      _selectedItem={{
                        bg: "blue.100",
                        endIcon: <CheckIcon size="5" />
                      }}
                    >
                      <Select.Item label="1" value="1" />
                      <Select.Item label="1.5" value="1.5" />
                      <Select.Item label="2" value="2" />
                      <Select.Item label="2.5" value="2.5" />
                      <Select.Item label="3" value="3" />
                      <Select.Item label="3.5" value="3.5" />
                      <Select.Item label="4+" value="4" />
                    </Select>
                  </FormControl>
                </HStack>

                <HStack space={3}>
                  <FormControl flex={1} isInvalid={!!formErrors.square_footage}>
                    <FormControl.Label>
                      <Text>Area (sq ft)</Text>
                    </FormControl.Label>
                    <Input
                      value={formData.square_footage}
                      onChangeText={(text) => handleInputChange('square_footage', text)}
                      placeholder="1000"
                      keyboardType="numeric"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    {formErrors.square_footage && (
                      <FormControl.ErrorMessage>
                        <Text>{formErrors.square_footage}</Text>
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                  <FormControl flex={1} isInvalid={!!formErrors.year_built}>
                    <FormControl.Label>
                      <Text>Year Built</Text>
                    </FormControl.Label>
                    <Input
                      value={formData.year_built}
                      onChangeText={(text) => handleInputChange('year_built', text)}
                      placeholder="2020"
                      keyboardType="numeric"
                      maxLength={4}
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    {formErrors.year_built && (
                      <FormControl.ErrorMessage>
                        <Text>{formErrors.year_built}</Text>
                      </FormControl.ErrorMessage>
                    )}
                  </FormControl>
                </HStack>
              </VStack>
            </Box>

            {/* Pricing Information */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="cash-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Pricing</Text>
                </HStack>

                <FormControl isInvalid={!!formErrors.monthly_rent}>
                  <FormControl.Label>
                    <Text>Monthly Rent ($)</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.monthly_rent}
                    onChangeText={(text) => handleInputChange('monthly_rent', text)}
                    placeholder="25000"
                    keyboardType="numeric"
                    InputLeftElement={
                      <Box ml={3}>
                        <Text color="gray.500">$</Text>
                      </Box>
                    }
                    _focus={{ borderColor: 'blue.500' }}
                  />
                  {formErrors.monthly_rent && (
                    <FormControl.ErrorMessage>
                      <Text>{formErrors.monthly_rent}</Text>
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!formErrors.security_deposit}>
                  <FormControl.Label>
                    <Text>Security Deposit ($)</Text>
                  </FormControl.Label>
                  <Input
                    value={formData.security_deposit}
                    onChangeText={(text) => handleInputChange('security_deposit', text)}
                    placeholder="50000"
                    keyboardType="numeric"
                    InputLeftElement={
                      <Box ml={3}>
                        <Text color="gray.500">$</Text>
                      </Box>
                    }
                    _focus={{ borderColor: 'blue.500' }}
                  />
                  {formErrors.security_deposit && (
                    <FormControl.ErrorMessage>
                      <Text>{formErrors.security_deposit}</Text>
                    </FormControl.ErrorMessage>
                  )}
                </FormControl>
              </VStack>
            </Box>

            {/* Amenities */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="star-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Amenities</Text>
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="bed-outline" size={16} color="#666" />
                    <Text>Furnished</Text>
                  </HStack>
                  <Switch
                    value={formData.furnished}
                    onToggle={(value) => handleInputChange('furnished', value)}
                    colorScheme="blue"
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="car-outline" size={16} color="#666" />
                    <Text>Parking Available</Text>
                  </HStack>
                  <Switch
                    value={formData.parking}
                    onToggle={(value) => handleInputChange('parking', value)}
                    colorScheme="blue"
                  />
                </HStack>

                <HStack justifyContent="space-between" alignItems="center">
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="arrow-up-outline" size={16} color="#666" />
                    <Text>Elevator/Lift</Text>
                  </HStack>
                  <Switch
                    value={formData.elevator}
                    onToggle={(value) => handleInputChange('elevator', value)}
                    colorScheme="blue"
                  />
                </HStack>
              </VStack>
            </Box>

            {/* Availability Status */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <FormControl>
                <FormControl.Label>
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="checkmark-circle-outline" size={18} color="#666" />
                    <Text fontSize="md" bold>Availability Status</Text>
                  </HStack>
                </FormControl.Label>
                <Select
                  selectedValue={formData.is_available.toString()}
                  onValueChange={(value) => handleInputChange('is_available', value === 'true')}
                  _selectedItem={{
                    bg: "blue.100",
                    endIcon: <CheckIcon size="5" />
                  }}
                >
                  <Select.Item label="Available for Rent" value="true" />
                  <Select.Item label="Currently Occupied" value="false" />
                </Select>
              </FormControl>
            </Box>

            {/* Tenant Assignment Section */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <VStack space={4}>
                <HStack alignItems="center" space={2} mb={2}>
                  <Ionicons name="person-outline" size={18} color="#666" />
                  <Text fontSize="md" bold color="gray.700">Tenant Assignment</Text>
                  <Text fontSize="sm" color="gray.500">(Optional)</Text>
                </HStack>

                <FormControl isInvalid={!!formErrors.tenant_id}>
                  <FormControl.Label>
                    <Text>Tenant ID</Text>
                  </FormControl.Label>
                  <HStack alignItems="center" space={2}>
                    <Input
                      flex={1}
                      value={formData.tenant_id}
                      onChangeText={(text) => handleInputChange('tenant_id', text)}
                      placeholder="Enter tenant ID to assign"
                      _focus={{ borderColor: 'blue.500' }}
                    />
                    {tenantValidation.isValidating && (
                      <Spinner size="sm" color="blue.500" />
                    )}
                    {tenantValidation.isValid === true && (
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    )}
                    {tenantValidation.isValid === false && (
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    )}
                  </HStack>
                  
                  {formErrors.tenant_id && (
                    <FormControl.ErrorMessage>
                      <Text>{formErrors.tenant_id}</Text>
                    </FormControl.ErrorMessage>
                  )}
                  
                  {tenantValidation.error && (
                    <Text fontSize="sm" color="red.500" mt={1}>
                      {tenantValidation.error}
                    </Text>
                  )}
                  
                  {tenantValidation.isValid && tenantValidation.tenantInfo && (
                    <Box bg="green.50" p={3} rounded="md" mt={2}>
                      <Text fontSize="sm" color="green.700" bold>
                        Tenant Found: {tenantValidation.tenantInfo.name}
                      </Text>
                    </Box>
                  )}
                </FormControl>

                {formData.tenant_id && (
                  <FormControl>
                    <FormControl.Label>
                      <Text>Tenant Name</Text>
                    </FormControl.Label>
                    <Input
                      value={formData.tenant_name}
                      onChangeText={(text) => handleInputChange('tenant_name', text)}
                      placeholder="Tenant name (auto-filled if ID is valid)"
                      isReadOnly={tenantValidation.isValid}
                      bg={tenantValidation.isValid ? "gray.100" : "white"}
                      _focus={{ borderColor: 'blue.500' }}
                    />
                  </FormControl>
                )}

                {formData.tenant_id && (
                  <Box bg="blue.50" p={3} rounded="md">
                    <Text fontSize="sm" color="blue.700">
                      <Ionicons name="information-circle" size={16} /> 
                      Assigning a tenant will automatically mark this property as occupied.
                    </Text>
                  </Box>
                )}
              </VStack>
            </Box>

            {/* Description */}
            <Box bg="white" p={4} rounded="xl" shadow={2}>
              <FormControl>
                <FormControl.Label>
                  <HStack alignItems="center" space={2}>
                    <Ionicons name="document-text-outline" size={18} color="#666" />
                    <Text fontSize="md" bold>Description (Optional)</Text>
                  </HStack>
                </FormControl.Label>
                <Input
                  value={formData.description}
                  onChangeText={(text) => handleInputChange('description', text)}
                  placeholder="Brief description of the property..."
                  multiline
                  numberOfLines={3}
                  _focus={{ borderColor: 'blue.500' }}
                />
              </FormControl>
            </Box>

          </VStack>
        </ScrollView>

        {/* Bottom Action Buttons */}
        <Box bg="white" space={4} p={4} px={4} py={3} safeAreaBottom shadow={6}>
          <HStack space={3}>
            <Button
              flex={1}
              variant="outline"
              colorScheme="gray"
              onPress={handleBack}
              isDisabled={loading}
              leftIcon={<Ionicons name="close-outline" size={18} color="#666" />}
            >
              <Text>Cancel</Text>
            </Button>
            <Button
              flex={2}
              colorScheme="red"
              onPress={handleSubmitTenant}
              isLoading={loading}
              isDisabled={loading || !formData.name.trim()}
              leftIcon={loading ? <Spinner size="sm" color="white" /> : <Ionicons name="add-circle-outline" size={18} color="white" />}
            >
              <Text color="white">{loading ? (editProperty ? 'Updating Property...' : 'Adding Property...') : (editProperty ? 'Update Property' : 'Add Property')}</Text>
            </Button>
          </HStack>
        </Box>
      </KeyboardAvoidingView>
    </>
  );
};

export default AddPropertyScreen;