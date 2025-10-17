import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View, Image} from 'react-native';
import Dialog from 'react-native-dialog';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useDispatch, useSelector} from 'react-redux';
import {icons} from '../../Assets';
import {AppIcon} from '../AppIcon';
import {loginDataSelectors} from '../../Redux/Login/loginSlice';
import {logout} from '../../Redux/Login/services';
import {Colors} from '../../Theme';
import {getFontFamily} from '../../utils';

const CollectionNavBar = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {token} = useSelector(loginDataSelectors.getData);
  const [showDialog, setShowDialog] = useState(false);

  const handledialog = () => {
    setShowDialog(true);
  };
  // const handleLogout = () => {
  //   dispatch(
  //     logout({
  //       token: token,
  //     }),
  //   );
  //   setShowDialog(false);
  // };

  const handleLogout = async () => {
    try {
      setShowDialog(false);
      
      // Dispatch logout with token
      await dispatch(logout({ token })).unwrap();
      
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, close dialog and let the action handle navigation
    }
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileHome')}>
          <AppIcon name={icons.avtarGreen} size={40} />
        </TouchableOpacity>
        <View style={styles.logoContainer}>
           <Image
                        source={require('../../Assets/Image/dwellProperties/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                      />
        </View>

           <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <AppIcon
              name={icons.bellIcon}
              size={wp('9')}
              // onPress={() => navigation.navigate('Notification')}
            />
          </TouchableOpacity>
        <TouchableOpacity onPress={handledialog} style={styles.logoutContainer}>
          <AppIcon
            name={icons.logout}
            size={26}
          />
        </TouchableOpacity>
      </View>
      
      <Dialog.Container visible={showDialog}>
        <Text
          style={{
            fontFamily: getFontFamily('medium'),
            textAlign: 'center',
            marginTop: 0,
            color: Colors.primary,
          }}>
          Are you sure you want to logout?
        </Text>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingHorizontal: wp(10),
            marginTop: hp(3),
            marginBottom: hp(3),
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#a1a1a1',
              paddingHorizontal: wp(4),
              paddingVertical: wp(2),
              borderRadius: 4,
            }}
            onPress={handleLogout}>
            <Text
              style={{fontFamily: getFontFamily('medium'), color: 'black'}}>
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: Colors.red,
              paddingHorizontal: wp(4),
              paddingVertical: wp(2),
              borderRadius: 4,
            }}
            onPress={() => setShowDialog(false)}>
            <Text
              style={{fontFamily: getFontFamily('medium'), color: 'white'}}>
              No
            </Text>
          </TouchableOpacity>
        </View>
      </Dialog.Container>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.red,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6, // Further reduced
    height: 50, // Fixed compact height
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    marginLeft: 6,
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoutContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CollectionNavBar;