// screens/LandlordSupport.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import Container from '../../components/Container/Container';
import { getMaintenanceRequests } from '../../Redux/Maintenance/services';
import { maintenanceSelectors } from '../../Redux/Maintenance/maintenanceSlice';
import { Colors } from '../../Theme';
import { AppIcon } from '../../components/AppIcon';
import { icons } from '../../Assets';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FilterModal from '../../components/FilterModal/FilterModal';
import LandlordSupportCard from '../../components/LandlordSupportCard/LandlordSupportCard';
import { getFontFamily } from '../../utils';

const LandlordSupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    level: 'All',
  });

  // ✅ Get landlord data from Redux
  const loginData = useSelector(s => s.loginData || {});
  const token = loginData?.idToken || loginData?.accessToken;
  const landlord_id = loginData?.userData?.sub || loginData?.user?.sub;

  const { requests, loading, totalRequests, openRequests, closedRequests } = useSelector(maintenanceSelectors.getMaintenanceData);

  useEffect(() => {
    // ✅ Fetch maintenance requests for landlord
    if (token && landlord_id) {
      console.log('📡 Fetching maintenance requests for landlord:', landlord_id);
      dispatch(getMaintenanceRequests({
        landlord_id: landlord_id,
        token: token,
      }));
    }
  }, [dispatch, token, landlord_id]);

  // ✅ Apply filters
  const getDisplayStatus = (item) => {
    // If contractor has accepted, show "In Progress"
    if (item.contractor_assignment?.state === 'ACCEPTED' &&
        item.status?.toLowerCase() !== 'closed' &&
        item.status?.toLowerCase() !== 'resolved') {
      return 'In Progress';
    }
    // Otherwise show the actual status
    return item.status || 'Pending';
  };
  
  const getTenantNameForSort = (ticket) => {
  return (
    ticket?.contractor_job_snapshot?.tenant?.name ||
    ticket?.tenant?.name ||
    ticket?.tenant_name ||
    'Unknown Tenant'
  );
};


  // ✅ Apply filters with display status
  const filteredRequests = requests.filter(item => {
    const displayStatus = getDisplayStatus(item);
    let statusMatch = filters.status === 'All' || displayStatus.toLowerCase() === filters.status.toLowerCase();
    let priorityMatch = filters.priority === 'All' || item.priority?.toLowerCase() === filters.priority.toLowerCase();
    let levelMatch = filters.level === 'All' || item.level === filters.level;
    return statusMatch && priorityMatch && levelMatch;
  })
  .sort((a, b) => {
    const nameA = getTenantNameForSort(a).toLowerCase();
    const nameB = getTenantNameForSort(b).toLowerCase();

    return nameA.localeCompare(nameB);
  });
  ;

  const visible = showAll ? filteredRequests : filteredRequests.slice(0, 3);
  
  // ✅ Count by display status (matching Support.jsx logic)
  const countNew = (requests || []).filter(r => {
    const displayStatus = getDisplayStatus(r);
    return displayStatus.toLowerCase() === 'pending' ||
           displayStatus.toLowerCase() === 'new' ||
           (r.status?.toLowerCase() === 'open' && r.contractor_assignment?.state !== 'ACCEPTED');
  }).length;

  const countInProgress = (requests || []).filter(r => {
    const displayStatus = getDisplayStatus(r);
    return displayStatus.toLowerCase() === 'in progress' ||
           (r.contractor_assignment?.state === 'ACCEPTED' &&
            r.status?.toLowerCase() !== 'closed' &&
            r.status?.toLowerCase() !== 'resolved');
  }).length;

  const countResolved = (requests || []).filter(r => {
    const status = (r.status || '').toLowerCase();
    return status === 'closed' || status === 'resolved' || status === 'completed';
  }).length;

  const handleOpenTicket = (ticket) => {
   navigation.navigate('LandlordTicketDetails', {
      ticketId: ticket.ticket_id || ticket.id,
      ticket: ticket
    });
  };

  const handleRefresh = () => {
    if (token && landlord_id) {
      dispatch(getMaintenanceRequests({
        landlord_id: landlord_id,
        token: token,
      }));
    }
  };

  // ✅ Render Header Component
  const renderHeader = () => (
    <>
      <Text style={styles.pageTitle}>Support Dashboard</Text>

      {/* Status Cards */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          {/* New Request */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(0.5) }}>
              <AppIcon name={icons.totalProperties} size={hp(3)} style={{ marginRight: wp(2) }} />
              <Text style={styles.statusNumber}>{countNew.toString().padStart(2, '0')}</Text>
            </View>
            <Text style={styles.statusLabel}>New Request</Text>
          </View>

          {/* In Progress */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(0.5) }}>
              <AppIcon name={icons.ok} size={hp(3)} style={{ marginRight: wp(2) }} />
              <Text style={styles.statusNumber}>
                {countInProgress.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.statusLabel}>In Progress</Text>
          </View>

          {/* Resolved */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hp(0.5) }}>
              <AppIcon name={icons.closes} size={hp(3)} style={{ marginRight: wp(2) }} />
              <Text style={styles.statusNumber}>
                {countResolved.toString().padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.statusLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View style={[styles.controls, { justifyContent: 'space-between' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <AppIcon name={icons.totalTicket} size={hp(3)} />
          <Text style={styles.controlsTitle}>
            Support Tickets ({filteredRequests.length})
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: wp(2) }}>
          {/* Filter button */}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => setFilterVisible(true)}
          >
            <AppIcon name={icons.progresses} size={hp(3)} />
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // ✅ Render Empty Component
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Icon name="clipboard-text-outline" size={hp(10)} color="#E0E0E0" />
      <Text style={styles.emptyText}>No tickets found</Text>
      <Text style={styles.emptySubText}>
        {requests.length > 0 ? 'Try adjusting your filters' : 'No support tickets yet'}
      </Text>
    </View>
  );

  // ✅ Render Footer Component
  const renderFooter = () => {
    if (filteredRequests.length === 0) return null;
    
    return (
      <>
        {!showAll && filteredRequests.length > 3 && (
          <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showMore}>
            <Text style={styles.showMoreText}>Show More ({filteredRequests.length - 3})</Text>
          </TouchableOpacity>
        )}
        {showAll && filteredRequests.length > 3 && (
          <TouchableOpacity onPress={() => setShowAll(false)} style={styles.showMore}>
            <Text style={styles.showMoreText}>Show Less</Text>
          </TouchableOpacity>
        )}
      </>
    );
  };

  // ✅ Render Item Component
  const renderItem = ({ item }) => (
    <LandlordSupportCard
      ticket={{
        ...item,
        displayStatus: getDisplayStatus(item)
      }}
      onPress={handleOpenTicket}
    />
  );

  return (
    <Container scroll={false}>
      {loading && requests.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(i, idx) => i.ticket_id || i.id || String(idx)}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          onRefresh={handleRefresh}
          refreshing={loading}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={filterVisible}
        filters={filters}
        onClose={() => setFilterVisible(false)}
        onApply={(appliedFilters) => {
          setFilters(appliedFilters);
          setFilterVisible(false);
        }}
      />
    </Container>
  );
};

export default LandlordSupport;

// =================== Styles ===================
const styles = StyleSheet.create({
  flatListContent: {
    flexGrow: 1,
    paddingBottom: hp(2),
  },
  pageTitle: {
    fontSize: hp(2.5),
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: '#111827',
    marginBottom: hp(2),
    paddingHorizontal: wp(4)
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: wp(4),
    padding: wp(5),
    marginBottom: hp(2),
    marginHorizontal: wp(4),
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  statusItem: {
    alignItems: 'center',
    flex: 1
  },
  statusNumber: {
    fontSize: hp(3),
    fontWeight: 'bold',
    fontFamily: getFontFamily('bold'),
    color: '#1F2937'
  },
  statusLabel: {
    fontSize: hp(1.4),
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
    marginTop: hp(0.5)
  },
  totalTicketsTitle: {
    fontSize: hp(2),
    fontWeight: '600',
    fontFamily: getFontFamily('semibold'),
    color: '#111827',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1.5),
    paddingHorizontal: wp(4)
  },
  controlsTitle: {
    marginLeft: wp(2),
    fontSize: hp(2),
    fontWeight: '500',
    fontFamily: getFontFamily('medium'),
    color: '#111827'
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    padding: wp(2.5),
    borderRadius: wp(2.5),
    paddingHorizontal: wp(3.5)
  },
  filterBtnText: {
    color: '#fff',
    marginLeft: wp(1.5),
    fontWeight: '600',
    fontFamily: getFontFamily('semibold'),
    fontSize: hp(1.75),
  },
  refreshBtn: {
    padding: wp(2.5),
    backgroundColor: '#fff',
    borderRadius: wp(2.5),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  showMore: {
    alignSelf: 'center',
    padding: wp(2.5),
    marginVertical: hp(1.5),
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  showMoreText: {
    color: '#DC2626',
    fontWeight: '700',
    fontFamily: getFontFamily('bold'),
    fontSize: hp(1.75),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(5),
  },
  loadingText: {
    marginTop: hp(1.25),
    fontSize: hp(1.75),
    fontFamily: getFontFamily('regular'),
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(7.5),
  },
  emptyText: {
    fontSize: hp(2),
    fontWeight: '600',
    fontFamily: getFontFamily('semibold'),
    color: '#6B7280',
    marginTop: hp(2),
  },
  emptySubText: {
    fontSize: hp(1.75),
    fontFamily: getFontFamily('regular'),
    color: '#9CA3AF',
    marginTop: hp(1),
  },
});
