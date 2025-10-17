import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import {
  landlordSupportSelectors,
  updateFilters,
} from '../../Redux/Queries/queriesSlice';
import Header from '../../components/Header';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import { icons } from '../../Assets';
import { AppIcon } from '../../components/AppIcon';
import TicketCard from '../../components/TicketCard';
import FilterModal from '../../components/FilterModal/FilterModal';
import StatsCard from '../../components/StatsCard/StatsCard';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';

const LandlordSupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  
  const [loading, setLoading] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  // Get data from Redux with null checks and default values
const tickets = useSelector(state => {
  try {
    return landlordSupportSelectors.getFilteredTickets(state) || [];
  } catch (error) {
    console.warn('Error getting filtered tickets:', error);
    return []; // This causes "No tickets found"
  }
});

  const ticketStats = useSelector(state => {
    try {
      return landlordSupportSelectors.getTicketStats(state) || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };
    } catch (error) {
      console.warn('Error getting ticket stats:', error);
      return {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
      };
    }
  });

  const filters = useSelector(state => {
    try {
      return landlordSupportSelectors.getFilters(state) || {
        status: 'All',
        priority: 'All',
        level: 'All',
        assignedTo: 'All',
      };
    } catch (error) {
      console.warn('Error getting filters:', error);
      return {
        status: 'All',
        priority: 'All',
        level: 'All',
        assignedTo: 'All',
      };
    }
  });

  useEffect(() => {
    if (isFocused) {
      fetchTickets();
    }
  }, [isFocused]);

  const fetchTickets = () => {
    setLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleTicketPress = (ticket) => {
    if (ticket && ticket.ticketId) {
     navigation.navigate('LandlordTicketDetails', { ticketId: ticket.ticketId });
    }
  };

  const handleFilterPress = () => {
    setFilterModalVisible(true);
  };

  const handleFilterApply = (newFilters) => {
    dispatch(updateFilters(newFilters));
    setFilterModalVisible(false);
  };

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

  const renderTicketItem = ({ item }) => {
    // Add null checks for the item and its properties
    if (!item) {
      return null;
    }

    const safeItem = {
      ticketId: item.ticketId || 'Unknown',
      level: item.level || 'L1',
      status: item.status || 'Unknown',
      priority: item.priority || 'Medium',
      tenantName: item.tenantName || 'Unknown Tenant',
      tenantId: item.tenantId || 'Unknown',
      subject: item.subject || 'No Subject',
      queryType: item.queryType || 'General',
      assignedTo: item.assignedTo || 'Unassigned',
      updatedAt: item.updatedAt || new Date().toISOString(),
      responses: item.responses || [],
    };

    

    return (
      <TouchableOpacity
        style={styles.ticketCard}
        onPress={() => handleTicketPress(safeItem)}
        activeOpacity={0.7}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketIdContainer}>
            {/* <Text style={styles.ticketId}>{safeItem.ticketId}</Text> */}
            <View style={[
              styles.levelBadge,
              { backgroundColor: safeItem.level === 'L2' ? '#ff9800' : '#2196f3' }
            ]}>
              <Text style={styles.levelText}>{safeItem.level}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(safeItem.status) }
            ]}>
              <Text style={styles.statusText}>{safeItem.status}</Text>
            </View>
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(safeItem.priority) }
            ]}>
              <Text style={styles.priorityText}>{safeItem.priority}</Text>
            </View>
          </View>
        </View>

        <View style={styles.tenantInfo}>
          <Text style={styles.tenantName}>{safeItem.tenantName}</Text>
          <Text style={styles.tenantId}>ID: {safeItem.tenantId}</Text>
        </View>

        <Text style={styles.ticketSubject}>{safeItem.subject}</Text>
        <Text style={styles.ticketType}>{safeItem.queryType}</Text>

        <View style={styles.ticketFooter}>
          <Text style={styles.assignedTo}>Assigned: {safeItem.assignedTo}</Text>
          <Text style={styles.updatedAt}>
            Updated: {new Date(safeItem.updatedAt).toLocaleDateString()}
          </Text>
        </View>

        {safeItem.responses.length > 0 && (
          <View style={styles.responseIndicator}>
            <AppIcon name={icons.message} size={wp('4%')} />
            <Text style={styles.responseCount}>{safeItem.responses.length} responses</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <AppIcon name={icons.nOrecordFound} size={80} />
      <Text style={styles.emptyText}>No tickets found</Text>
      <Text style={styles.emptySubText}>
        {Object.values(filters).some(f => f !== 'All') 
          ? 'Try adjusting your filters' 
          : 'All tickets will appear here'}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatsCard
          title="Open"
          count={ticketStats.open}
          color="#ff6b6b"
          onPress={() => dispatch(updateFilters({ status: 'Open' }))}
        />
        <StatsCard
          title="In Progress"
          count={ticketStats.inProgress}
          color="#4ecdc4"
          onPress={() => dispatch(updateFilters({ status: 'In Progress' }))}
        />
        <StatsCard
          title="Resolved"
          count={ticketStats.resolved}
          color="#45b7d1"
          onPress={() => dispatch(updateFilters({ status: 'Resolved' }))}
        />
        <StatsCard
          title="Closed"
          count={ticketStats.closed}
          color="#96ceb4"
          onPress={() => dispatch(updateFilters({ status: 'Closed' }))}
        />
      </View>

      {/* Filter Button */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={handleFilterPress}
        >
          <AppIcon name={icons.filter} size={wp('5%')} />
          <Text style={styles.filterButtonText}>Filters</Text>
          {Object.values(filters).some(f => f !== 'All') && (
            <View style={styles.activeFilterDot} />
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchTickets}
        >
          <AppIcon name={icons.refresh} size={wp('5%')} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <CollectionNavBar />
      <StatusBar backgroundColor={Colors.black} barStyle="light-content" />
      <Header title="Support Dashboard" />
      
      <FlatList
        data={tickets}
        renderItem={renderTicketItem}
        keyExtractor={(item, index) => item?.ticketId || `ticket-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyComponent}
        refreshing={loading}
        onRefresh={fetchTickets}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal
        visible={filterModalVisible}
        filters={filters}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    paddingBottom: hp('2%'),
  },
  headerContainer: {
    backgroundColor: 'white',
    paddingVertical: hp('2%'),
    marginBottom: hp('1%'),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: wp('4%'),
    marginBottom: hp('2%'),
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1%'),
    borderRadius: 25,
  },
  filterButtonText: {
    color: 'white',
    marginLeft: wp('2%'),
    fontFamily: getFontFamily('medium'),
    fontSize: wp('4%'),
  },
  activeFilterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffeb3b',
    marginLeft: wp('2%'),
  },
  refreshButton: {
    padding: wp('2%'),
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
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
    flexDirection: 'column',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp('10%'),
  },
  emptyText: {
    fontSize: wp('5%'),
    fontFamily: getFontFamily('bold'),
    color: '#333',
    marginTop: hp('2%'),
  },
  emptySubText: {
    fontSize: wp('4%'),
    fontFamily: getFontFamily('regular'),
    color: '#666',
    marginTop: hp('1%'),
    textAlign: 'center',
  },
});

export default LandlordSupport;