import React from 'react';
import { ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import {
  Box, Text, VStack, HStack, Button, Badge, Image,
  StatusBar as RNStatusBar, Divider, Pressable
} from 'native-base';
import { Colors } from '../../Theme';
import Swiper from 'react-native-swiper';

import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
import { openLocationInMaps } from '../../Redux/Properties/services';
import { Linking } from 'react-native';



const { width: screenWidth } = Dimensions.get('window');

const PropertiesDetails = ({ route, navigation }) => {
  const { property } = route.params;

  const formatPropertyStatus = (property) => {
    if (property.is_available) {
      return { label: 'Available', color: 'green' };
    } else {
      return { label: 'Occupied', color: 'red' };
    }
  };

  const formatAddress = (property) => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zip_code) parts.push(property.zip_code);
    return parts.join(', ');
  };

  const getImageSource = (img) => {
    if (typeof img === 'string') {
      return {
        uri: img.startsWith('data:image')
          ? img
          : `data:image/jpeg;base64,${img}`,
      };
    }
    if (img.uri) return { uri: img.uri };
    if (img.base64) return { uri: `data:image/jpeg;base64,${img.base64}` };
    return require('../../Assets/Image/empty-box.png');
  };

   // Handler for opening location in Google Maps
  const handleLocationPress = async () => {
    await openLocationInMaps(property);
  };

  const status = formatPropertyStatus(property);

  const InfoRow = ({ icon, label, value, color = "gray.700" }) => (
    <HStack space={3} alignItems="center" py={2}>
      <MaterialIcon name={icon} size={16} color="#9CA3AF" />
      <VStack flex={1}>
        <Text fontSize="xs" color="gray.500" fontWeight="medium">{label}</Text>
        <Text fontSize="sm" color={color} fontWeight="500">{value}</Text>
      </VStack>
    </HStack>
  );

  return (
    <>
      <RNStatusBar
        backgroundColor={Colors.black || Colors.red || "#FF0000"}
        barStyle="light-content"
        translucent={false}
      />
       <CollectionNavBar />
      {/* Custom Header */}
      <HStack
        bg={Colors.black || Colors.red || "#FF0000"}
        px={4}
        py={3}
        alignItems="center"
        safeAreaTop
      >
        <Pressable onPress={() => navigation.goBack()} mr={3}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <Text flex={1} fontSize="lg" fontWeight="bold" color="white" numberOfLines={1}>
          Property Details
        </Text>
      </HStack>

      <ScrollView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <VStack space={0}>
            <Box></Box>
          
          {/* Image Gallery */}
          <Box height={250} bg="gray.200">
            {property.images && property.images.length > 0 ? (
              <Swiper
                showsPagination={true}
                paginationStyle={{ bottom: 10 }}
                dotStyle={{ backgroundColor: 'rgba(255,255,255,0.5)' }}
                activeDotStyle={{ backgroundColor: 'white' }}
                autoplay={property.images.length > 1}
                autoplayTimeout={4}
                loop={property.images.length > 1}
              >
                {property.images.map((img, idx) => (
                  <Image
                    key={idx}
                    source={getImageSource(img)}
                    alt={`Property-${idx}`}
                    width={screenWidth}
                    height="100%"
                    resizeMode="cover"
                    fallbackSource={require('../../Assets/Image/empty-box.png')}
                  />
                ))}
              </Swiper>
            ) : (
              <Image
                source={require('../../Assets/Image/empty-box.png')}
                alt="Property"
                width={screenWidth}
                height="100%"
                resizeMode="cover"
              />
            )}
          </Box>

          {/* Property Header */}
          <Box bg="white" px={4} py={4}>
            <HStack justifyContent="space-between" alignItems="flex-start" mb={3}>
              <VStack flex={1} mr={3}>
                <Text fontSize="xl" fontWeight="bold" color="gray.800" numberOfLines={2}>
                  {property.name}
                </Text>
                {formatAddress(property) && (
                  <TouchableOpacity onPress={handleLocationPress}>
                    <HStack alignItems="center" mt={1}>
                      <Ionicons 
                        name="location-outline" 
                        size={14} 
                        color="#3B82F6" 
                        style={{ marginRight: 4 }} 
                      />
                      <Text 
                        fontSize="sm" 
                        color="blue.600" 
                        flex={1} 
                        numberOfLines={2}
                        textDecorationLine="underline"
                      >
                        {formatAddress(property)}
                      </Text>
                    </HStack>
                  </TouchableOpacity>
                )}
                {/* {formatAddress(property) && (
                  <HStack alignItems="center" mt={1}>
                    <Ionicons name="location-outline" size={14} color="#9CA3AF" style={{ marginRight: 4 }} />
                    <Text fontSize="sm" color="gray.600" flex={1} numberOfLines={2}>
                      {formatAddress(property)}
                    </Text>
                  </HStack>
                )} */}
              </VStack>
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

            {/* Rent Price */}
            {property.monthly_rent && (
              <HStack alignItems="center" mb={2}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  ${property.monthly_rent.toLocaleString()}
                </Text>
                <Text fontSize="md" color="gray.600" ml={1}>
                  /month
                </Text>
              </HStack>
            )}
          </Box>

          {/* Property Information */}
          <Box bg="white" mt={2} px={4} py={4}>
            <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
              Property Information
            </Text>
            
            <VStack space={1} divider={<Divider />}>
              {property.property_type && (
                <InfoRow
                  icon="business"
                  label="Property Type"
                  value={property.property_type}
                  color="blue.600"
                />
              )}
              
              {property.bedrooms !== undefined && (
                <InfoRow
                  icon="bed"
                  label="Bedrooms"
                  value={property.bedrooms || 'N/A'}
                />
              )}
              
              {property.bathrooms !== undefined && (
                <InfoRow
                  icon="bathtub"
                  label="Bathrooms"
                  value={property.bathrooms || 'N/A'}
                />
              )}
              
              {property.square_footage && (
                <InfoRow
                  icon="crop-free"
                  label="Square Footage"
                  value={`${property.square_footage.toLocaleString()} sq ft`}
                />
              )}
              
              {property.year_built && (
                <InfoRow
                  icon="calendar-today"
                  label="Year Built"
                  value={property.year_built.toString()}
                />
              )}
              
              {property.parking_spaces !== undefined && (
                <InfoRow
                  icon="local-parking"
                  label="Parking Spaces"
                  value={property.parking_spaces || 'None'}
                />
              )}
            </VStack>
          </Box>

          {/* Description */}
          {property.description && (
            <Box bg="white" mt={2} px={4} py={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
                Description
              </Text>
              <Text fontSize="sm" color="gray.700" lineHeight="md">
                {property.description}
              </Text>
            </Box>
          )}

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Box bg="white" mt={2} px={4} py={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
                Amenities
              </Text>
              <VStack space={2}>
                {property.amenities.map((amenity, index) => (
                  <HStack key={index} alignItems="center">
                    <Ionicons name="checkmark-circle" size={16} color="#22C55E" style={{ marginRight: 8 }} />
                    <Text fontSize="sm" color="gray.700">{amenity}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Contact Information */}
          {(property.contact_email || property.contact_phone) && (
            <Box bg="white" mt={2} px={4} py={4}>
              <Text fontSize="lg" fontWeight="bold" color="gray.800" mb={3}>
                Contact Information
              </Text>
              <VStack space={1} divider={<Divider />}>
                {property.contact_email && (
                  <InfoRow
                    icon="email"
                    label="Email"
                    value={property.contact_email}
                    color="blue.600"
                  />
                )}
                {property.contact_phone && (
                  <InfoRow
                    icon="phone"
                    label="Phone"
                    value={property.contact_phone}
                    color="blue.600"
                  />
                )}
              </VStack>
            </Box>
          )}

          {/* Action Buttons */}
          <Box bg="white" mt={2} mx={4} mb={6} p={4} rounded="xl" shadow={2}>
            <VStack space={3}>
              {property.contact_phone && (
                <Button
                  size="lg"
                  colorScheme="green"
                  leftIcon={<Ionicons name="call" size={16} color="white" />}
                  onPress={() => console.log('Call:', property.contact_phone)}
                >
                  Call Now
                </Button>
              )}
              
              {property.contact_email && (
                <Button
                  size="lg"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<Ionicons name="mail" size={16} color="#3B82F6" />}
                  onPress={() => console.log('Email:', property.contact_email)}
                >
                  Send Email
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                colorScheme="gray"
                leftIcon={<Ionicons name="heart-outline" size={16} color="#6B7280" />}
                onPress={() => console.log('Save property:', property.id)}
              >
                Save Property
              </Button>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>
    </>
  );
};

export default PropertiesDetails;