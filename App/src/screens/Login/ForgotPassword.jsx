import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Keyboard,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import CustomButton from '../../components/CustomButton';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email.trim()) {
      showMessage({ message: 'Please enter your email address', type: 'danger' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showMessage({ message: 'Please enter a valid email address', type: 'danger' });
      return;
    }

    Keyboard.dismiss();
    setLoading(true);

    try {
      // Replace with actual API
      const response = await new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1500)
      );

      if (response.success) {
        showMessage({ message: 'OTP sent successfully to your email', type: 'success' });
        navigation.navigate('ResetPassword', { email });
      }
    } catch (error) {
      showMessage({
        message: error?.message || 'Failed to send OTP. Please try again.',
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const isButtonDisabled = !email.trim();

  return (
    <ImageBackground
      source={require('../../Assets/Image/dwellProperties/Maskgroup1.png')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.75)', 'rgba(255,255,255,0.85)']}
        locations={[0, 0.5, 1]}
        style={styles.gradientOverlay}
      >
        <StatusBar backgroundColor={Colors.black} barStyle="dark-content" />
        <FlashMessage position="top" />

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Icon name="arrow-back" size={24} color="#1F2D3D" />
            </TouchableOpacity>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={require('../../Assets/Image/dwellProperties/Dlogo1.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <Text style={styles.heading}>Forgot Password?</Text>
            <Text style={styles.mainHeading}>
              Enter your email address and {'\n'}
              we'll send you a <Text style={styles.boldText}>Password</Text>
            </Text>

            {/* Form */}
            <View style={styles.formContainer}>
              <TextInput
                label="Email Address"
                mode="outlined"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                outlineColor="#000000ff"
                activeOutlineColor={Colors.black}
                theme={{ roundness: 8 }}
              />

              <CustomButton
                style={styles.sendButton}
                title="Send Password"
                size={16}
                action={handleSendOTP}
                disabled={isButtonDisabled}
                loading={loading}
                color={isButtonDisabled ? '#d2c9c9ff' : '#5a5a5a'}
                textColor={Colors.white}
              />

              {/* Back to Login */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  scrollContent: { flexGrow: 1, paddingHorizontal: wp(5), paddingVertical: hp(5) },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : hp(5),
    left: wp(5),
    zIndex: 100,
    padding: 5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 20,
  },
   logoContainer: {
        alignItems: 'center',
        marginTop: hp(8),
        paddingHorizontal: 20,
    },
    logo: {
        width: wp(45),
        height: hp(30),
    },
  heading: { 
    fontSize: 20,
    fontFamily: getFontFamily('medium'),
    color: Colors.black,
    fontWeight: 'bold',
    marginTop: hp(14),
    marginBottom: hp(2)
   },
  mainHeading: {
     fontSize: hp(2.5),
     lineHeight: hp(3.2),
     color: Colors.black,
     marginBottom: hp(3) 
    },
  boldText: { 
    fontWeight: 'bold',
    color: Colors.black },
  formContainer: { width: '100%', marginTop: hp(2) },
  input: { backgroundColor: 'transparent', borderRadius: 8, marginBottom: hp(3) },
  sendButton: { borderRadius: 10, paddingVertical: hp(1.8), justifyContent: 'center', alignItems: 'center', marginBottom: hp(3) },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  loginText: { fontSize: 14, fontFamily: getFontFamily('regular'), color: '#666' },
  loginLink: { fontSize: 14, fontFamily: getFontFamily('bold'), color: Colors.black },
});

export default ForgotPassword;
