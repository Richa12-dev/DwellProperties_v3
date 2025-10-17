import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View, Dimensions} from 'react-native';

import {icons} from '../Assets';
import {Colors} from '../Theme';
import {AppIcon} from '../components/AppIcon';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
// import {
//   LandlordDashboardView,
//    LandlordProperties,
//   LandlordSupport
// } from '../screens';
import LandlordDashboardView from '../screens/Dashboard/LandlordDashboardView';
import LandlordProperties from '../screens/Properties/LandlordProperties';
import LandlordSupport from '../screens/Support/LandlordSupport';
import {getFontFamily} from '../utils';

const Tab = createBottomTabNavigator();

const TabButton = props => {
  const {item, onPress, accessibilityState, styles, navigation} = props;
  const focused = accessibilityState.selected;
  // const handlePress = () => {
  //   console.log('hhhh', item.route);
  //   // Reset the stack navigation to the initial route
  //   navigation.reset({
  //     index: 0,
  //     routes: [{name: item.route}],
  //   });
  // };

  const handlePress = () => {
  navigation.navigate(item.route);
 };
  // splashBAckground
  return (
    <TouchableOpacity
      activeOpacity={1}
      // onPress={item.name == 'Support' ? console.log('') : handlePress}
         onPress={handlePress}
      style={styles.contanier}>
      <View>
        <AppIcon
          name={focused ? item.focusicon : item.icon}
          size={focused ? wp(8) : wp(7)}
          style={{marginTop: focused ? -2 : 0}}
        />
       
      </View>
      <Text
        style={{
          ...styles.title,
          color: focused ? Colors.red : Colors.white,
          fontFamily: getFontFamily('medium'),
          fontSize: focused ? wp(4.5) : wp(3.5),
        }}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

const BottomBar = ({navigation, route}) => {
  const initialScreen = route?.params?.screen;

  const TabBarArr = [
    {
      route: 'Home',
      component: LandlordDashboardView,
      name: 'Home',
      icon: icons.whiteHome,
      focusicon: icons.greenHome,
    },
    {
      route: 'Attendance',
      component: LandlordProperties,
      name: 'Properties',
      icon: icons.whiteLead,
      focusicon: icons.greenLead,
    },
       {
          route: 'Menu',
         component: LandlordSupport,
          name: 'Support',
          icon: icons.whiteSupport,
          focusicon: icons.greenSupport,
        },
   
    // {
    //   route: 'Home',
    //   component: StaffDashboard,
    //   name: 'Home',
    //   icon: icons.whiteHome,
    //   focusicon: icons.greenHome,
    // },
    // {
    //   route: 'Attendance',
    //   component: StaffLeadGenration,
    //   name: 'Lead',
    //   icon: icons.whiteLead,
    //   focusicon: icons.greenLead,
    // },
   
  ];
  const { width, height } = Dimensions.get('window');
 
  const wp = (percentage) => {
    return (width * percentage) / 100;
  };
   
  const hp = (percentage) => {
    return (height * percentage) / 100;
  };

  return (
    <Tab.Navigator
      initialRouteName={initialScreen || 'StaffDashboard'}
      screenOptions={{
        headerShown: false,
        tabBarStyle: [styles.tabbar],

        tabBarHideOnKeyboard: true,
      }}
      safeAreaInsets={{
        bottom: 5,
      }}>
      {TabBarArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            options={{
              tabBarShowLabel: false,
              tabBarButton: props => (
                <TabButton
                  {...props}
                  item={item}
                  styles={styles}
                  navigation={navigation}
                  // onPress={SetFooterSelected(index)}
                  //    theme={theme}
                />
              ),
            }}
            name={item.route}
            component={item.component}
          />
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  contanier: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: Colors.black,
    height: Platform.OS === 'ios' ? hp(10) : hp(10),
  },
  title: {
    //  fontFamily: fonts.regular,
    // fontWeight:'700',
    fontSize: hp(1.5),
    color: Colors.white,
    marginTop: hp(0.4),
  },
  tabbar: {
    height: Platform.OS === 'ios' ? hp(10) : hp(10),
    backgroundColor: Colors.black,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  icon: {
    width: hp(3),
    height: hp(3),
  },
  homeicon: {
    width: hp(10),
    height: hp(10),
    bottom: hp(3),
  },
  outerContanier: {
    borderColor: Colors.white,
    borderWidth: hp(1),
    borderRadius: hp(100),
    bottom: hp(4),
    position: 'absolute',
    zIndex: 1000,
  },
  innerContanier: {
    backgroundColor: Colors.black,
    padding: hp(1),
    borderRadius: hp(100),
  },
});

export default BottomBar;
