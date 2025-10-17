import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import CustomButton from '../../components/CustomButton';

const FilterModal = ({ visible, filters, onClose, onApply }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const statusData = [
    { label: 'All', value: 'All' },
    { label: 'Open', value: 'Open' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Resolved', value: 'Resolved' },
    { label: 'Closed', value: 'Closed' },
  ];

  const priorityData = [
    { label: 'All', value: 'All' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const levelData = [
    { label: 'All', value: 'All' },
    { label: 'L1', value: 'L1' },
    { label: 'L2', value: 'L2' },
  ];

  const assignedToData = [
    { label: 'All', value: 'All' },
    { label: 'Support Agent 1', value: 'Support Agent 1' },
    { label: 'Support Agent 2', value: 'Support Agent 2' },
    { label: 'Support Agent 3', value: 'Support Agent 3' },
    { label: 'Senior Agent', value: 'Senior Agent' },
    { label: 'Unassigned', value: 'Unassigned' },
  ];

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: 'All',
      priority: 'All',
      level: 'All',
      assignedTo: 'All',
    };
    setLocalFilters(resetFilters);
  };

  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      // CRITICAL: Android specific props
      hardwareAccelerated={true}
      statusBarTranslucent={true}
      supportedOrientations={['portrait']}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filter Tickets</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.filtersContainer}
            nestedScrollEnabled={true}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Status</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={statusData}
                labelField="label"
                valueField="value"
                placeholder="Select Status"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                
                itemTextStyle={styles.dropdownItemText}
                value={localFilters.status}
                onChange={(item) => updateFilter('status', item.value)}
                // CRITICAL: Android dropdown properties
                renderRightIcon={() => (
                  <Text style={styles.dropdownIcon}>▼</Text>
                )}
                search={false}
                maxHeight={200}
                disable={false}
                // CRITICAL: Force render mode
                flatListProps={{
                  keyboardShouldPersistTaps: 'handled',
                  nestedScrollEnabled: true,
                }}
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Priority</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={priorityData}
                labelField="label"
                valueField="value"
                placeholder="Select Priority"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                value={localFilters.priority}
                onChange={(item) => updateFilter('priority', item.value)}
                renderRightIcon={() => (
                  <Text style={styles.dropdownIcon}>▼</Text>
                )}
                search={false}
                maxHeight={200}
                flatListProps={{
                  keyboardShouldPersistTaps: 'handled',
                  nestedScrollEnabled: true,
                }}
              />
            </View>

            <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Level</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={levelData}
                labelField="label"
                valueField="value"
                placeholder="Select Level"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                value={localFilters.level}
                onChange={(item) => updateFilter('level', item.value)}
                renderRightIcon={() => (
                  <Text style={styles.dropdownIcon}>▼</Text>
                )}
                search={false}
                maxHeight={200}
                flatListProps={{
                  keyboardShouldPersistTaps: 'handled',
                  nestedScrollEnabled: true,
                }}
              />
            </View>

            {/* <View style={styles.filterRow}>
              <Text style={styles.filterLabel}>Assigned To</Text>
              <Dropdown
                style={styles.dropdown}
                containerStyle={styles.dropdownContainer}
                data={assignedToData}
                labelField="label"
                valueField="value"
                placeholder="Select Agent"
                placeholderStyle={styles.dropdownPlaceholder}
                selectedTextStyle={styles.dropdownSelectedText}
                itemTextStyle={styles.dropdownItemText}
                value={localFilters.assignedTo}
                onChange={(item) => updateFilter('assignedTo', item.value)}
                renderRightIcon={() => (
                  <Text style={styles.dropdownIcon}>▼</Text>
                )}
                search={false}
                maxHeight={200}
                flatListProps={{
                  keyboardShouldPersistTaps: 'handled',
                  nestedScrollEnabled: true,
                }}
              />
            </View> */}
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={styles.buttonRow}>
              <CustomButton
                title="Reset"
                size={16}
                action={handleReset}
                color="#e0e0e0"
                textColor="#333"
                style={[styles.button, styles.resetButton]}
              />
              <CustomButton
                title="Apply Filters"
                size={16}
                action={handleApply}
                color={Colors.primary}
                textColor="white"
                style={[styles.button, styles.applyButton]}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // CRITICAL: High elevation for Android
    elevation: 1000,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: wp('5%'),
    width: wp('90%'),
    maxHeight: hp('80%'),
    // CRITICAL: Modal content elevation
    elevation: 999,
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontFamily: getFontFamily('bold'),
    color: '#333',
  },
  closeButton: {
    padding: wp('2%'),
  },
  closeButtonText: {
    fontSize: wp('6%'),
    color: '#666',
  },
  filtersContainer: {
    maxHeight: hp('50%'),
  },
  filterRow: {
    marginBottom: hp('3%'),
    // CRITICAL: Ensure proper positioning
    zIndex: 1,
  },
  filterLabel: {
    fontSize: wp('4%'),
    fontFamily: getFontFamily('medium'),
    color: '#333',
    marginBottom: hp('1%'),
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: 'white',
    // CRITICAL: Base elevation for dropdown
    elevation: Platform.OS === 'android' ? 5 : 0,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 2 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.1 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 4 : undefined,
  },
  // CRITICAL: Dropdown container styling
  dropdownContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    // CRITICAL: Very high elevation for dropdown options
    elevation: Platform.OS === 'android' ? 1001 : 0,
    zIndex: 1001,
    shadowColor: Platform.OS === 'ios' ? '#000' : undefined,
    shadowOffset: Platform.OS === 'ios' ? { width: 0, height: 4 } : undefined,
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : undefined,
    shadowRadius: Platform.OS === 'ios' ? 8 : undefined,
  },
  dropdownPlaceholder: {
    fontSize: wp('4%'),
    color: '#999',
    fontFamily: getFontFamily('regular'),
  },
  dropdownSelectedText: {
    fontSize: wp('4%'),
    color: '#333',
    fontFamily: getFontFamily('regular'),
  },
//   dropdownItemText: {
//     fontSize: wp('4%'),
//     color: '#333',
//     fontFamily: getFontFamily('regular'),
//     paddingVertical: 5,
//   },
  dropdownItemText: {
  fontFamily: getFontFamily('regular'),
  fontSize: wp('4%'),
  color: '#1C1C1E',   // dark text (visible on white)
},

  dropdownIcon: {
    fontSize: wp('3%'),
    color: '#666',
  },
  buttonContainer: {
    marginTop: hp('2%'),
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    borderRadius: 10,
  },
  resetButton: {
    marginRight: wp('2%'),
  },
  applyButton: {
    marginLeft: wp('2%'),
  },
});

export default FilterModal;