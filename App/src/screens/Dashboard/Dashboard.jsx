import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Box, Text, VStack, HStack } from "native-base";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { useNavigation } from "@react-navigation/native";
import Container from "../../components/Container/Container";

const Dashboard = () => {
  const [showAllMaintenance, setShowAllMaintenance] = useState(false);
  const navigation = useNavigation();

  const maintenanceItems = [
    {
      id: 1,
      date: "Sep 27, 2025",
      title: "Leaky faucet in Kitchen",
      provider: "Austin, TX ABC Plumbing",
    },
    {
      id: 2,
      date: "Sep 29, 2025",
      title: "AC filter replacement",
      provider: "Austin, TX CoolAir Services",
    },
    {
      id: 3,
      date: "Oct 01, 2025",
      title: "Garden sprinkler issue",
      provider: "Austin, TX GreenFix",
    },
  ];

  const displayedItems = showAllMaintenance
    ? maintenanceItems
    : maintenanceItems.slice(0, 1);

  return (
    <Container style={styles.pageContainer}>
      
      {/* 💰 Rent Payment Card */}
      <View style={styles.rentCardWrapper}>
        <View style={styles.glassCard}>
          <View style={styles.rentCardInner}>
            <HStack alignItems="center" space={3}>
              <View style={styles.rentIconBox}>
                <AppIcon name={icons.RentHistory} height={hp(3)} width={hp(3)} />
              </View>

              <VStack flex={1}>
                <Text fontSize={hp(3.2)} bold color={Colors.black}>
                  $2600
                </Text>
                <Text fontSize={hp(1.8)} color={Colors.textGray}>
                  Pay your rent now
                </Text>
              </VStack>

              <TouchableOpacity style={styles.payRentBtn}>
                <Text style={styles.payRentBtnText}>Pay Rent</Text>
              </TouchableOpacity>
            </HStack>

            <HStack alignItems="center" space={2} mt={hp(1.5)}>
              <AppIcon name={icons.calendar} height={hp(2)} width={hp(2)} />
              <Text fontSize={hp(1.7)} color={Colors.textGray}>
                Next Due Date:{" "}
                <Text bold color={Colors.black}>
                  Sep 28, 2025
                </Text>
              </Text>
            </HStack>
          </View>
        </View>
      </View>

      {/* 🛠 Request Help Section */}
      <VStack mx={wp(4.5)} mt={hp(3)}>
        <Text fontSize={hp(2.2)} bold color={Colors.black} mb={hp(1.5)}>
          Request Help
        </Text>

        <View style={styles.glassCard}>
          <Box style={styles.glassCardInner}>
            <HStack justifyContent="space-around" mb={hp(2)}>
              {/* New Request */}
              <VStack alignItems="center" flex={1}>
                <HStack alignItems="center" space={2}>
                  <AppIcon name={icons.email} height={hp(2.2)} width={hp(2.2)} />
                  <Text fontSize={hp(2.5)} bold color={Colors.black}>
                    02
                  </Text>
                </HStack>
                <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                  New Request
                </Text>
              </VStack>

              {/* In Progress */}
              <VStack alignItems="center" flex={1}>
                <HStack alignItems="center" space={2}>
                  <View style={styles.progressIcon}>
                    <Text style={styles.progressIconText}>⏱</Text>
                  </View>
                  <Text fontSize={hp(2.5)} bold color={Colors.black}>
                    03
                  </Text>
                </HStack>
                <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                  In Progress
                </Text>
              </VStack>

              {/* Completed */}
              <VStack alignItems="center" flex={1}>
                <HStack alignItems="center" space={2}>
                  <View style={styles.completedIcon}>
                    <Text style={styles.completedIconText}>✓</Text>
                  </View>
                  <Text fontSize={hp(2.5)} bold color={Colors.black}>
                    05
                  </Text>
                </HStack>
                <Text fontSize={hp(1.6)} color={Colors.textGray} mt={1}>
                  Completed
                </Text>
              </VStack>
            </HStack>

            <TouchableOpacity style={styles.viewDetailsBtn}>
              <Text style={styles.viewDetailsBtnText}>View Details</Text>
            </TouchableOpacity>
          </Box>
        </View>
      </VStack>

      {/* 🧰 Upcoming Maintenance Section */}
      <VStack mx={wp(4.5)} mt={hp(3)} mb={hp(3)}>
        <Text fontSize={hp(2.2)} bold color={Colors.black} mb={hp(1.5)}>
          Upcoming Maintenance
        </Text>

        <View style={styles.glassCard}>
          <Box style={styles.glassCardInner}>
            <VStack space={3}>
              {displayedItems.map((item, index) => (
                <TouchableOpacity key={item.id}>
                  <HStack
                    alignItems="center"
                    space={3}
                    pb={index < displayedItems.length - 1 ? 3 : 0}
                    borderBottomWidth={index < displayedItems.length - 1 ? 1 : 0}
                    borderBottomColor="#F3F4F6"
                  >
                    <View style={styles.maintenanceIconBox}>
                      <AppIcon
                        name={icons.maintenance}
                        height={hp(2.5)}
                        width={hp(2.5)}
                      />
                    </View>
                    <VStack flex={1}>
                      <Text fontSize={hp(1.6)} color={Colors.textGray}>
                        {item.date}
                      </Text>
                      <Text fontSize={hp(1.9)} bold color={Colors.black} mt={0.5}>
                        {item.title}
                      </Text>
                      <Text fontSize={hp(1.6)} color={Colors.textGray} mt={0.5}>
                        {item.provider}
                      </Text>
                    </VStack>
                  </HStack>
                </TouchableOpacity>
              ))}
            </VStack>

            <TouchableOpacity
              style={styles.showMoreBtn}
              onPress={() => setShowAllMaintenance(!showAllMaintenance)}
            >
              <Text style={styles.showMoreText}>
                {showAllMaintenance ? "Show less details" : "Show more details"}{" "}
                <Text style={styles.arrow}>
                  {showAllMaintenance ? "▲" : "▼"}
                </Text>
              </Text>
            </TouchableOpacity>
          </Box>
        </View>
      </VStack>
    </Container>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    // Removed paddingTop as Container now handles spacing
  },
  rentCardWrapper: {
    marginHorizontal: wp(4.5),
    marginTop: hp(2),
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
  rentCardInner: { padding: hp(2) },
  rentIconBox: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: hp(1.2),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  payRentBtn: {
    backgroundColor: Colors.red,
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(6),
    borderRadius: 10,
    shadowColor: Colors.red,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  payRentBtnText: { color: "#fff", fontWeight: "bold", fontSize: hp(1.8) },
  progressIcon: {
    width: hp(2.5),
    height: hp(2.5),
    borderRadius: hp(1.25),
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
  },
  progressIconText: { fontSize: hp(1.5) },
  completedIcon: {
    width: hp(2.5),
    height: hp(2.5),
    borderRadius: hp(1.25),
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
  completedIconText: { fontSize: hp(1.5), color: "#059669", fontWeight: "bold" },
  viewDetailsBtn: {
    borderWidth: 2,
    borderColor: Colors.red,
    paddingVertical: hp(1.5),
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  viewDetailsBtnText: {
    color: Colors.red,
    fontWeight: "bold",
    fontSize: hp(1.8),
  },
  maintenanceIconBox: {
    backgroundColor: "rgba(255, 232, 232, 0.9)",
    padding: hp(1.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  showMoreBtn: { paddingTop: hp(2), alignItems: "center" },
  showMoreText: { fontSize: hp(1.7), color: Colors.textGray, fontWeight: "600" },
  arrow: { fontSize: hp(1.4) },
});

export default Dashboard;
