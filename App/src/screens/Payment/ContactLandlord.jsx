import React from "react";
import { View, StyleSheet } from "react-native";
import { Box, Text, HStack, VStack } from "native-base";
import { AppIcon } from "../../components/AppIcon";
import { icons } from "../../Assets";
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from "react-native-responsive-screen";
import { Colors } from "../../Theme";
import CollectionNavBar from "../../components/CollectionNavBar/CollectionNavBar";

const ContactLandlord = () => {
  return (
    <View style={styles.container}>
      <CollectionNavBar title="Contact Landlord" />
      <Box bg="white" rounded="2xl" p={5} mx={wp(5)} mt={hp(4)} shadow={3}>
        <VStack space={5}>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.Person} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)}>Henry Cooper</Text>
          </HStack>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.Email} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)}>henrycooper@gmail.com</Text>
          </HStack>
          <HStack space={3} alignItems="center">
            <AppIcon name={icons.Phone} height={hp(3)} width={hp(3)} />
            <Text fontSize={hp(2)}>+1 5555 5555 55</Text>
          </HStack>
        </VStack>
      </Box>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
});

export default ContactLandlord;

