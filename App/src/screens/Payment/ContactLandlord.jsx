import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { Box, Text, HStack, VStack } from "native-base";
import { useSelector, useDispatch } from "react-redux";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import CollectionNavBar from "../../components/CollectionNavBar/CollectionNavBar";
import { getTenantProperties } from "../../Redux/Properties/services";
import { propertiesSelectors } from "../../Redux/Properties/propertiesSlice";

const ContactLandlord = () => {
  const dispatch = useDispatch();
  
  const { tenantProperties, loading } = useSelector(propertiesSelectors.getPropertiesData);
  const loginData = useSelector((state) => state.loginData || state.login || {});
  const tenantId = loginData?.userData?.id || loginData?.userData?.user_id;

  useEffect(() => {
    if (tenantId) {
      console.log('🔍 Fetching tenant properties for ID:', tenantId);
      dispatch(getTenantProperties(tenantId));
    }
  }, [dispatch, tenantId]);

  // Debug: Log the entire data structure
  useEffect(() => {
    console.log('📊 Full Redux State - loginData:', JSON.stringify(loginData, null, 2));
    console.log('📊 Tenant Properties:', JSON.stringify(tenantProperties, null, 2));
  }, [tenantProperties, loginData]);

  const currentProperty = tenantProperties && tenantProperties.length > 0 ? tenantProperties[0] : null;

  // Debug: Log the property structure
  if (currentProperty) {
    console.log('🏠 Current Property Structure:', Object.keys(currentProperty));
    console.log('🏠 Full Property Data:', JSON.stringify(currentProperty, null, 2));
  }

  // Try multiple possible field name variations
  const getLandlordName = () => {
    if (!currentProperty) return null;
    
    const possibleFields = [
      currentProperty.landlord_name,
      currentProperty.landlordName,
      currentProperty.landlord?.name,
      currentProperty.landlord?.full_name,
      currentProperty.owner_name,
      currentProperty.ownerName,
      currentProperty.property_owner,
      currentProperty.landlord_full_name,
    ];
    
    const name = possibleFields.find(field => field && field !== '');
    console.log('👤 Found landlord name:', name);
    return name;
  };

  const getLandlordEmail = () => {
    if (!currentProperty) return null;
    
    const possibleFields = [
      currentProperty.landlord_email,
      currentProperty.landlordEmail,
      currentProperty.landlord?.email,
      currentProperty.owner_email,
      currentProperty.ownerEmail,
      currentProperty.contact_email,
    ];
    
    const email = possibleFields.find(field => field && field !== '');
    console.log('📧 Found landlord email:', email);
    return email;
  };

  const getLandlordPhone = () => {
    if (!currentProperty) return null;
    
    const possibleFields = [
      currentProperty.landlord_phone,
      currentProperty.landlordPhone,
      currentProperty.landlord?.phone,
      currentProperty.landlord?.phone_number,
      currentProperty.owner_phone,
      currentProperty.ownerPhone,
      currentProperty.contact_phone,
      currentProperty.phone,
      currentProperty.phone_number,
    ];
    
    const phone = possibleFields.find(field => field && field !== '');
    console.log('📞 Found landlord phone:', phone);
    return phone;
  };

  const landlordName = getLandlordName() || "Not Available";
  const landlordEmail = getLandlordEmail() || "Not Available";
  const landlordPhone = getLandlordPhone() || "Not Available";

  if (loading) {
    return (
      <View style={styles.container}>
        <CollectionNavBar title="Contact Landlord" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary || "#007AFF"} />
          <Text mt={3} fontSize={hp(2)}>Loading landlord information...</Text>
        </View>
      </View>
    );
  }

  if (!currentProperty) {
    return (
      <View style={styles.container}>
        <CollectionNavBar title="Contact Landlord" />
        <Box bg="white" rounded="2xl" p={5} mx={wp(5)} mt={hp(4)} shadow={3}>
          <Text fontSize={hp(2)} textAlign="center" color="gray.500">
            No property information available.
          </Text>
          <Text fontSize={hp(1.6)} textAlign="center" color="gray.400" mt={2}>
            Tenant ID: {tenantId || 'Not found'}
          </Text>
          <Text fontSize={hp(1.6)} textAlign="center" color="gray.400" mt={2}>
            Check console logs for debug info
          </Text>
        </Box>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CollectionNavBar title="Contact Landlord" />
      <Box bg="white" rounded="2xl" p={5} mx={wp(5)} mt={hp(4)} shadow={3}>
        <VStack space={5}>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.person} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)} flex={1}>{landlordName}</Text>
          </HStack>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.email} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)} flex={1}>{landlordEmail}</Text>
          </HStack>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.phone} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)} flex={1}>{landlordPhone}</Text>
          </HStack>
        </VStack>
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wp(5),
  },
});

export default ContactLandlord;
