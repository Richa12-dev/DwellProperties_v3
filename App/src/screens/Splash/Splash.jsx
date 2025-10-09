import React, {useEffect, useState} from 'react';
import {Dimensions, StatusBar, StyleSheet, View, ImageBackground, Image, Text} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import LinearGradient from 'react-native-linear-gradient';
// import {useSelector} from 'react-redux';
import {resetRoot} from '../../navigation/RouterServices';
// import {loginDataSelectors} from '../../Redux/Login/loginSlice';
const Splash = ({navigation}) => {
  const [isLoaded, setIsLoaded] = useState(false);
 
   useEffect(() => {
    const timer = setTimeout(() => {
      // For now always go to Onboarding
      navigation.replace('OnboardingScreen');
  
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    // <View>
    <View style={styles.container}>
       <StatusBar backgroundColor={'#000'} barStyle="light-content" />
      
      {/* Background Image with gradient overlay */}
      <ImageBackground
        source={require('../../Assets/Image/dwellProperties/Maskgroup1.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
         {/* Dark gradient overlay */}
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.7)']}
                  locations={[0, 0.5, 1]}
                  style={styles.gradientOverlay}
                />

        {/* Gradient overlay - dark at bottom */}
        {/* <View style={styles.gradientOverlay} /> */}
        

        {/* Logo Container */}
        <View style={styles.logoContainer}>
          <Image
          source={require('../../Assets/Image/dwellProperties/Dlogo1.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.copyright}>
          ©2025, Dwell Properties, All Rights Reserved
        </Text>
      </ImageBackground>
    
    
    </View>
  );
};

const {width, height} = Dimensions.get('window');


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', 
  },
   logoContainer: {
    alignItems: 'center',
    marginTop: hp(15),
    paddingHorizontal: 20,
  },
  logo: {
    width: wp(45),
    height: hp(30),
  },
   copyright: {
    position: 'absolute',
    top: hp(94.5), 
    left: wp(13), 
    width: wp(83), 
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Nunito-Medium', 
    fontWeight: '500',
  },
});


export default Splash;
