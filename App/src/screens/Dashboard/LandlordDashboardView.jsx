import React, {useState} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  StatusBar as RNStatusBar
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';

import {icons} from '../../Assets';
import {HelperService} from '../../commonFunction/HelperService';
import {AppIcon} from '../../components/AppIcon';
import Navbar from '../../components/CommonNavBar/index';
import {
  heightPercentageToDP,
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {Colors} from '../../Theme';
import {getFontFamily} from '../../utils';
// import Navbar from '../../components/CommonNavBar/index';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';
// import Navbar from '../../components/CommonNavBar/index';

const LandlordDashboardView = ({navigation}) => {
  const [isChecked, setIsChecked] = useState(true);
  const [selectedPropertyType, setSelectedPropertyType] = useState('Residential Apartment');

  // Property management options
  const propertyTypes = {
    'Residential Apartment': icons.apartment || icons.homeLoanhero,
    'Commercial Space': icons.commercial || icons.businessLoan,
    'Villa/House': icons.villa || icons.homeLoanhero,
    'Office Space': icons.office || icons.businessLoan,
    'Retail Shop': icons.retail || icons.businessLoan,
    'Warehouse': icons.warehouse || icons.businessLoan,
  };

  const handleProceed = () => {
    console.log(selectedPropertyType, 'selectedPropertyType');
    
    if (isChecked) {
      if (selectedPropertyType === 'Residential Apartment') {
        navigation.navigate('ResidentialPropertyManagement');
      } else if (selectedPropertyType === 'Commercial Space') {
        navigation.navigate('CommercialPropertyManagement');
      } else if (selectedPropertyType === 'Villa/House') {
        navigation.navigate('VillaPropertyManagement');
      } else if (selectedPropertyType === 'Office Space') {
        navigation.navigate('OfficeSpaceManagement');
      } else if (selectedPropertyType === 'Retail Shop') {
        navigation.navigate('RetailPropertyManagement');
      } else {
        navigation.navigate('WarehousePropertyManagement');
      }
    }
  };

  const [dropdownData] = useState([
    {value: '1', label: 'Residential Apartment'},
    {value: '2', label: 'Commercial Space'},
    {value: '3', label: 'Villa/House'},
    {value: '4', label: 'Office Space'},
    {value: '5', label: 'Retail Shop'},
    {value: '6', label: 'Warehouse'},
  ]);

  const handleDropdownChange = selectedType => {
    console.log(selectedType);
    setSelectedPropertyType(selectedType);
    setIsChecked(false);
  };

  const { width, height } = Dimensions.get('window');
 
  const wpLocal = (percentage) => {
    return (width * percentage) / 100;
  };
   
  const hpLocal = (percentage) => {
    return (height * percentage) / 100;
  };

  // Quick action buttons for landlord dashboard
  const quickActions = [
    {
      title: 'Add New Property',
      icon: icons.plus || icons.tick,
      action: () => navigation.navigate('AddProperty'),
      color: '#4CAF50'
    },
    {
      title: 'Tenant Management',
      icon: icons.users || icons.tick,
      action: () => navigation.navigate('TenantManagement'),
      color: '#2196F3'
    },
    {
      title: 'Rent Collection',
      icon: icons.money || icons.tick,
      action: () => navigation.navigate('RentCollection'),
      color: '#FF9800'
    },
    {
      title: 'Maintenance Requests',
      icon: icons.maintenance || icons.tick,
      action: () => navigation.navigate('MaintenanceRequests'),
      color: '#9C27B0'
    },
  ];

  return (
    <>
     <RNStatusBar 
                backgroundColor={Colors.black || Colors.red || "#FF0000"} 
                barStyle="light-content" 
                translucent={false}
              />
     <CollectionNavBar />
       {/* <Navbar /> */}
   
  

        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          <View style={styles.content}>
            <Text style={styles.title}>Landlord Dashboard</Text>
            <Text style={styles.welcomeText}>Welcome back! Manage your properties efficiently.</Text>
            
            {/* Quick Actions Grid */}
            <View style={styles.quickActionsContainer}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <View style={styles.actionsGrid}>
                {quickActions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.actionCard, {backgroundColor: action.color}]}
                    onPress={action.action}>
                    <AppIcon
                      name={action.icon}
                      size={wp(8)}
                      style={styles.actionIcon}
                    />
                    <Text style={styles.actionText}>{action.title}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Text style={styles.subtitle}>Select Property Type:</Text>

            {selectedPropertyType ? (
              <View style={styles.checkboxContainer}>
                <AppIcon
                  name={propertyTypes[selectedPropertyType]}
                  size={wp(18)}
                  style={styles.checkboxImage}
                />
                <Text style={styles.checkboxText}>{selectedPropertyType}</Text>
                <View style={styles.checkboxWrapper}>
                  <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
                    <AppIcon
                      name={isChecked ? icons.tick : icons.unTick}
                      size={wp(8)}
                      style={{marginLeft: 20}}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}

            <View style={styles.proceedContainer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  {backgroundColor: isChecked ? '#174135' : '#999'},
                ]}
                onPress={handleProceed}
                disabled={!isChecked}>
                <Text style={styles.submitButtonText}>Manage Property</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dropdownLabel}>
              Switch Property Type:
            </Text>
            
            <Dropdown
              style={[styles.dropdown, styles.dropdownBorder]}
              selectedTextStyle={styles.selectedTextStyle}
              placeholderStyle={styles.placeholderStyle}
              imageStyle={styles.imageStyle}
              iconStyle={styles.iconStyle}
              activeColor={'#517068'}
              maxHeight={200}
              containerStyle={styles.dropdownContainer}
              value={selectedPropertyType}
              fontFamily={getFontFamily('bold')}
              itemTextStyle={styles.dropdownItemText}
              data={dropdownData}
              valueField="value"
              labelField="label"
              imageField="image"
              placeholder={
                <Text style={styles.dropdownPlaceholder}>
                  {selectedPropertyType ? selectedPropertyType : 'Select Property Type'}
                </Text>
              }
              searchPlaceholder="Search property type..."
              onPress={handleDropdownChange}
              onChange={item => handleDropdownChange(item.label)}
              renderOption={(option, selected) => (
                <View
                  style={[
                    styles.dropdownOption,
                    selected && styles.dropdownOptionSelected,
                  ]}>
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      selected && styles.dropdownOptionTextSelected,
                    ]}>
                    {option.label}
                  </Text>
                </View>
              )}
            />

            {/* Property Summary Cards */}
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Property Overview</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>12</Text>
                  <Text style={styles.summaryLabel}>Total Properties</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>8</Text>
                  <Text style={styles.summaryLabel}>Occupied</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>4</Text>
                  <Text style={styles.summaryLabel}>Vacant</Text>
                </View>
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNumber}>$2.4L</Text>
                  <Text style={styles.summaryLabel}>Monthly Income</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
    
    {/* </View> */}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingBottom: 90,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    fontFamily: getFontFamily('bold'),
  },
  title: {
    fontSize: wp(6),
    color: Colors.primary,
    fontFamily: getFontFamily('bold'),
    marginBottom: 5,
  },
  welcomeText: {
    fontSize: wp(4),
    color: '#666',
    fontFamily: getFontFamily('medium'),
    marginBottom: 20,
  },
  subtitle: {
    fontSize: wp(5),
    marginTop: 20,
    fontFamily: getFontFamily('bold'),
    color: Colors.primary,
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontFamily: getFontFamily('bold'),
    color: Colors.primary,
    marginBottom: 15,
  },
  quickActionsContainer: {
    marginBottom: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: wp(42),
    height: hp(12),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    marginBottom: 5,
    tintColor: 'white',
  },
  actionText: {
    color: 'white',
    fontSize: wp(3.5),
    fontFamily: getFontFamily('bold'),
    textAlign: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  checkboxImage: {
    width: wp(7),
    height: hp(7),
    marginRight: 10,
    backgroundColor: '#f5f5f5',
  },
  checkboxText: {
    fontSize: wp(5),
    fontFamily: getFontFamily('bold'),
    color: Colors.primary,
    flex: 1,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 1,
    borderRadius: 50,
  },
  proceedContainer: {
    alignItems: 'center',
    marginTop: 20,
    borderRadius: 20,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: wp(6),
    height: hp(7),
    width: wp(90),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
  },
  dropdownLabel: {
    marginTop: 40,
    fontFamily: getFontFamily('bold'),
    fontSize: wp(4),
    color: '#174135',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    marginTop: 10,
    paddingHorizontal: 20,
    height: hp(7),
  },
  dropdownBorder: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 5,
    marginTop: 10,
  },
  iconStyle: {
    height: hp(4),
    width: wp(5),
  },
  dropdownContainer: {
    borderWidth: 1,
    color: Colors.primary,
    borderColor: Colors.primary,
    marginTop: -4,
    borderBottomLeftRadius: 7,
    borderBottomRightRadius: 7,
  },
  dropdownItemText: {
    color: Colors.primary,
    fontSize: wp(4),
  },
  dropdownPlaceholder: {
    color: Colors.primary,
    fontFamily: getFontFamily('medium'),
  },
  placeholderStyle: {
    fontSize: wp(4),
  },
  dropdownOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    color: Colors.primary,
    borderColor: Colors.primary,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  dropdownOptionSelected: {
    backgroundColor: Colors.primary,
  },
  dropdownOptionText: {
    fontSize: wp(4),
    color: Colors.primary,
  },
  dropdownOptionTextSelected: {
    color: 'white',
  },
  selectedTextStyle: {
    color: Colors.primary,
    fontSize: wp(3),
  },
  summaryContainer: {
    marginTop: 30,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: wp(42),
    height: hp(10),
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryNumber: {
    fontSize: wp(6),
    fontFamily: getFontFamily('bold'),
    color: Colors.primary,
  },
  summaryLabel: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('medium'),
    color: '#666',
    textAlign: 'center',
  },

});

export default LandlordDashboardView;