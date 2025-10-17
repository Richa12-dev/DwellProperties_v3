import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { Colors } from '../Theme';
import { getFontFamily } from '../utils';
// import { AppIcon } from '../../components/AppIcon';
import { icons } from '../Assets';
import { AppIcon } from './AppIcon';

const TicketCard = ({ ticket, onPress }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#ff4444';
      case 'Medium':
        return '#ffaa00';
      case 'Low':
        return '#00aa00';
      default:
        return '#888888';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return '#ff6b6b';
      case 'In Progress':
        return '#4ecdc4';
      case 'Resolved':
        return '#45b7d1';
      case 'Closed':
        return '#96ceb4';
      default:
        return '#888888';
    }
  };

  return (
    <TouchableOpacity
      style={styles.ticketCard}
      onPress={() => onPress(ticket)}
      activeOpacity={0.7}
    >
      <View style={styles.ticketHeader}>
        <View style={styles.ticketIdContainer}>
          <Text style={styles.ticketId}>{ticket.ticketId}</Text>
          <View style={[
            styles.levelBadge,
            { backgroundColor: ticket.level === 'L2' ? '#ff9800' : '#2196f3' }
          ]}>
            <Text style={styles.levelText}>{ticket.level}</Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(ticket.status) }
          ]}>
            <Text style={styles.statusText}>{ticket.status}</Text>
          </View>
          <View style={[
            styles.priorityBadge,
            { backgroundColor: getPriorityColor(ticket.priority) }
          ]}>
            <Text style={styles.priorityText}>{ticket.priority}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tenantInfo}>
        <Text style={styles.tenantName}>{ticket.tenantName}</Text>
        <Text style={styles.tenantId}>ID: {ticket.tenantId}</Text>
      </View>

      <Text style={styles.ticketSubject}>{ticket.subject}</Text>
      <Text style={styles.ticketType}>{ticket.queryType}</Text>

      <View style={styles.ticketFooter}>
        <Text style={styles.assignedTo}>Assigned: {ticket.assignedTo}</Text>
        <Text style={styles.updatedAt}>
          Updated: {new Date(ticket.updatedAt).toLocaleDateString()}
        </Text>
      </View>

      {ticket.responses && ticket.responses.length > 0 && (
        <View style={styles.responseIndicator}>
          <AppIcon name={icons.message} size={wp('4%')} />
          <Text style={styles.responseCount}>{ticket.responses.length} responses</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  ticketCard: {
    backgroundColor: 'white',
    marginHorizontal: wp('4%'),
    marginVertical: hp('0.5%'),
    padding: wp('4%'),
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  ticketIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticketId: {
    fontSize: wp('4%'),
    fontFamily: getFontFamily('bold'),
    color: Colors.primary,
    marginRight: wp('2%'),
  },
  levelBadge: {
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.3%'),
    borderRadius: 12,
  },
  levelText: {
    color: 'white',
    fontSize: wp('3%'),
    fontFamily: getFontFamily('bold'),
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 15,
    marginRight: wp('2%'),
  },
  statusText: {
    color: 'white',
    fontSize: wp('3%'),
    fontFamily: getFontFamily('medium'),
  },
  priorityBadge: {
    paddingHorizontal: wp('3%'),
    paddingVertical: hp('0.5%'),
    borderRadius: 15,
  },
  priorityText: {
    color: 'white',
    fontSize: wp('3%'),
    fontFamily: getFontFamily('medium'),
  },
  tenantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  tenantName: {
    fontSize: wp('4.5%'),
    fontFamily: getFontFamily('bold'),
    color: '#333',
  },
  tenantId: {
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
  },
  ticketSubject: {
    fontSize: wp('4%'),
    fontFamily: getFontFamily('medium'),
    color: '#333',
    marginBottom: hp('0.5%'),
  },
  ticketType: {
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
    marginBottom: hp('1%'),
  },
  ticketFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  assignedTo: {
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
  },
  updatedAt: {
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
  },
  responseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    paddingTop: hp('1%'),
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  responseCount: {
    marginLeft: wp('2%'),
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
  },
});

export default TicketCard;