import React, { useRef } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  Animated,
  StatusBar,
  Platform,
} from "react-native";
import { Colors } from "../../Theme";
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import CollectionNavBar from "../CollectionNavBar/CollectionNavBar";

type ContainerProps = Readonly<{
  children: React.ReactNode;
  style?: object;
}>;

const Container = ({ children, style }: ContainerProps) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor={Colors.black} barStyle="light-content" />

      {/* 🔴 Background Glow */}
      <View style={styles.backgroundContainer}>
        <View style={styles.topGlow} />
        <View style={styles.bottomGlow} />
      </View>

      {/* 🧠 Fixed Navbar - Positioned absolutely at top */}
      <View style={styles.fixedNavbar}>
        <CollectionNavBar />
      </View>

      {/* 🟢 Scrollable Content */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.container, style]}>{children}</View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background || "#FFFFFF",
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
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
  scrollWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    // Add padding to account for fixed navbar + some spacing
    paddingTop: Platform.OS === 'android'
      ? StatusBar.currentHeight + hp(9) + hp(2) // StatusBar + Navbar height + spacing
      : hp(7) + hp(9) + hp(2), // iOS safe area + Navbar height + spacing
    // Add bottom padding to account for the bottom tab bar
    paddingBottom: hp(12),
  },
  container: {
    flexDirection: "column",
    paddingHorizontal: 0, // Remove horizontal padding as Dashboard already has it
  },
  fixedNavbar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999, // Increased z-index to ensure it stays on top
    backgroundColor: "transparent",
  },
});

export default Container;
