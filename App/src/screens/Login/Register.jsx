import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  ScrollView,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../Redux/Login/services';
import { loginDataSelectors } from '../../Redux/Login/loginSlice';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import {AppIcon} from '../../components/AppIcon';
import { icons } from '../../Assets';



const roleOptions = [
  { id: 'tenant', name: 'Tenant' },
  { id: 'landlord', name: 'Landlord' },
  { id: 'contractor', name: 'Contractor' },
];

const Register = ({ navigation }) => {
  const [fields, setFields] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: '',
  });

  const [hidePassword, setHidePassword] = useState(true);
  const [errors, setErrors] = useState({});
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const dispatch = useDispatch();
  const { registrationLoading } = useSelector(
    loginDataSelectors.getRegistrationData
  );

  const validateFields = () => {
    let newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+\d{11,15}$/;

    if (!emailRegex.test(fields.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (fields.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!fields.firstName.trim()) newErrors.firstName = 'First name required';
    if (!fields.lastName.trim()) newErrors.lastName = 'Last name required';
    if (!phoneRegex.test(fields.phone)) {
      newErrors.phone = 'Enter phone in format +15555550100';
    }
    if (!fields.role) newErrors.role = 'Select a role';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const callAPI = async () => {
    if (!validateFields()) return;

    try {
      const userData = {
        email: fields.email.trim(),
        password: fields.password,
        firstName: fields.firstName.trim(),
        lastName: fields.lastName.trim(),
        phoneNumber: fields.phone.trim(),
        role: fields.role,
        tenantId: fields.role === 'tenant' ? `tenant-${Date.now()}` : '',
        landlordId: fields.role === 'landlord' ? `landlord-${Date.now()}` : '',
        contractorId:
          fields.role === 'contractor' ? `contractor-${Date.now()}` : undefined,
      };

      await dispatch(registerUser(userData)).unwrap();

      navigation.navigate('OtpScreen', {
        email: fields.email.trim(),
        phone: fields.phone.trim(),
      });
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <ImageBackground
      source={require('../../Assets/Image/dwellProperties/Maskgroup1.png')}
      style={styles.backgroundImage}
      imageStyle={styles.imageStyle}
      resizeMode="cover">
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
        locations={[0, 0.2, 0.35, 0.5, 0.7]}
        style={styles.gradientOverlay}>
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}>
<AppIcon name={icons.arrowBack} size={24} />
       </TouchableOpacity>
            <Text style={styles.headerTitle}>Register</Text>
          </View>

          {/* Main Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.mainHeading}>
              Don’t have an{'\n'}
              <Text style={styles.boldText}>Account? Register Now!</Text>
            </Text>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* First Name */}
              <TextInput
                label="First Name"
                mode="outlined"
                style={styles.input}
                outlineColor="#E0E0E0"
                activeOutlineColor={Colors.black}
                value={fields.firstName}
                onChangeText={t => setFields({ ...fields, firstName: t })}
                theme={{ roundness: 8 }}
              />
              {errors.firstName && (
                <Text style={styles.error}>{errors.firstName}</Text>
              )}

              {/* Last Name */}
              <TextInput
                label="Last Name"
                mode="outlined"
                style={[styles.input, { marginTop: hp(0.8) }]}
                outlineColor="#E0E0E0"
                activeOutlineColor={Colors.black}
                value={fields.lastName}
                onChangeText={t => setFields({ ...fields, lastName: t })}
                theme={{ roundness: 8 }}
              />
              {errors.lastName && (
                <Text style={styles.error}>{errors.lastName}</Text>
              )}

              {/* Email */}
              <TextInput
                label="Email Address"
                mode="outlined"
                style={[styles.input, { marginTop: hp(0.8) }]}
                outlineColor="#E0E0E0"
                activeOutlineColor={Colors.black}
                keyboardType="email-address"
                value={fields.email}
                onChangeText={t => setFields({ ...fields, email: t })}
                theme={{ roundness: 8 }}
              />
              {errors.email && <Text style={styles.error}>{errors.email}</Text>}

              {/* Password */}
              <TextInput
                label="Password"
                mode="outlined"
                style={[styles.input, { marginTop: hp(0.8) }]}
                outlineColor="#E0E0E0"
                activeOutlineColor={Colors.black}
                secureTextEntry={hidePassword}
                value={fields.password}
                onChangeText={t => setFields({ ...fields, password: t })}
                theme={{ roundness: 8 }}
                right={
                  <TextInput.Icon
                    icon={hidePassword ? 'eye' : 'eye-off'}
                    onPress={() => setHidePassword(!hidePassword)}
                    forceTextInputFocus={false}
                  />
                }
              />
              {errors.password && (
                <Text style={styles.error}>{errors.password}</Text>
              )}

              {/* Phone */}
              <TextInput
                label="Phone Number"
                mode="outlined"
                style={[styles.input, { marginTop: hp(0.8) }]}
                outlineColor="#E0E0E0"
                activeOutlineColor={Colors.black}
                keyboardType="phone-pad"
                value={fields.phone}
                onChangeText={t => setFields({ ...fields, phone: t })}
                theme={{ roundness: 8 }}
              />
              {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

              {/* Role Dropdown */}
              <TouchableOpacity
                style={[
                  styles.roleInput,
                  { marginTop: hp(1.5) },
                  errors.role && styles.roleInputError,
                ]}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
                <Text
                  style={[
                    styles.roleText,
                    !fields.role && styles.placeholderText,
                  ]}>
                  {fields.role
                    ? roleOptions.find(r => r.id === fields.role)?.name
                    : 'Select Role'}
                </Text>
                <Icon
                  name={showRoleDropdown ? 'expand-less' : 'expand-more'}
                  size={24}
                  color="#555"
                />
              </TouchableOpacity>
              {errors.role && <Text style={styles.error}>{errors.role}</Text>}

              {showRoleDropdown && (
                <View style={styles.dropdownMenu}>
                  {roleOptions.map((role, index) => (
                    <TouchableOpacity
                      key={role.id}
                      style={[
                        styles.dropdownItem,
                        index === roleOptions.length - 1 &&
                          styles.lastDropdownItem,
                      ]}
                      onPress={() => {
                        setFields(f => ({ ...f, role: role.id }));
                        setShowRoleDropdown(false);
                      }}>
                      <Text style={styles.dropdownItemText}>{role.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  registrationLoading && styles.submitButtonDisabled,
                ]}
                onPress={callAPI}
                disabled={registrationLoading}>
                <Text style={styles.submitText}>
                  {registrationLoading ? 'Submitting...' : 'Submit'}
                </Text>
              </TouchableOpacity>

              {/* Bottom Text */}
              <View style={styles.bottomTextContainer}>
                <Text style={styles.bottomText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.loginLink}>Login</Text>
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
    height: '100%',
  },
  imageStyle: {
    width: '100%',
     height: 931,
    top: -400,
    left: 0,
    //  height: hp(50),
    opacity: 0.3,
    // resizeMode: 'cover',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
    paddingBottom: hp(1),
  },
  headerTitle: {
    fontSize: hp(2.2),
    fontWeight: 'bold',
    color: '#1F2D3D',
    marginLeft: 10,
    fontFamily: getFontFamily('bold'),
  },
  contentContainer: {
    paddingHorizontal: wp(5),
    paddingTop: hp(18),
  },
  mainHeading: {
    fontSize: hp(2.8),
      fontWeight: 'bold',
    color: Colors.black,
    lineHeight: hp(3),
    marginBottom: hp(2),
    fontFamily: getFontFamily('semiBold'),
  },
  boldText: {
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: hp(6),
    justifyContent: 'center',
  },
  roleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: wp(2),
    paddingVertical: hp(1.5),
    backgroundColor: '#FFFFFF',
    minHeight: hp(6),
  },
  roleInputError: {
    borderColor: 'red',
  },
  roleText: {
    fontSize: hp(1.8),
    color: '#000',
    fontFamily: getFontFamily('regular'),
  },
  placeholderText: {
    color: '#666',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: hp(1),
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: hp(1.5),
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  lastDropdownItem: {
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    fontSize: hp(1.8),
    color: '#000',
    fontFamily: getFontFamily('regular'),
  },
  error: {
    color: 'red',
    marginTop: hp(0.5),
    marginBottom: hp(0.5),
    fontSize: hp(1.5),
    fontFamily: getFontFamily('regular'),
  },
  submitButton: {
    backgroundColor: '#DAD3D3',
    paddingVertical: hp(1.8),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2.5),
    minHeight: hp(6),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#5A5A5A',
    fontSize: hp(2),
    fontFamily: getFontFamily('medium'),
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(1),
  },
  bottomText: {
    fontSize: hp(1.8),
    color: '#6C6C6C',
    fontFamily: getFontFamily('regular'),
  },
  loginLink: {
    fontSize: hp(1.8),
    color: Colors.black,
    fontFamily: getFontFamily('bold'),
  },
});

export default Register;
