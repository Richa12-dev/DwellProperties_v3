import React from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Box, Text, VStack, HStack } from "native-base";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { useNavigation } from "@react-navigation/native";
import CollectionNavBar from "../../components/CollectionNavBar/CollectionNavBar";

const RentHistory = () => {
  const navigation = useNavigation();

  const rentData = [
    { id: "1", name: "Henry Cooper", amount: "$2600", date: "12 Oct 2025", mode: "Bank Transfer" },
    { id: "2", name: "Henry Cooper", amount: "$2600", date: "12 Sep 2025", mode: "Bank Transfer" },
    { id: "3", name: "Henry Cooper", amount: "$2600", date: "12 Aug 2025", mode: "Bank Transfer" },
    { id: "4", name: "Henry Cooper", amount: "$2600", date: "12 Jul 2025", mode: "Bank Transfer" },
  ];

const renderItem = ({ item }) => (
  <Box style={styles.historyCard}>
    <VStack space={1}>
      {/* Name & Amount in one line */}
      <HStack justifyContent="space-between" alignItems="center">
        <Text style={styles.paidToLabel}>Paid to</Text>
      
      </HStack>

      <HStack justifyContent="space-between" alignItems="center" mt={hp(0.5)}>
        <Text style={styles.landlordName}>{item.name}</Text>
                <Text style={styles.amountText}>{item.amount}</Text>
    
      </HStack>

      {/* Date below */}
            <HStack justifyContent="space-between" alignItems="center" mt={hp(0.5)}>
      <Text style={[styles.dateText, { marginTop: hp(0.5) }]}>{item.date}</Text>
              <Text style={styles.transferText}>{item.mode}</Text>
              </HStack>
    </VStack>
  </Box>
);

  return (
    <View style={styles.container}>
      {/* 🔴 Background Glow */}
      <View style={styles.backgroundContainer}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </View>

      {/* 🔹 Navbar */}
      <CollectionNavBar />

{/* 🔹 Header (Under Navbar) */}
<View style={styles.headerContainer}>
  <HStack alignItems="center" justifyContent="flex-start" space={2}>
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
      hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
    >
      <AppIcon name={icons.arrowBack} height={hp(2.5)} width={hp(2.5)} />
    </TouchableOpacity>

    <Text style={styles.title}>Rent History</Text>
  </HStack>

  <Text style={styles.subtitle}>List of previous month rent collection</Text>
</View>

      {/* 🔹 Rent List */}
      <FlatList
        data={rentData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: hp(1.5) }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  backgroundContainer: { position: "absolute", width: "100%", height: "100%" },
  topGlow: {
    position: "absolute",
    width: wp("80%"),
    height: hp("50%"),
    borderRadius: 220,
    top: hp("-6%"),
    left: wp("35%"),
    backgroundColor: "rgba(229, 57, 53, 0.15)",
  },
  bottomGlow: {
    position: "absolute",
    width: wp("80%"),
    height: hp("50%"),
    borderRadius: 220,
    top: hp("80%"),
    left: wp("-30%"),
    backgroundColor: "rgba(229, 57, 53, 0.15)",
  },
  headerContainer: {
    paddingTop: hp(2),
    paddingBottom: hp(2),
    paddingHorizontal: wp(5),
  },
  titleContainer: { marginTop: hp(1.5) },
  title: { fontSize: hp(2.5), fontWeight: "bold", color: "#000" },
  subtitle: { fontSize: hp(1.6), color: Colors.textGray, marginTop: hp(0.3) },
  listContent: { paddingHorizontal: wp(5), paddingTop: hp(1), paddingBottom: hp(10) },
historyCard: {
  backgroundColor: "#fff",
  padding: hp(1.5),
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#D9D9D9",
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 2 },
  elevation: 3,
},
  paidToLabel: { fontSize: hp(1.6), color: Colors.textGray },
  landlordName: { fontSize: hp(2.2), fontWeight: "bold", color: "#000" },
  dateText: { fontSize: hp(1.8), color: "#000" },
  amountText: { fontSize: hp(2.2), fontWeight: "bold", color: "#000" },
  transferText: { fontSize: hp(1.6), color: Colors.textGray },
});

export default RentHistory;
