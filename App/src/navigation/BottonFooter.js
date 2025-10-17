import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Platform, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {icons} from '../Assets';
import {Colors} from '../Theme';
import {AppIcon} from '../components/AppIcon';
import Dashboard from '../screens/Dashboard/Dashboard';
import Properties from '../screens/Properties/Properties';
import Support from '../screens/Support/Support';
import AIAssistant from '../screens/AIAssistant/AIAssistant';
import {getFontFamily} from '../utils';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';

const Tab = createBottomTabNavigator();

const TabButton = props => {
  const {item, onPress, accessibilityState, styles} = props;
  const focused = accessibilityState?.selected || false;

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      style={styles.container}>
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
          color: focused ? Colors.red : Colors.grey,
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
      component: Dashboard,
      name: 'Home',
      icon: icons.home,
      focusicon: icons.homered,
    },
    {
      route: 'AIAssistant',
      component: AIAssistant,
      name: 'Ask AI',
      icon: icons.ai,
      focusicon: icons.aired,
    },
    {
      route: 'Support',
      component: Support,
      name: 'Support',
      icon: icons.support,
      focusicon: icons.supportred,
    },
  ];

  return (
    <Tab.Navigator
      initialRouteName={initialScreen || 'Home'}
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabbar,
        tabBarHideOnKeyboard: true,
      }}
      safeAreaInsets={{
        bottom: 5,
      }}>
      {TabBarArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.route}
            component={item.component}
            options={{
              tabBarShowLabel: false,
              tabBarButton: props => (
                <TabButton
                  {...props}
                  item={item}
                  styles={styles}
                />
              ),
            }}
            listeners={{
              tabPress: e => {
                // Reset the stack to initial route when tab is pressed
                navigation.reset({
                  index: 0,
                  routes: [{name: item.route}],
                });
              },
            }}
          />
        );
      })}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: Platform.OS === 'ios' ? hp(10) : hp(10),
  },
  title: {
    fontSize: hp(1.5),
    color: Colors.white,
    marginTop: hp(0.4),
    textAlign: 'center',
  },
  tabbar: {
    height: Platform.OS === 'ios' ? hp(8) : hp(8),
    backgroundColor: Colors.white,
    // borderTopLeftRadius: 18,
    // borderTopRightRadius: 18,
  },
});

export default BottomBar;