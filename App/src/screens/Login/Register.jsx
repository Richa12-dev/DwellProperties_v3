import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
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
  const [showDropdown, setShowDropdown] = useState(false);
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
        tenantId: fields.role === 'Tenant' ? `tenant-${Date.now()}` : '',
        landlordId: fields.role === 'Landlord' ? `landlord-${Date.now()}` : '',
        contractorId:
          fields.role === 'Contractor' ? `contractor-${Date.now()}` : undefined,
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
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.85)', 'rgba(255, 255, 255, 0.75)', 'rgba(255, 255, 255, 0.85)']}
        locations={[0, 0.5, 1]}
        style={styles.gradientOverlay}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#1F2D3D" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Register</Text>
          </View>

          {/* Main Heading */}
          <Text style={styles.mainHeading}>
            Don't have an {'\n'}
            <Text style={styles.boldText}>Account? Register Now!</Text>
          </Text>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* First Name */}
            <TextInput
              label="First Name"
              mode="outlined"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
              value={fields.firstName}
              onChangeText={t => setFields({...fields, firstName: t})}
              theme={{roundness: 8}}
            />

            {/* Last Name */}
            <TextInput
              label="Last Name"
              mode="outlined"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
              value={fields.lastName}
              onChangeText={t => setFields({...fields, lastName: t})}
              theme={{roundness: 8}}
            />

            {/* Email Address */}
            <TextInput
              label="Email Address"
              mode="outlined"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
              keyboardType="email-address"
              value={fields.email}
              onChangeText={t => setFields({...fields, email: t})}
              theme={{roundness: 8}}
            />

            {/* Phone Number */}
            <TextInput
              label="Phone Number"
              mode="outlined"
              style={styles.input}
              outlineColor="#E0E0E0"
              activeOutlineColor="#000"
              keyboardType="phone-pad"
              value={fields.phone}
              onChangeText={t => setFields({...fields, phone: t})}
              theme={{roundness: 8}}
            />


                  {/* Role Dropdown */}
    <TouchableOpacity
        style={[styles.roleInput, errors.role && styles.roleInputError]}
        onPress={() => setShowRoleDropdown(!showRoleDropdown)}>
        <Text style={[styles.roleText, !fields.role && styles.placeholderText]}>
          {fields.role
            ? roleOptions.find(r => r.id === fields.role)?.name
            : 'Select Role'}
        </Text>
        <Icon
                name={showDropdown ? 'expand-less' : 'expand-more'}
                size={24}
                color="#555"
              />
        {/* <AppIcon name={icons.dropDownIcon} size={hp(2.5)} /> */}
      </TouchableOpacity>
      {errors.role && <Text style={styles.error}>{errors.role}</Text>}

      {showRoleDropdown && (
        <View style={styles.dropdownMenu}>
          {roleOptions.map((role, index) => (
            <TouchableOpacity
              key={role.id}
              style={[
                styles.dropdownItem,
                index === roleOptions.length - 1 && styles.lastDropdownItem
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
              style={styles.submitButton}
              onPress={callAPI}
              disabled={registrationLoading}
            >
              <Text style={styles.submitText}>
                {registrationLoading ? 'Submitting...' : 'Submit'}
              </Text>
            </TouchableOpacity>

            {/* Bottom Text */}
            <View style={styles.bottomTextContainer}>
              <Text style={styles.bottomText}>Already have an Account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(6),
    paddingBottom: hp(1),
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2D3D',
    marginLeft: 10,
  },
  mainHeading: {
    fontSize: hp(2.8),
    color: '#000000',
    paddingHorizontal: wp(5),
    marginTop: hp(24),
    // paddingTop: hp(14),
    marginBottom: hp(3),
    lineHeight: hp(3.5),
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: wp(5),
  },
  input: {
    marginBottom: hp(1),
    backgroundColor: '#fff',
    height: hp(5.5),
  },
   roleInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: hp(1),
    paddingHorizontal: wp(3),
    paddingVertical: hp(1.5),
    marginBottom: hp(1.5),
    backgroundColor: '#fff',
  },
  roleInputError: {
    borderColor: 'red',
  },
  roleText: {
    flex: 1,
    fontSize: hp(1.7),
    color: '#000000ff',
  },
  placeholderText: {
    color: '#888',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: hp(1),
    marginBottom: hp(2),
    backgroundColor: '#fff',
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    fontSize: hp(2),
    color: '#000', // Explicitly set text color to black
    fontWeight: '400',
  },
  error: {
    color: 'red',
    marginBottom: hp(1),
    fontSize: hp(1.8),
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  loginLinkText: {
    fontSize: hp(2),
    color: '#666',
  },
  
  submitButton: {
    backgroundColor: '#555555',
    paddingVertical: hp(1.8),
    borderRadius: 10,
    alignItems: 'center',
    marginTop: hp(2),
  },
  submitText: {
    color: '#fff',
    fontSize: hp(2),
    fontWeight: '600',
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hp(2),
  },
  bottomText: {
    fontSize: hp(1.8),
    color: '#555',
  },
  loginLink: {
    fontSize: hp(1.8),
    color: '#000',
    fontWeight: 'bold',
  },
});

export default Register;