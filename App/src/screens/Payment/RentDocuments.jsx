import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Box, Text, VStack, HStack } from "native-base";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import CollectionNavBar from "../../components/CollectionNavBar/CollectionNavBar";

const RentDocuments = () => {
  const docs = [
    { title: "Rent Agreement" },
    { title: "Inspection Reports" },
    { title: "Insurance Policies" },
  ];

  return (
    <View style={styles.container}>
      <CollectionNavBar title="Rent Documents" />
      <Box bg="white" rounded="2xl" p={5} mx={wp(5)} mt={hp(4)} shadow={3}>
        <VStack space={5}>
          {docs.map((item, index) => (
            <TouchableOpacity key={index}>
              <HStack justifyContent="space-between" alignItems="center">
                <HStack space={3} alignItems="center">
                  <AppIcon name={icons.Document} height={hp(3)} width={hp(3)} />
                  <Text fontSize={hp(2)}>Download {item.title}</Text>
                </HStack>
                <AppIcon name={icons.Download} height={hp(3)} width={hp(3)} />
              </HStack>
            </TouchableOpacity>
          ))}
        </VStack>
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default RentDocuments;

