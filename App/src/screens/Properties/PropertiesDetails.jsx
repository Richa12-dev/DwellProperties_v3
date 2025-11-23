import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Pressable,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import Swiper from "react-native-swiper";

import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import Container from "../../components/Container/Container";
import { openLocationInMaps } from "../../Redux/Properties/services";
import { useSelector } from "react-redux";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { loginDataSelectors } from "../../Redux/Login/loginSlice";
import Toast from "react-native-simple-toast";

const { width: screenWidth } = Dimensions.get("window");

// Dummy data for fallback when no tenant is assigned
const DUMMY_DATA = {
  name: "Blue Bell Apartment",
  address: "909-1/2 E 49th LA",
  city: "CA",
  state: "California",
  zip_code: "90011",
  property_type: "Apartment",
  bedrooms: 2,
  bathrooms: 1,
  square_footage: 2000,
  year_built: 2018,
  is_available: false,
  monthly_rent: 2600,
  description: "Spacious 2BHK apartment with modern interiors, ample natural light, and a private balcony. Located in a prime neighborhood close to schools, markets, and public transport.",
  amenities: ["Air Conditioning", "Built in Wardrobes", "Smart Lighting", "Secure Covered Parking"],
  rented_since: "11 Aug, 2024",
};

const PropertiesDetails = ({ route, navigation }) => {
  const propertyData = route?.params?.property || DUMMY_DATA;
  
  // Merge with dummy data for missing fields
  const property = {
    ...DUMMY_DATA,
    ...propertyData,
    amenities: propertyData.amenities?.length > 0 ? propertyData.amenities : DUMMY_DATA.amenities,
  };
  
  const { userData } = useSelector(loginDataSelectors.getLoginStatus);
  const accessToken = useSelector(loginDataSelectors.getAccessToken);

  const [tenantData, setTenantData] = useState(null);
  const [loadingTenant, setLoadingTenant] = useState(false);

  const contactEmail = userData?.email || null;
  const contactPhone = userData?.phoneNumber || null;

  // Fetch tenant data if property has tenant_id
  useEffect(() => {
    const fetchTenantData = async () => {
      // Check if property has a tenant assigned
      const tenantId = property.tenant_id || property.current_tenant_id;
      
      if (!tenantId || property.is_available) {
        setTenantData(null);
        return;
      }

      if (!accessToken) {
        console.log('No access token available');
        return;
      }

      setLoadingTenant(true);
      
      try {
        // Replace with your actual tenant API endpoint
        const TENANT_API_URL = 'https://70q2ntiu1f.execute-api.us-east-1.amazonaws.com/prod/tenants';
        
        const response = await fetch(`${TENANT_API_URL}/${tenantId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          // Handle different response structures
          const tenant = data.tenant || data.item || data.data || data;
          
          setTenantData({
            id: tenant.tenant_id || tenant.id || tenantId,
            name: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.name || 'Unknown Tenant',
            email: tenant.email || null,
            phone: tenant.phoneNumber || tenant.phone || null,
            avatar: tenant.avatar || tenant.profileImage || null,
            house_no: property.unit_number || property.house_no || 'N/A',
            lease_start: tenant.lease_start_date || property.rental_start_date || null,
            lease_end: tenant.lease_end_date || property.rental_end_date || null,
          });
        } else {
          console.log('Failed to fetch tenant data:', response.status);
          
          // Fallback: Use basic info from property
          setTenantData({
            id: tenantId,
            name: property.tenant_name || 'Tenant',
            email: property.tenant_email || null,
            phone: property.tenant_phone || null,
            avatar: null,
            house_no: property.unit_number || property.house_no || 'N/A',
            lease_start: property.rental_start_date || null,
            lease_end: property.rental_end_date || null,
          });
        }
      } catch (error) {
        console.error('Error fetching tenant data:', error);
        
        // Fallback: Use basic info from property
        setTenantData({
          id: tenantId,
          name: property.tenant_name || 'Tenant',
          email: property.tenant_email || null,
          phone: property.tenant_phone || null,
          avatar: null,
          house_no: property.unit_number || property.house_no || 'N/A',
          lease_start: property.rental_start_date || null,
          lease_end: property.rental_end_date || null,
        });
      } finally {
        setLoadingTenant(false);
      }
    };

    fetchTenantData();
  }, [property.tenant_id, property.current_tenant_id, property.is_available, accessToken]);

  const status = property.is_available
    ? { label: "Available", color: "#16A34A" }
    : { label: "Occupied", color: "#DC2626" };

  const formatAddress = () => {
    const parts = [];
    if (property.address) parts.push(property.address);
    if (property.city) parts.push(property.city);
    if (property.state) parts.push(property.state);
    if (property.zip_code) parts.push(property.zip_code);
    return parts.join(", ");
  };

  const getImageSource = (img) => {
    if (typeof img === "string") {
      return {
        uri: img.startsWith("data:image")
          ? img
          : `data:image/jpeg;base64,${img}`,
      };
    }
    if (img?.uri) return { uri: img.uri };
    if (img?.base64) return { uri: `data:image/jpeg;base64,${img.base64}` };
    return require("../../Assets/Image/empty-box.png");
  };

  const handleCallTenant = (phone) => {
    if (phone) {
      // Implement call functionality
      Toast.show(`Calling ${phone}`);
    } else {
      Toast.show('Phone number not available');
    }
  };

  const handleEmailTenant = (email) => {
    if (email) {
      // Implement email functionality
      Toast.show(`Emailing ${email}`);
    } else {
      Toast.show('Email not available');
    }
  };

  const navbarHeight =
    Platform.OS === "android"
      ? StatusBar.currentHeight + hp(9) + hp(2)
      : hp(7) + hp(9) + hp(2);

  return (
    <Container style={{ marginTop: -navbarHeight }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          {/* IMAGE GALLERY */}
          <View style={{ position: "relative" }}>
            <View style={{ height: 350, backgroundColor: "#E5E7EB" }}>
              {property.images?.length > 0 ? (
                <Swiper
                  autoplay={property.images.length > 1}
                  showsPagination
                  paginationStyle={{ bottom: 10 }}
                  dotStyle={{ backgroundColor: "rgba(255,255,255,0.5)" }}
                  activeDotStyle={{ backgroundColor: "#fff" }}
                >
                  {property.images.map((img, idx) => (
                    <Image
                      key={idx}
                      source={getImageSource(img)}
                      style={{ width: screenWidth, height: "100%" }}
                      resizeMode="cover"
                    />
                  ))}
                </Swiper>
              ) : (
                <Image
                  source={require("../../Assets/Image/empty-box.png")}
                  style={{ width: screenWidth, height: "100%" }}
                  resizeMode="cover"
                />
              )}
            </View>

            {property.images?.length > 0 && (
              <View style={styles.photoCount}>
                <Text style={styles.photoCountText}>
                  {property.images.length} Photos
                </Text>
              </View>
            )}

            <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
              <AppIcon name={icons.arrowBack} size={wp(6)} />
            </Pressable>

            <Pressable style={styles.favBtn}>
              <AppIcon name={icons.heart} size={wp(6)} />
            </Pressable>
          </View>

          {/* HEADER + BASIC PROPERTY INFO */}
          <View style={styles.glassCard}>
            <View style={styles.topRow}>
              <View style={styles.leftBlock}>
                <Text style={styles.propertyName}>{property.name}</Text>
                {property.address ? (
                  <TouchableOpacity
                    onPress={() => openLocationInMaps(property)}
                    style={styles.locationRow}
                  >
                                  <AppIcon name={icons.heart} size={wp(6)} />
                    <Text style={styles.propertyAddress}>
                      {formatAddress()}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              <View style={styles.rightBlock}>
                <Text style={styles.propertyType}>{property.property_type}</Text>
              </View>
            </View>
          </View>

          {/* PROPERTY STATS CARD */}
          <View style={[styles.glassCard, { borderWidth: 1, borderColor: "#D14B4B" }]}>
            <View style={styles.statsBox}>
              <View style={styles.statCol}>
                <Text style={styles.statValue}>{property.bedrooms || "0"}</Text>
                <Text style={styles.statLabel}>Bedrooms</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statCol}>
                <Text style={styles.statValue}>{property.bathrooms || "0"}</Text>
                <Text style={styles.statLabel}>Bathrooms</Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.statCol}>
                <Text style={styles.statValue}>
                  {property.square_footage
                    ? `${property.square_footage.toLocaleString()}`
                    : "N/A"}
                </Text>
                <Text style={styles.statLabel}>sq. ft.</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoValue}>{property.year_built || "N/A"}</Text>
                <Text style={styles.infoLabel}>Year Built</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoValue}>{property.rented_since || "N/A"}</Text>
                <Text style={styles.infoLabel}>Rented Since</Text>
              </View>

              <View style={styles.infoCol}>
                <Text style={styles.infoValue}>{status.label}</Text>
                <Text style={styles.infoLabel}>Status</Text>
              </View>
            </View>
          </View>

          {/* DESCRIPTION */}
          <View style={styles.glassCard}>
            <Text style={styles.sectionTitle}>Properties Details</Text>
            {property.description ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.descText}>{property.description}</Text>
              </View>
            ) : null}
          </View>

          {/* AMENITIES */}
          {property.amenities?.length > 0 && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {property.amenities.map((amenity, i) => (
                  <View key={i} style={styles.amenityItem}>
                    <View style={styles.amenityIconBox}>
                      <Ionicons
                        name={getAmenityIcon(amenity)}
                        size={20}
                        color="#EF4444"
                      />
                    </View>
                    <Text style={styles.amenityText}>{amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TENANT LIST - Now showing actual tenant data */}
          {!property.is_available && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>Tenant Information</Text>

              {loadingTenant ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#EF4444" />
                  <Text style={styles.loadingText}>Loading tenant information...</Text>
                </View>
              ) : tenantData ? (
                <View style={styles.tenantRow}>
                  <View style={styles.tenantLeft}>
                    <View style={styles.tenantAvatar}>
                      {tenantData.avatar ? (
                        <Image
                          source={{ uri: tenantData.avatar }}
                          style={styles.avatarImage}
                        />
                      ) : (
                        <Text style={styles.avatarText}>
                          {tenantData.name?.charAt(0)?.toUpperCase() || "T"}
                        </Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.tenantName}>{tenantData.name}</Text>
                      <Text style={styles.tenantHouse}>
                        {tenantData.house_no !== 'N/A'
                          ? `House No-${tenantData.house_no}, Tenant`
                          : 'Current Tenant'}
                      </Text>
                      {tenantData.lease_start && (
                        <Text style={styles.tenantLease}>
                          Lease: {new Date(tenantData.lease_start).toLocaleDateString()}
                          {tenantData.lease_end && ` - ${new Date(tenantData.lease_end).toLocaleDateString()}`}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.tenantActions}>
                    {tenantData.phone && (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleCallTenant(tenantData.phone)}
                      >
                        <Ionicons name="call-outline" size={18} color="#111827" />
                      </TouchableOpacity>
                    )}
                    {tenantData.email && (
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => handleEmailTenant(tenantData.email)}
                      >
                        <Ionicons name="mail-outline" size={18} color="#111827" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ) : (
                <View style={styles.noTenantContainer}>
                  <Ionicons name="person-outline" size={40} color="#9CA3AF" />
                  <Text style={styles.noTenantText}>
                    No tenant information available
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* CONTACT INFORMATION */}
          {(contactEmail || contactPhone) && (
            <View style={styles.glassCard}>
              <Text style={styles.sectionTitle}>Contact Information</Text>

              {contactEmail && (
                <View style={styles.infoRowLine}>
                  <MaterialIcon
                    name="email"
                    size={18}
                    color="#3B82F6"
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={styles.infoRowLabel}>Email</Text>
                    <Text style={[styles.infoRowValue, { color: "#2563EB" }]}>
                      {contactEmail}
                    </Text>
                  </View>
                </View>
              )}

              {contactPhone && (
                <View style={styles.infoRowLine}>
                  <MaterialIcon
                    name="phone"
                    size={18}
                    color="#3B82F6"
                    style={{ marginRight: 10 }}
                  />
                  <View>
                    <Text style={styles.infoRowLabel}>Phone</Text>
                    <Text style={[styles.infoRowValue, { color: "#2563EB" }]}>
                      {contactPhone}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* ACTION BUTTONS */}
          <View style={styles.glassCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <View>
                <Text style={styles.rentPrice}>
                  ${property.monthly_rent?.toLocaleString() || "2600"}/month
                </Text>
                <Text style={styles.utilitiesText}>+ Utilities Bill</Text>
              </View>
              <TouchableOpacity style={styles.downloadBtn}>
                <Text style={styles.downloadBtnText}>Download Agreement</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

// Helper function to get amenity icons
const getAmenityIcon = (amenity) => {
  const amenityLower = amenity.toLowerCase();
  if (amenityLower.includes("air") || amenityLower.includes("conditioning")) return "snow-outline";
  if (amenityLower.includes("wardrobe")) return "bed-outline";
  if (amenityLower.includes("light")) return "bulb-outline";
  if (amenityLower.includes("parking") || amenityLower.includes("car")) return "car-outline";
  return "checkmark-circle-outline";
};

export default PropertiesDetails;

const styles = StyleSheet.create({
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
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  leftBlock: {
    flex: 1,
    paddingRight: 10,
  },
  propertyName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    flexWrap: "wrap",
  },
  propertyAddress: {
    fontSize: 13,
    color: "#6B7280",
    maxWidth: "93%",
    lineHeight: 18,
  },
  rightBlock: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 6,
  },
  propertyType: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
  },
  backBtn: {
    position: "absolute",
    left: 16,
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  favBtn: {
    position: "absolute",
    right: 16,
    top: "50%",
    transform: [{ translateY: -20 }],
    backgroundColor: "white",
    padding: 10,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
  },
  photoCount: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  photoCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  statsBox: {
    backgroundColor: "rgba(243, 244, 246, 0.5)",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    marginTop: 12,
  },
  statCol: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  divider: {
    width: 1,
    backgroundColor: "#D1D5DB",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  infoCol: {
    alignItems: "center",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },
  rentPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  utilitiesText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },
  descText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  amenityItem: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  amenityIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(254, 226, 226, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  amenityText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#6B7280",
  },
  tenantRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(229, 231, 235, 0.5)",
  },
  tenantLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  tenantAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
  },
  tenantName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  tenantHouse: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  tenantLease: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 2,
  },
  tenantActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(229, 231, 235, 0.5)",
  },
  noTenantContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  noTenantText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 10,
  },
  infoRowLine: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoRowLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  infoRowValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  downloadBtn: {
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  downloadBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
});
