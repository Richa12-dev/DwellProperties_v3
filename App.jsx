import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider} from 'react-redux';
import {store} from './App/src/Redux/store';
import Splash from './App/src/screens/Splash/Splash';
import OnboardingScreen from './App/src/screens/OnboardingScreen/OnboardingScreen';
import Login from './App/src/screens/Login/Login';
import TenantLogin from './App/src/screens/Login/TenantLogin';
import Register from './App/src/screens/Login/Register';
import ForgotPassword from './App/src/screens/Login/ForgotPassword';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
       <Provider store={store}>
    <SafeAreaProvider>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor="rgba(238, 81, 63, 1)" 
      />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}>
          <Stack.Screen name="Splash" component={Splash} />
          <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name= "TenantLogin" component={TenantLogin} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name ="ForgotPassword" component={ForgotPassword}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
    </Provider>
  );
}