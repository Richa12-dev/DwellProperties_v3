import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector, useDispatch } from 'react-redux';
import { TextInput } from 'react-native-paper';
import {
  landlordSupportSelectors,
  addTicketResponse,
  updateTicketStatus,
  updateTicketPriority,
  assignTicket,
  escalateTicket,
  closeTicket,
} from '../../Redux/Queries/queriesSlice';
import Header from '../../components/Header';
import CustomButton from '../../components/CustomButton';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import { icons } from '../../Assets';
import { AppIcon } from '../../components/AppIcon';
import { Dropdown } from 'react-native-element-dropdown';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';

const LandlordTicketDetails = ({ route, navigation }) => {
  const { ticketId } = route.params;
  const dispatch = useDispatch();
  const scrollViewRef = useRef(null);

  const ticket = useSelector(state =>
    landlordSupportSelectors.getTicketById(state, ticketId)
  );

  const [responseText, setResponseText] = useState('');
  const [showResponseInput, setShowResponseInput] = useState(false);
  const [closeModalVisible, setCloseModalVisible] = useState(false);
  const [closureNote, setClosureNote] = useState('');
  const [selectedPriority, setSelectedPriority] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  const priorityData = [
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const agentData = [
    { label: 'Support Agent 1', value: 'Support Agent 1' },
    { label: 'Support Agent 2', value: 'Support Agent 2' },
    { label: 'Support Agent 3', value: 'Support Agent 3' },
    { label: 'Senior Agent', value: 'Senior Agent' },
    { label: 'Unassigned', value: 'Unassigned' },
  ];

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Header title="Ticket Details" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ticket not found</Text>
        </View>
      </View>
    );
  }

  const handleAddResponse = () => {
    if (responseText.trim()) {
      dispatch(addTicketResponse({
        ticketId: ticket.ticketId,
        message: responseText.trim(),
        respondedBy: 'Landlord Support',
      }));
      setResponseText('');
      setShowResponseInput(false);

      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleStatusChange = (newStatus) => {
    dispatch(updateTicketStatus({
      ticketId: ticket.ticketId,
      status: newStatus,
    }));
  };

  const handlePriorityChange = (item) => {
    dispatch(updateTicketPriority({
      ticketId: ticket.ticketId,
      priority: item.value,
    }));
    setSelectedPriority(item);
  };

  const handleAgentAssignment = (item) => {
    dispatch(assignTicket({
      ticketId: ticket.ticketId,
      assignedTo: item.value,
    }));
    setSelectedAgent(item);
  };

  const handleEscalate = () => {
    Alert.alert(
      'Escalate Ticket',
      'Are you sure you want to escalate this ticket to Level 2?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Escalate', onPress: () => dispatch(escalateTicket({ ticketId: ticket.ticketId })) },
      ]
    );
  };

  const handleCloseTicket = () => {
    dispatch(closeTicket({
      ticketId: ticket.ticketId,
      closureNote: closureNote.trim(),
    }));
    setCloseModalVisible(false);
    setClosureNote('');
    Alert.alert('Success', 'Ticket has been closed successfully');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return '#FF4757';
      case 'Medium': return '#FFA726';
      case 'Low': return '#66BB6A';
      default: return '#9E9E9E';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#FF6B6B';
      case 'In Progress': return '#4ECDC4';
      case 'Resolved': return '#45B7D1';
      case 'Closed': return '#96CEB4';
      default: return '#9E9E9E';
    }
  };

  const isTicketClosed = ticket.status === 'Closed';
  const isTicketResolved = ticket.status === 'Resolved';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <CollectionNavBar />
      <Header title="Ticket Details" />
      <ScrollView 
        ref={scrollViewRef} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketIdLabel}>Ticket ID</Text>
            <Text style={styles.ticketIdValue}>{ticket.ticketId}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ticket.status) }]}>
              <Text style={styles.statusText}>{ticket.status}</Text>
            </View>
          </View>
        </View>

        {/* Priority & Assignment Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Priority & Assignment</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Priority Level</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={[styles.dropdown, styles.modernDropdown]}
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                  itemTextStyle={styles.dropdownItemText} 
                data={priorityData}
                labelField="label"
                valueField="value"
                placeholder="Select Priority"
                value={selectedPriority?.value || ticket.priority}
                onChange={handlePriorityChange}
                renderRightIcon={() => (
                  <View style={[styles.priorityIndicator, { backgroundColor: getPriorityColor(selectedPriority?.value || ticket.priority) }]} />
                )}
              />
            </View>
          </View>
{/* 
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Assigned Agent</Text>
            <View style={styles.dropdownContainer}>
              <Dropdown
                style={[styles.dropdown, styles.modernDropdown]}
                selectedTextStyle={styles.dropdownSelectedText}
                placeholderStyle={styles.dropdownPlaceholder}
                data={agentData}
                labelField="label"
                valueField="value"
                placeholder="Select Agent"
                value={selectedAgent?.value || ticket.assignedTo}
                onChange={handleAgentAssignment}
              />
            </View>
          </View> */}
        </View>

        {/* Actions Section */}
        {!isTicketClosed && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Actions</Text>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.primaryAction]}
              onPress={() => setShowResponseInput(true)}
            >
              <Text style={styles.actionButtonText}>Add Response</Text>
            </TouchableOpacity>

            {showResponseInput && (
              <View style={styles.responseInputContainer}>
                <TextInput
                  label="Write your response"
                  mode="outlined"
                  value={responseText}
                  onChangeText={setResponseText}
                  multiline
                  numberOfLines={4}
                  style={styles.textInput}
                  theme={{
                    colors: {
                      primary: Colors.primary,
                      outline: '#E0E0E0',
                    },
                  }}
                />
                <View style={styles.responseActions}>
                  <TouchableOpacity 
                    style={[styles.responseActionBtn, styles.submitBtn]}
                    onPress={handleAddResponse}
                  >
                    <Text style={styles.responseActionText}>Submit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.responseActionBtn, styles.cancelBtn]}
                    onPress={() => setShowResponseInput(false)}
                  >
                    <Text style={[styles.responseActionText, { color: '#666' }]}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryAction, isTicketResolved && styles.disabledAction]}
              onPress={handleEscalate}
              disabled={isTicketResolved}
            >
              <Text style={[styles.actionButtonText, styles.secondaryActionText, isTicketResolved && styles.disabledText]}>
                Escalate to Level 2
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerAction]}
              onPress={() => setCloseModalVisible(true)}
            >
              <Text style={styles.actionButtonText}>Close Ticket</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Close Ticket Modal */}
      <Modal
        visible={closeModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Close Ticket</Text>
              <Text style={styles.modalSubtitle}>Please provide a closure note</Text>
            </View>
            
            <TextInput
              label="Closure Note"
              mode="outlined"
              value={closureNote}
              onChangeText={setClosureNote}
              multiline
              numberOfLines={4}
              style={styles.modalTextInput}
              theme={{
                colors: {
                  primary: Colors.primary,
                  outline: '#E0E0E0',
                },
              }}
            />
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setCloseModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleCloseTicket}
              >
                <Text style={styles.modalConfirmText}>Confirm Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    padding: wp('5%'),
    paddingBottom: hp('3%'),
  },
  
  // Header Card Styles
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketHeader: {
    marginBottom: hp('2%'),
  },
  ticketIdLabel: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('3.5%'),
    color: '#8E8E93',
    marginBottom: hp('0.5%'),
  },
  ticketIdValue: {
    fontFamily: getFontFamily('bold'),
    fontSize: wp('4.5%'),
    color: '#1C1C1E',
  },
  statusContainer: {
    alignItems: 'flex-start',
  },
  statusBadge: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  statusText: {
    color: '#FFFFFF',
    fontFamily: getFontFamily('semibold'),
    fontSize: wp('3.5%'),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Card Styles
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: wp('5%'),
    marginBottom: hp('2%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: getFontFamily('bold'),
    fontSize: wp('4.5%'),
    color: '#1C1C1E',
    marginBottom: hp('2%'),
  },

  // Input Group Styles
  inputGroup: {
    marginBottom: hp('2%'),
  },
  inputLabel: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4%'),
    color: '#3C3C43',
    marginBottom: hp('1%'),
  },
  dropdownContainer: {
    position: 'relative',
  },
  modernDropdown: {
    borderWidth: 1.5,
    borderColor: '#E5E5EA',
    borderRadius: 12,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: '#FFFFFF',
  },
  dropdownSelectedText: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4%'),
    color: '#1C1C1E',
  },
  dropdownItemText: {
  fontSize: wp('4%'),
  fontFamily: getFontFamily('regular'),
  color: '#1C1C1E', 
},

  dropdownPlaceholder: {
    fontFamily: getFontFamily('regular'),
    fontSize: wp('4%'),
    color: 'black',
  },
  priorityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: wp('2%'),
  },

  // Action Button Styles
  actionButton: {
    paddingVertical: hp('1.8%'),
    borderRadius: 12,
    marginBottom: hp('1.5%'),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: Colors.primary || '#007AFF',
  },
  secondaryAction: {
    backgroundColor: '#FF9500',
  },
  dangerAction: {
    backgroundColor: '#FF3B30',
  },
  disabledAction: {
    backgroundColor: '#C7C7CC',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontFamily: getFontFamily('semibold'),
    fontSize: wp('4.2%'),
  },
  secondaryActionText: {
    color: '#FFFFFF',
  },
  disabledText: {
    color: '#8E8E93',
  },

  // Response Input Styles
  responseInputContainer: {
    marginVertical: hp('2%'),
    padding: wp('4%'),
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    marginBottom: hp('1.5%'),
  },
  responseActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: wp('3%'),
  },
  responseActionBtn: {
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('4%'),
    borderRadius: 8,
  },
  submitBtn: {
    backgroundColor: Colors.red || '#007AFF',
  },
  cancelBtn: {
    backgroundColor: '#E5E5EA',
  },
  responseActionText: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('3.8%'),
    color: '#FFFFFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: wp('85%'),
    maxHeight: hp('70%'),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: wp('5%'),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontFamily: getFontFamily('bold'),
    fontSize: wp('5%'),
    color: '#1C1C1E',
    marginBottom: hp('0.5%'),
  },
  modalSubtitle: {
    fontFamily: getFontFamily('regular'),
    fontSize: wp('3.8%'),
    color: '#8E8E93',
  },
  modalTextInput: {
    margin: wp('5%'),
    backgroundColor: '#FFFFFF',
  },
  modalActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  modalButton: {
    flex: 1,
    paddingVertical: hp('2%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
  },
  modalConfirmButton: {
    backgroundColor: '#FF3B30',
  },
  modalCancelText: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4.2%'),
    color: '#007AFF',
  },
  modalConfirmText: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4.2%'),
    color: '#FFFFFF',
  },

  // Error Styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp('5%'),
  },
  errorText: {
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4.5%'),
    color: '#FF3B30',
  },
});

export default LandlordTicketDetails;