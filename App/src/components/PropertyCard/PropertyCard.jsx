import React, { useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Box, Text, VStack, HStack, Image, Pressable } from 'native-base';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";

const PropertyCard = React.memo(
  ({ property, onViewDetails, onEdit, onDelete, onToggleFavorite, isFavorite }) => {
    
    const propertyInfo = useMemo(
      () => ({
        bedrooms: property?.bedrooms || "N/A",
        bathrooms: property?.bathrooms || "N/A",
        rent: property?.monthly_rent ? `$${property.monthly_rent}` : "$0",
      }),
      [property]
    );

    const address = useMemo(() => {
      const parts = [];
      if (property?.street) parts.push(property.street);
      if (property?.city) parts.push(property.city);
      if (property?.state) parts.push(`(${property.state})`);
      if (property?.zipcode) parts.push(property.zipcode);
      return parts.join(", ") || "No address provided";
    }, [property]);

    const renderPropertyImage = useMemo(() => {
      try {
        const img =
          property?.media?.photos?.[0] ||
          property?.images?.[0] ||
          null;

        if (typeof img === "string" && img.length > 0) {
          const uri =
            img.startsWith("http") ||
            img.startsWith("data:image")
              ? img
              : `data:image/jpeg;base64,${img}`;

          return (
            <Image
              source={{ uri }}
              alt="Property"
              w="100%"
              h="100%"
              resizeMode="cover"
              fallbackSource={require("../../Assets/Image/empty-box.png")}
            />
          );
        }
        
        

        return (
          <Image
            source={require("../../Assets/Image/empty-box.png")}
            alt="Property"
            w="100%"
            h="100%"
            resizeMode="cover"
          />
        );
      } catch {
        return (
          <Image
            source={require("../../Assets/Image/empty-box.png")}
            alt="Property"
            w="100%"
            h="100%"
            resizeMode="cover"
          />
        );
      }
    }, [property?.media, property?.images]);

    const propertyId = property?.property_id || property?.id || property?.ID;
    const propertyType = property?.property_type || "Apartment";
    
 const isOccupied =
  property?.availability === "occupied" ||
  property?.availability_status === "occupied" ||
  property?.is_available === false;

const status = isOccupied ? "Occupied" : "Vacant";


    return (
      <Pressable onPress={() => onViewDetails(property)} mb={4}>
        <Box style={styles.cardContainer}>
          <HStack height={hp(20)}>
            
            {/* LEFT – IMAGE */}
            <Box style={styles.imageContainer}>
              {renderPropertyImage}

              {/* FAVORITE BUTTON */}
              <Pressable
                style={styles.favoriteButton}
                onPress={() => onToggleFavorite(propertyId)}
              >
                <AppIcon
                  name={isFavorite ? "redHeart" : "heart"}
                  size={24}
                  color={isFavorite ? "#E53935" : "#fff"}
                />
              </Pressable>
            </Box>

            {/* RIGHT – DETAILS */}
            <VStack style={styles.contentContainer}>
              
              {/* 🔹 Property Type with Custom AppIcon */}
              <HStack alignItems="center" justifyContent="space-between">
             
                <Text style={styles.propertyType}>{propertyType}</Text>
    <Box
    style={[
      styles.statusBadge,
      status === "Occupied" ? styles.occupied : styles.vacant,
    ]}
  >
    <Text style={styles.statusText}>{status}</Text>
  </Box>

              </HStack>

              {/* Address */}
              <Text style={styles.address} numberOfLines={1}>
                {address}
              </Text>

              {/* INFO ROW */}
              <HStack style={styles.infoRow}>
                <VStack style={styles.infoItem}>
                  <Text style={styles.infoLabel}>No. Tenant</Text>
                  <Text style={styles.infoValue}>
                    {property?.tenant_count || "03"}
                  </Text>
                </VStack>

                <VStack style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Rent</Text>
                  <Text style={styles.infoValue}>
                    {propertyInfo.rent}/month
                  </Text>
                </VStack>
              </HStack>

              {/* ACTION ROW */}
              <HStack style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.viewDetailsButton}
                  onPress={() => onViewDetails(property)}
                >
                  <Text style={styles.viewDetailsText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.iconButton} onPress={() => onEdit(property)}>
                    <AppIcon name={icons.editIcon} size={24} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => onDelete(propertyId)}
                >
                
                <AppIcon name={icons.deleteIcon} size={24} />
                 
                </TouchableOpacity>
              </HStack>

            </VStack>
          </HStack>
        </Box>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create({
  cardContainer: {
    width: wp(92),
    height: hp(21),
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    width: wp(35),
    height: "100%",
    position: "relative",
  },
  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  propertyType: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},

occupied: {
  backgroundColor: "#E53935", // red
},

vacant: {
  backgroundColor: "#4CAF50", // green
},

statusText: {
  color: "white",
  fontSize: 12,
  fontWeight: "600",
},

  address: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 11,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  viewDetailsButton: {
    backgroundColor: "#E53935",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  alignItems: "center",
  justifyContent: "center",
  },
  viewDetailsText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default PropertyCard;
