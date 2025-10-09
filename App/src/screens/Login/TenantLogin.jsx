import React, { useCallback, useState } from 'react';
import {
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
import FlashMessage from 'react-native-flash-message';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { icons } from '../../Assets';
import { AppIcon } from '../../components/AppIcon';
import CustomButton from '../../components/CustomButton';
import { loginDataSelectors } from '../../Redux/Login/loginSlice';
import { login } from '../../Redux/Login/services';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';

const TenantLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);

    const dispatch = useDispatch();
    const { loading } = useSelector(loginDataSelectors.getData);

    const handleLogin = () => {
        Keyboard.dismiss();
        dispatch(login({ username: email, password }));
    };

    const togglePasswordVisibility = useCallback(() => {
        setHidePassword(prev => !prev);
    }, []);

    const isLoginDisabled = !email.trim() || !password.trim();

    return (
        <ImageBackground
            source={require('../../Assets/Image/dwellProperties/Maskgroup1.png')}
            style={styles.backgroundImage}
            resizeMode="cover">
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.85)']}
                locations={[0, 0.5, 1]}
                style={styles.gradientOverlay}>
                
                <StatusBar backgroundColor={Colors.black} barStyle="dark-content" />
                <FlashMessage position="top" />

                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Back Button */}
                    <View style={styles.header}>
                        <TouchableOpacity 
                            onPress={() => {
                                console.log('Back button pressed');
                                navigation.goBack();
                            }}
                            activeOpacity={0.7}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Icon name="arrow-back" size={24} color="#1F2D3D" />
                        </TouchableOpacity>
                    </View>

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../Assets/Image/dwellProperties/Dlogo1.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Header */}
                    <View style={styles.contentContainer}>
                        <Text style={[
                            styles.heading,
                            { textAlign: 'left', marginBottom: 20, marginTop: 30 },
                        ]}>Hi There!</Text>
                        <Text style={styles.mainHeading}>
                            Please enter your {'\n'}
                            <Text style={styles.boldText}>Tenant Login Details</Text>
                        </Text>

                        {/* Form */}
                        <View style={styles.formContainer}>
                            <TextInput
                                label="Email Address"
                                mode="outlined"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={styles.input}
                                outlineColor="#100d0dff"
                                activeOutlineColor={Colors.black}
                                theme={{ roundness: 8 }}
                            />

                            <TextInput
                                label="Password"
                                mode="outlined"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={hidePassword}
                                style={[styles.input, { marginTop: hp(2) }]}
                                outlineColor="#100d0dff"
                                activeOutlineColor={Colors.black}
                                theme={{ roundness: 8 }}
                                right={
                                    <TextInput.Icon
                                        name={!hidePassword ? 'eye-off' : 'eye'}
                                        onPress={togglePasswordVisibility}
                                        forceTextInputFocus={false}
                                    />
                                }
                            />

                            {/* Forgot Password */}
                            <TouchableOpacity
                                style={styles.forgotButton}
                                onPress={() => navigation.navigate('ForgotPassword')}>
                                <Text style={styles.forgotButtonText}>Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <CustomButton
                                style={styles.loginButton}
                                title="Login"
                                size={16}
                                action={handleLogin}
                                disabled={isLoginDisabled}
                                loading={loading}
                                color={isLoginDisabled ? '#d2c9c9ff' : '#5a5a5a'}
                                textColor={Colors.white}
                            />

                            {/* Register Link */}
                            <View style={styles.registerContainer}>
                                <Text style={styles.registerText}>Don't have an account? </Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.registerLink}>Register Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </LinearGradient>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    gradientOverlay: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    contentContainer: {
        paddingHorizontal: wp(5),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wp(5),
        paddingTop: hp(6),
        paddingBottom: hp(1),
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
        fontSize: 16,
        fontFamily: getFontFamily('medium'),
        color: '#000',
        marginBottom: hp(1),
        fontWeight: 'bold',
    },
    mainHeading: {
        fontSize: hp(2.8),
        color: Colors.black,
        lineHeight: hp(3.5),
        marginBottom: hp(3),
        fontWeight: 'bold',
    },
    boldText: { 
        fontWeight: 'bold', 
        color: Colors.black 
    },
    formContainer: { 
        width: '100%' 
    },
    input: { 
        backgroundColor: 'transparent', 
        borderRadius: 8 
    },
    forgotButton: { 
        alignSelf: 'flex-start', 
        marginVertical: hp(1) 
    },
    forgotButtonText: { 
        color: Colors.black, 
        fontFamily: getFontFamily('medium'), 
        fontSize: 14 
    },
    loginButton: {
        borderRadius: 10,
        marginVertical: hp(2),
        paddingVertical: 16,
        minHeight: hp(6),
        justifyContent: 'center',
        alignItems: 'center',
    },
    registerContainer: {
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center' 
    },
    registerText: { 
        fontSize: 14, 
        fontFamily: getFontFamily('regular'), 
        color: '#666' 
    },
    registerLink: { 
        fontSize: 14, 
        fontFamily: getFontFamily('bold'), 
        color: Colors.black 
    },
});

export default TenantLogin;