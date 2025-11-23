import React, { useEffect, useMemo, useCallback, useState } from 'react';
import { RefreshControl, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-simple-toast';
import {
  View, Box, Text, VStack, HStack, Button, Badge,
  Spinner, Pressable, Image,
} from 'native-base';
import Modal from 'react-native-modal';
import { Colors } from '../../Theme';
import { getLandlordProperties, deleteProperty } from '../../Redux/Properties/services';
import { propertiesSelectors } from '../../Redux/Properties/propertiesSlice';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Container from '../../components/Container/Container';
import PropertyFilters from '../../components/PropertyFilters/PropertyFilters';
import AddPropertiesScreen from './AddPropertiesScreen';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import PropertyCard from '../../components/PropertyCard/PropertyCard';




// Tenant Card Component
const TenantCard = React.memo(({ tenant }) => {
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid': return 'green.500';
      case 'pending': return 'orange.500';
      case 'overdue': return 'red.500';
      case 'in progress': return 'blue.500';
      default: return 'gray.500';
    }
  };

  const tenantName = tenant?.name || tenant?.tenant_name || tenant?.firstName + ' ' + tenant?.lastName || 'N/A';
  const tenantAddress = tenant?.address || tenant?.property_address || 'No address';
  const tenantStatus = tenant?.status || tenant?.payment_status || 'Pending';
  const tenantAvatar = tenant?.avatar || tenant?.profile_image || tenant?.photo;

  return (
    <Pressable mb={4}>
      <Box bg="white" rounded="2xl" overflow="hidden" shadow={3} style={styles.cardShadow}>
        <HStack p={4} space={3} alignItems="center">
          <Box
            w={12}
            h={12}
            rounded="full"
            bg="gray.200"
            justifyContent="center"
            alignItems="center"
            overflow="hidden"
          >
            {tenantAvatar ? (
              <Image
                source={{ uri: tenantAvatar }}
                alt={tenantName}
                w="100%"
                h="100%"
                resizeMode="cover"
              />
            ) : (
              <Text fontSize="xl" fontWeight="bold" color="gray.600">
                {tenantName?.charAt(0) || 'T'}
              </Text>
            )}
          </Box>

          <VStack flex={1} space={1}>
            <Text fontSize="md" fontWeight="bold" color="gray.800">
              {tenantName}
            </Text>
            <Text fontSize="sm" color="gray.500" numberOfLines={1}>
              {tenantAddress}
            </Text>
          </VStack>

          <Badge
            bg={getStatusColor(tenantStatus)}
            rounded="lg"
            px={3}
            py={1}
            _text={{
              fontSize: "xs",
              fontWeight: "600",
              color: "white"
            }}
          >
            {tenantStatus}
          </Badge>
        </HStack>
      </Box>
    </Pressable>
  );
});

// Statistics Header Component
const StatisticsHeader = React.memo(({ totalProperties, vacantCount, occupiedCount }) => (
  <View style={styles.glassCard}>
    <Box style={styles.glassCardInner}>
      <HStack justifyContent="space-around" mb={hp(2)}>
        <VStack alignItems="center" flex={1}>
          <HStack alignItems="center" space={2}>
            <AppIcon name={icons.totalProperties} size={wp(6)} />
            <Text fontSize={hp(2.5)} bold color={Colors.black}>{totalProperties}</Text>
          </HStack>
          <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>Total Properties</Text>
        </VStack>

        <VStack alignItems="center" flex={1}>
          <HStack alignItems="center" space={2}>
                      <AppIcon name={icons.closes} size={wp(6)} />
            <Text style={{ fontSize: hp(2.5), fontWeight: 'bold',}}>{vacantCount}</Text>
          </HStack>
          <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>Available</Text>
        </VStack>

        <VStack alignItems="center" flex={1}>
          <HStack alignItems="center" space={2}>
                                <AppIcon name={icons.ok} size={wp(6)} />
            <Text style={{ fontSize: hp(2.5), fontWeight: 'bold',  }}>{occupiedCount}</Text>
          </HStack>
          <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>Occupied</Text>
        </VStack>
      </HStack>
    </Box>
  </View>
));

// Main Component
const LandlordProperties = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editPropertyData, setEditPropertyData] = useState(null);

  // Tab state
  const [activeTab, setActiveTab] = useState('properties');

  // Filter states
  const [favorites, setFavorites] = useState([]);
  const [selectedPropertyType, setSelectedPropertyType] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState('all');
  const [selectedTenantStatus, setSelectedTenantStatus] = useState('all');

  // Redux selectors - Properties
  const propertiesData = useSelector(propertiesSelectors.getPropertiesData) || {};
  const {
    landlordProperties = [],
    loading = false,
    error = null,
    totalProperties = 0,
    vacantUnits = 0,
    occupiedUnits = 0,
  } = propertiesData;

  // Redux selectors - Tenants (adjust these selectors based on your Redux structure)
  const tenantsData = useSelector(state => state?.tenants?.tenantsData || state?.tenants || {});
  const {
    tenants = [],
    loading: tenantsLoading = false,
    error: tenantsError = null,
    totalTenants = 0,
  } = tenantsData;

  // Auth safe fetch
  const authData = useSelector(state => state?.loginData || state?.login || {});
  const authToken = authData?.accessToken || authData?.token || null;
  const landlordId = authData?.landlordId || authData?.userData?.landlordId || authData?.user?.landlordId || null;

  const isAuthenticated = Boolean(landlordId && authToken);
  const hasProperties = landlordProperties.length > 0;
  const hasTenants = tenants.length > 0;

  // Load properties from Redux
  useEffect(() => {
    if (landlordId && authToken) {
      dispatch(getLandlordProperties({ landlordId, token: authToken }));
      // Dispatch action to fetch tenants
      // dispatch(getLandlordTenants({ landlordId, token: authToken }));
    }
  }, [dispatch, landlordId, authToken]);

  const handleRefresh = useCallback(() => {
    if (isAuthenticated) {
      dispatch(getLandlordProperties({ landlordId, token: authToken }));
      // Refresh tenants
      // dispatch(getLandlordTenants({ landlordId, token: authToken }));
    } else {
      Toast.show('Please login again');
    }
  }, [dispatch, landlordId, authToken, isAuthenticated]);

  const handleAddProperty = () => {
    setEditPropertyData(null);
    setShowModal(true);
  };

  const handleViewDetails = property => {
    navigation.navigate('PropertiesDetails', { property });
  };

  const handleEdit = property => {
    setEditPropertyData(property);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditPropertyData(null);
    handleRefresh();
  };

  const handleDeleteProperty = async propertyId => {
    if (!isAuthenticated) return Toast.show('Please login again');
    try {
      await dispatch(deleteProperty({ propertyId, token: authToken, landlordId })).unwrap();
      Toast.show('Property deleted successfully');
      handleRefresh();
    } catch (err) {
      console.error('Delete property error:', err);
      Toast.show(err?.message || 'Failed to delete property');
    }
  };

  const handleToggleFavorite = id => {
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Calculate property type counts
  const propertyTypeCounts = useMemo(() => {
    return landlordProperties.reduce((acc, prop) => {
      const type = prop?.property_type || 'Other';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }, [landlordProperties]);

  // Calculate vacant and occupied counts
  const availabilityCounts = useMemo(() => {
    const vacant = landlordProperties.filter(p =>
      p?.availability === 'available' || p?.is_available
    ).length;
    const occupied = landlordProperties.length - vacant;
    return { vacant, occupied };
  }, [landlordProperties]);

  // Calculate tenant status counts from Redux data
  const tenantStatusCounts = useMemo(() => {
    return tenants.reduce((acc, tenant) => {
      const status = (tenant?.status || tenant?.payment_status || 'pending').toLowerCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [tenants]);

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    let filtered = landlordProperties.filter(prop => {
      // Property Type Filter
      const typeMatch = selectedPropertyType === 'all' || prop?.property_type === selectedPropertyType;
      
      // Availability Filter
      const isAvailable = prop?.availability === 'available' || prop?.is_available;
      const availMatch =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'vacant' && isAvailable) ||
        (selectedAvailability === 'occupied' && !isAvailable);
      
      return typeMatch && availMatch;
    });

    // Sort by most recent
    return filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  }, [landlordProperties, selectedPropertyType, selectedAvailability]);

  // Filter tenants from Redux
  const filteredTenants = useMemo(() => {
    if (selectedTenantStatus === 'all') {
      return tenants;
    }
    return tenants.filter(tenant => {
      const tenantStatus = (tenant?.status || tenant?.payment_status || 'pending').toLowerCase();
      return tenantStatus === selectedTenantStatus.toLowerCase();
    });
  }, [selectedTenantStatus, tenants]);

  // Determine current loading and error states
  const currentLoading = activeTab === 'properties' ? loading : tenantsLoading;
  const currentError = activeTab === 'properties' ? error : tenantsError;
  const hasData = activeTab === 'properties' ? hasProperties : hasTenants;

  // UI Conditions
  if (currentLoading && !hasData) {
    return (
      <Container>
        <Box flex={1} justifyContent="center" alignItems="center">
          <Spinner color="#E53935" size="lg" />
          <Text mt={4} fontSize="md" color="gray.600">
            Loading {activeTab === 'properties' ? 'properties' : 'tenants'}...
          </Text>
        </Box>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container>
        <Box flex={1} justifyContent="center" alignItems="center" px={6}>
          <MaterialIcons name="lock-outline" size={64} color="#E53935" />
          <Text mt={4} fontSize="lg" fontWeight="bold" textAlign="center">
            Authentication Required
          </Text>
          <Text mt={2} fontSize="sm" color="gray.500" textAlign="center">
            Please login to view your {activeTab}
          </Text>
          <Button mt={6} bg="#E53935" onPress={() => navigation.navigate('Login')} px={8}>
            Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (currentError) {
    return (
      <Container>
        <Box flex={1} justifyContent="center" alignItems="center" px={6}>
          <MaterialIcons name="error-outline" size={64} color="#E53935" />
          <Text mt={4} fontSize="lg" fontWeight="bold" textAlign="center">
            Error Loading {activeTab === 'properties' ? 'Properties' : 'Tenants'}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={2} textAlign="center">
            {currentError}
          </Text>
          <Button mt={6} bg="#E53935" onPress={handleRefresh} px={8}>
            Retry
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <FlatList
        data={activeTab === 'properties' ? filteredAndSortedProperties : filteredTenants}
        keyExtractor={(item, index) => {
          if (activeTab === 'properties') {
            return String(item?.property_id || item?.id || item?.ID || index);
          } else {
            return String(item?.tenant_id || item?.id || item?.ID || index);
          }
        }}
        renderItem={({ item }) => (
          activeTab === 'properties' ? (
            <PropertyCard
              property={item}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDeleteProperty}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.includes(item?.property_id || item?.id || item?.ID)}
            />
          ) : (
            <TenantCard tenant={item} />
          )
        )}
        refreshControl={
          <RefreshControl
            refreshing={currentLoading}
            onRefresh={handleRefresh}
            tintColor="#E53935"
            colors={["#E53935"]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
        ListHeaderComponent={
          <VStack space={4} mb={4}>
            <StatisticsHeader
              totalProperties={totalProperties || landlordProperties.length}
              vacantCount={availabilityCounts.vacant}
              occupiedCount={availabilityCounts.occupied}
              totalTenants={totalTenants || tenants.length}
              activeTab={activeTab}
            />
            
            {/* Tab Switcher */}
            <Box
              width={370}
              height={50}
              borderRadius={100}
              borderWidth={1}
              borderColor="rgba(255,255,255,0.3)"
              bg="rgba(255,255,255,0.7)"
              flexDirection="row"
              alignSelf="center"
              overflow="hidden"
              mb={4}
            >
              <Box
                position="absolute"
                top={0}
                left={activeTab === 'properties' ? 0 : '50%'}
                width="50%"
                height="100%"
                bg="#E53935"
                borderRadius={100}
              />

              {[
                { key: 'properties', label: 'Properties', count: totalProperties || landlordProperties.length },
                { key: 'tenants', label: 'Tenants', count: totalTenants || tenants.length },
              ].map(tab => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    flex={1}
                    onPress={() => setActiveTab(tab.key)}
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                  >
                    <HStack alignItems="center" space={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={isActive ? "white" : "gray.600"}
                      >
                        {tab.label}
                      </Text>
                      <Badge
                        bg={isActive ? "white" : "gray.300"}
                        rounded="full"
                        px={3}
                        _text={{
                          fontSize: "xs",
                          fontWeight: "bold",
                          color: isActive ? "#E53935" : "gray.600"
                        }}
                      >
                        {tab.count}
                      </Badge>
                    </HStack>
                  </Pressable>
                );
              })}
            </Box>

            {/* Conditional Filters */}
            <PropertyFilters
              activeTab={activeTab}
              // Properties filters
              selectedPropertyType={selectedPropertyType}
              onPropertyTypeChange={setSelectedPropertyType}
              selectedAvailability={selectedAvailability}
              onAvailabilityChange={setSelectedAvailability}
              propertyTypeCounts={propertyTypeCounts}
              vacantCount={availabilityCounts.vacant}
              occupiedCount={availabilityCounts.occupied}
              // Tenants filters
              selectedTenantStatus={selectedTenantStatus}
              onTenantStatusChange={setSelectedTenantStatus}
              tenantStatusCounts={tenantStatusCounts}
            />
          </VStack>
        }
        ListEmptyComponent={
          <Box alignItems="center" justifyContent="center" py={10}>
            <MaterialIcons
              name={activeTab === 'properties' ? 'home-work' : 'people-outline'}
              size={80}
              color="#E0E0E0"
            />
            <Text fontSize="lg" color="gray.500" mt={4}>
              {activeTab === 'properties' ? 'No properties found' : 'No tenants found'}
            </Text>
            <Text fontSize="sm" color="gray.400" mt={2} textAlign="center" px={10}>
              {activeTab === 'properties'
                ? (selectedPropertyType !== 'all' || selectedAvailability !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'Add your first property to get started')
                : (selectedTenantStatus !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'No tenants available at the moment')
              }
            </Text>
            {activeTab === 'properties' &&
             (selectedPropertyType !== 'all' || selectedAvailability !== 'all') && (
              <Button
                mt={4}
                bg="#E53935"
                onPress={() => {
                  setSelectedPropertyType('all');
                  setSelectedAvailability('all');
                }}
                _text={{ fontSize: "sm", fontWeight: "600" }}
              >
                Clear Filters
              </Button>
            )}
            {activeTab === 'tenants' && selectedTenantStatus !== 'all' && (
              <Button
                mt={4}
                bg="#E53935"
                onPress={() => setSelectedTenantStatus('all')}
                _text={{ fontSize: "sm", fontWeight: "600" }}
              >
                Clear Filters
              </Button>
            )}
          </Box>
        }
      />

      {activeTab === 'properties' && (
        <TouchableOpacity
          style={styles.fabButton}
          onPress={handleAddProperty}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>
      )}

      <Modal
        isVisible={showModal}
        onBackdropPress={handleCloseModal}
        style={{ margin: 0 }}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        backdropOpacity={0.5}
      >
        <AddPropertiesScreen
          onClose={handleCloseModal}
          propertyData={editPropertyData}
        />
      </Modal>
    </Container>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  fabText: {
    color: 'white',
    fontSize: 28,
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  glassCardInner: { padding: hp(2) },
});

export default LandlordProperties;
