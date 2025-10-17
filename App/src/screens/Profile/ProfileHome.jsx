import React from 'react';
import { View, Text, StyleSheet, ScrollView,   StatusBar as RNStatusBar, 
  TouchableOpacity, } from 'react-native';
import { useSelector } from 'react-redux';
import { loginDataSelectors } from '../../Redux/Login/loginSlice';
import { Colors } from '../../Theme';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
import {getFontFamily} from '../../utils';
import {icons} from '../../Assets';
import {AppIcon} from '../../components/AppIcon';

const ProfileHome = ({navigation}) => {
  const loginData = useSelector(state => loginDataSelectors.getLoginStatus(state)) || {};
  const { userData = null, isLogged = false, token = null } = loginData;

  console.log('ProfileHome - Login Data:', loginData);
  console.log('ProfileHome - User Data:', userData);

    const backButton = () => {
    navigation.goBack();
  };

  if (!isLogged || !userData) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.messageText}>
          {!isLogged ? 'Please login to view profile' : 'Loading profile...'}
        </Text>
      </View>
    );
  }

  return (
    <>
  <RNStatusBar
          backgroundColor={Colors.black || Colors.red || "#FF0000"}
          barStyle="light-content"
          translucent={false}
        />
        <CollectionNavBar />

    <ScrollView contentContainerStyle={styles.container}>

           <TouchableOpacity onPress={backButton} style={styles.backButton}>
            <AppIcon name={icons.backIcon} size={16} />
            <Text style={styles.headerText}>Profile Details</Text>
          </TouchableOpacity>
     
<View style={{ height: 20 }} /> 
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email || 'N/A'}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{userData.role || 'N/A'}</Text>
      </View>

      {userData.tenantId && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Tenant ID:</Text>
          <Text style={styles.value}>{userData.tenantId}</Text>
        </View>
      )}

      {userData.landlordId && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>Landlord ID:</Text>
          <Text style={styles.value}>{userData.landlordId}</Text>
        </View>
      )}

      <View style={styles.infoBox}>
        <Text style={styles.label}>User Type:</Text>
        <Text style={styles.value}>
          {userData.landlordId ? 'Landlord' : userData.tenantId ? 'Tenant' : 'Unknown'}
        </Text>
      </View>

      {/* <View style={styles.infoBox}>
        <Text style={styles.label}>Authentication Status:</Text>
        <Text style={[styles.value, { color: token ? 'green' : 'red' }]}>
          {token ? 'Authenticated' : 'Not Authenticated'}
        </Text>
      </View> */}

      {userData.userSub && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>User Sub:</Text>
          <Text style={styles.value}>{userData.userSub}</Text>
        </View>
      )}

   
    </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
    backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  headerText: {
    fontSize: 22,
    marginLeft: 10,
    color: '#1b4339',
    fontFamily: getFontFamily('bold'),
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
 infoBox: {
  marginBottom: 15,
  padding: 20,
  backgroundColor: '#ffffff',
  borderRadius: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,  // For Android shadow
  borderWidth: 1,
  borderColor: '#e0e0e0',
},
label: {
  fontWeight: '700',
  fontSize: 16,
  color: '#333',
  marginBottom: 8,
},
value: {
  fontSize: 16,
  color: '#555',
},


  messageText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  debugBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    marginTop: 20,
  },
  debugLabel: {
    fontWeight: '600',
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  debugText: {
    fontSize: 12,
    color: '#856404',
    fontFamily: 'monospace',
  },
});

export default ProfileHome;