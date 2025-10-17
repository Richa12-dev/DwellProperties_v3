import React, { useEffect, useMemo, useCallback } from 'react';
import { RefreshControl, FlatList } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import {
  Box, Text, VStack, HStack, Button, Divider, Badge,
  StatusBar as RNStatusBar, Spinner, Spacer,
} from 'native-base';
import { Colors } from '../../Theme';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
import { getLandlordProperties, deleteProperty } from '../../Redux/Properties/services';
import { propertiesSelectors } from '../../Redux/Properties/propertiesSlice';
import { Image } from 'native-base';
import Swiper from 'react-native-swiper';
import { useNavigation } from '@react-navigation/native';

// Memoized Property Card Component
const PropertyCard = React.memo(({ property, index, onViewDetails, onEdit, onDelete }) => {
  const status = useMemo(() => {
    return property.is_available 
      ? { label: 'Available', color: 'green' }
      : { label: 'Occupied', color: 'red' };
  }, [property.is_available]);

  const propertyInfo = useMemo(() => {
    const bedrooms = property.bedrooms || 'N/A';
    const bathrooms = property.bathrooms || 'N/A';
    const rent = property.monthly_rent ? `$${property.monthly_rent}/mo` : 'N/A';
    return `${bedrooms}BR/${bathrooms}BA • ${rent}`;
  }, [property.bedrooms, property.bathrooms, property.monthly_rent]);

  const address = useMemo(() => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zip_code) parts.push(property.zip_code);
    return parts.join(', ');
  }, [property.address, property.city, property.state, property.zip_code]);

  const renderPropertyImage = useMemo(() => {
    if (!property.images || property.images.length === 0) {
      return (
        <Image
          source={require('../../Assets/Image/empty-box.png')}
          alt="Property"
          w="100%"
          h="100%"
          resizeMode="cover"
        />
      );
    }

    if (property.images.length === 1) {
      return (
        <Image
          source={{
            uri: property.images[0].startsWith('data:image')
              ? property.images[0]
              : `data:image/jpeg;base64,${property.images[0]}`,
          }}
          alt="Property"
          w="100%"
          h="100%"
          resizeMode="cover"
          fallbackSource={require('../../Assets/Image/empty-box.png')}
        />
      );
    }

    // For multiple images, only render Swiper when visible
    return (
      <Swiper 
        autoplay={false} // Disable autoplay for better performance
        loop 
        showsPagination={false}
        loadMinimal={true} // Load only visible slides
        loadMinimalSize={1}
      >
        {property.images.slice(0, 3).map((img, idx) => { // Limit to 3 images
          let source = null;
          if (typeof img === 'string') {
            source = {
              uri: img.startsWith('data:image')
                ? img
                : `data:image/jpeg;base64,${img}`,
            };
          } else if (img.uri) {
            source = { uri: img.uri };
          } else if (img.base64) {
            source = { uri: `data:image/jpeg;base64,${img.base64}` };
          }
          return (
            <Image
              key={idx}
              source={source}
              alt={`Property-${idx}`}
              w="100%"
              h="100%"
              resizeMode="cover"
              fallbackSource={require('../../Assets/Image/empty-box.png')}
            />
          );
        })}
      </Swiper>
    );
  }, [property.images]);

  const propertyId = property.id || property.ID;

  return (
    <Box
      bg="white"
      p={4}
      rounded="xl"
      shadow={2}
      borderWidth={1}
      borderColor="gray.100"
      mb={4}
    >
      {/* Header */}
      <HStack justifyContent="space-between" alignItems="flex-start">
        <Text fontSize="lg" bold numberOfLines={2} flex={1} mr={2}>
          {property.name || 'Unnamed Property'}
        </Text>
        <Badge
          colorScheme={status.color}
          rounded="md"
          variant="subtle"
          px={3}
          py={1}
        >
          {status.label}
        </Badge>
      </HStack>

      {/* Image + Info */}
      <HStack space={3} alignItems="flex-start" mt={3}>
        <Box w={24} h={24} rounded="md" overflow="hidden">
          {renderPropertyImage}
        </Box>

        <VStack flex={1} space={2}>
          {address && (
            <Text fontSize="sm" color="gray.600" numberOfLines={2}>
              📍 {address}
            </Text>
          )}
          <Text fontSize="sm" color="gray.600">
            🏠 {propertyInfo}
          </Text>
          {property.property_type && (
            <Text fontSize="sm" color="blue.600" fontWeight="medium">
              🏢 {property.property_type}
            </Text>
          )}
        </VStack>
      </HStack>

      {/* Actions */}
      <Divider mt={3} />
      <HStack space={2} mt={2} alignItems="center">
        <Button
          size="sm"
          variant="ghost"
          colorScheme="blue"
          onPress={() => onViewDetails(property)}
        >
          View Details
        </Button>
        <Spacer />
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onPress={() => onEdit(property)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          colorScheme="red"
          onPress={() => onDelete(propertyId)}
        >
          Delete
        </Button>
      </HStack>
    </Box>
  );
});

// Memoized Statistics Component
const StatisticsHeader = React.memo(({ totalProperties, totalUnits, occupiedUnits, vacantUnits, onAddProperty, hasProperties, loading }) => (
  <VStack space={4} mb={4}>
    {/* Statistics Cards */}
    <HStack space={2}>
      <Box flex={1} bg="white" p={3} rounded="lg" shadow={1}>
        <Text fontSize="xs" color="gray.500">Total Properties</Text>
        <Text fontSize="xl" bold color="blue.600">{totalProperties || 0}</Text>
      </Box>
      <Box flex={1} bg="white" p={3} rounded="lg" shadow={1}>
        <Text fontSize="xs" color="gray.500">Total Units</Text>
        <Text fontSize="xl" bold color="blue.600">{totalUnits || 0}</Text>
      </Box>
      <Box flex={1} bg="white" p={3} rounded="lg" shadow={1}>
        <Text fontSize="xs" color="gray.500">Occupied</Text>
        <Text fontSize="xl" bold color="green.600">{occupiedUnits || 0}</Text>
      </Box>
      <Box flex={1} bg="white" p={3} rounded="lg" shadow={1}>
        <Text fontSize="xs" color="gray.500">Vacant</Text>
        <Text fontSize="xl" bold color="orange.600">{vacantUnits || 0}</Text>
      </Box>
    </HStack>

    {/* No properties message */}
    {!hasProperties && !loading && (
      <Box bg="white" p={8} rounded="xl" shadow={2} alignItems="center">
        <Text color="gray.500" fontSize="md">No properties found</Text>
        <Text color="gray.400" fontSize="sm" mt={1} textAlign="center">
          Add your first property to get started
        </Text>
        <Button mt={4} size="sm" onPress={onAddProperty}>
          Add Property
        </Button>
      </Box>
    )}
  </VStack>
));

const LandlordProperties = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const {
    landlordProperties,
    loading,
    error,
    totalProperties,
    totalUnits,
    occupiedUnits,
    vacantUnits
  } = useSelector(propertiesSelectors.getPropertiesData);

  // Memoized selectors for better performance
  const authData = useSelector(state => state.loginData || state.login || {});
  const authToken = useMemo(() => authData?.token, [authData]);
  const landlordId = useMemo(() => authData?.userData?.landlordId || authData?.user?.landlordId, [authData]);

  // Memoized computed values
  const hasProperties = useMemo(() => landlordProperties && landlordProperties.length > 0, [landlordProperties]);
  const isAuthenticated = useMemo(() => Boolean(landlordId && authToken), [landlordId, authToken]);

  // Fetch properties effect
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getLandlordProperties({ 
        landlordId: landlordId,
        token: authToken 
      }));
    } else {
      console.warn('Missing auth data:', { landlordId: !!landlordId, authToken: !!authToken });
    }
  }, [dispatch, landlordId, authToken, isAuthenticated]);

  // Memoized callbacks
  const handleRefresh = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getLandlordProperties({ 
        landlordId: landlordId,
        token: authToken 
      }));
    } else {
      Toast.show('Please login again to view properties');
    }
  }, [dispatch, landlordId, authToken, isAuthenticated]);

  const handleAddProperty = useCallback(() => {
    navigation.navigate('AddPropertiesScreen');
  }, [navigation]);

  const handleViewDetails = useCallback((property) => {
    navigation.navigate('PropertyDetails', { property });
  }, [navigation]);

  const handleEdit = useCallback((property) => {
    navigation.navigate('AddPropertiesScreen', { propertyData: property });
  }, [navigation]);

  const handleDeleteProperty = useCallback((propertyId) => {
    if (!isAuthenticated) {
      Toast.show('Please login again to delete properties');
      return;
    }

    dispatch(deleteProperty({ 
      propertyId: propertyId, 
      token: authToken, 
      landlordId: landlordId 
    }))
      .unwrap()
      .then(() => {
        console.log('Property deleted successfully, refreshing list');
        handleRefresh();
      })
      .catch(err => {
        console.error('Delete property error:', err);
        Toast.show(err || 'Failed to delete property');
      });
  }, [dispatch, authToken, landlordId, isAuthenticated, handleRefresh]);

  // Memoized key extractor
  const keyExtractor = useCallback((item, index) => String(item.id || item.ID || index), []);

  // Memoized render item
  const renderItem = useCallback(({ item: property, index }) => (
    <PropertyCard
      property={property}
      index={index}
      onViewDetails={handleViewDetails}
      onEdit={handleEdit}
      onDelete={handleDeleteProperty}
    />
  ), [handleViewDetails, handleEdit, handleDeleteProperty]);

  // Memoized header component
  const listHeader = useMemo(() => (
    <StatisticsHeader
      totalProperties={totalProperties}
      totalUnits={totalUnits}
      occupiedUnits={occupiedUnits}
      vacantUnits={vacantUnits}
      onAddProperty={handleAddProperty}
      hasProperties={hasProperties}
      loading={loading}
    />
  ), [totalProperties, totalUnits, occupiedUnits, vacantUnits, handleAddProperty, hasProperties, loading]);

  // Loading state
  if (loading && !hasProperties) {
    return (
      <>
        <RNStatusBar
          backgroundColor={Colors.black || Colors.red || "#FF0000"}
          barStyle="light-content"
          translucent={false}
        />
        <CollectionNavBar />
        <Box flex={1} bg="#f5f5f5" justifyContent="center" alignItems="center">
          <Spinner size="lg" color="blue.500" />
          <Text mt={4} fontSize="md" color="gray.600">Loading properties...</Text>
        </Box>
      </>
    );
  }

  // Authentication check
  if (!isAuthenticated) {
    return (
      <>
        <RNStatusBar
          backgroundColor={Colors.black || Colors.red || "#FF0000"}
          barStyle="light-content"
          translucent={false}
        />
        <CollectionNavBar />
        <Box flex={1} bg="#f5f5f5" justifyContent="center" alignItems="center">
          <Text fontSize="lg" color="red.500">Please login as a landlord to view properties</Text>
          <Button mt={4} onPress={() => navigation.navigate('Login')}>
            Go to Login
          </Button>
        </Box>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <RNStatusBar
          backgroundColor={Colors.black || Colors.red || "#FF0000"}
          barStyle="light-content"
          translucent={false}
        />
        <CollectionNavBar />
        <Box flex={1} bg="#f5f5f5" justifyContent="center" alignItems="center" px={4}>
          <Text fontSize="lg" color="red.500" textAlign="center">
            Error loading properties
          </Text>
          <Text fontSize="sm" color="gray.600" textAlign="center" mt={2}>
            {error}
          </Text>
          <Button mt={4} onPress={handleRefresh}>
            Retry
          </Button>
        </Box>
      </>
    );
  }

  return (
    <>
      <RNStatusBar
        backgroundColor={Colors.black || Colors.red || "#FF0000"}
        barStyle="light-content"
        translucent={false}
      />
      <CollectionNavBar />

      <HStack
        justifyContent="space-between"
        alignItems="center"
        px={4}
        py={3}
        bg="white"
        shadow={2}
      >
        <Text fontSize="xl" bold>My Properties</Text>
        <Button
          size="sm"
          bg="black"
          _text={{ color: 'white' }}
          onPress={handleAddProperty}
        >
          + Add Property
        </Button>
      </HStack>

      <FlatList
        data={landlordProperties || []}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={listHeader}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        updateCellsBatchingPeriod={30}
        initialNumToRender={10}
        windowSize={10}
        getItemLayout={undefined} // Let FlatList calculate automatically for better performance
      />
    </>
  );
};

export default LandlordProperties;