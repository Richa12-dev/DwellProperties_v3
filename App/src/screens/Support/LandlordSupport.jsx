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
import FilterModal from '../../components/FilterModal/FilterModal';

// =================== TicketCard ===================
const TicketCard = ({ ticket, onPress }) => {
  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s.includes('progress') || s === 'open') return { bg: '#D1FAE5', color: '#047857' };
    if (s === 'pending' || s === 'new') return { bg: '#FEF3C7', color: '#B45309' };
    if (s === 'resolved' || s === 'closed') return { bg: '#F3F4F6', color: '#6B7280' };
    return { bg: '#F3F4F6', color: '#6B7280' };
  };

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(ticket)}>
      <View style={styles.glassContainer}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{ticket.subject}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusStyle(ticket.status).bg }]}>
            <Text style={[styles.statusText, { color: getStatusStyle(ticket.status).color }]}>
              {ticket.status || 'Pending'}
            </Text>
          </View>
        </View>
        <Text style={styles.cardId}>ID: {ticket.ticketId || ticket.id}</Text>
        <Text style={styles.cardCategory}>{ticket.queryType} • {ticket.priority} Priority</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{ticket.description || ticket.subject}</Text>
      </View>
    </TouchableOpacity>
  );
};

// =================== LandlordSupport ===================
const LandlordSupport = ({ navigation }) => {
  const dispatch = useDispatch();
  const [showAll, setShowAll] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    level: 'All',
  });

  const token = useSelector(s => s.loginData?.accessToken || s.loginData?.idToken);
  const tenant_sub = useSelector(s => s.loginData?.user?.sub);
  const { requests, loading, totalRequests, openRequests, closedRequests } = useSelector(maintenanceSelectors.getMaintenanceData);

  useEffect(() => {
    if (token && tenant_sub) dispatch(getMaintenanceRequests(tenant_sub));
  }, [dispatch, token, tenant_sub]);

  const visible = showAll ? requests : requests.slice(0, 3);
  const countNew = (requests || []).filter(r => (r.status || '').toLowerCase().includes('new')).length;

  const handleOpenTicket = (ticket) => {
    navigation.navigate('LandlordTicketDetails', { ticketId: ticket.request_id || ticket.id, ticket });
  };

  return (
    <Container>
      <Text style={styles.pageTitle}>Support Dashboard</Text>

      {/* Status Cards */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          {/* New Request */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <AppIcon name={icons.totalProperties} size={24} style={{ marginRight: 8 }} />
              <Text style={styles.statusNumber}>{countNew.toString().padStart(2, '0')}</Text>
            </View>
            <Text style={styles.statusLabel}>New Request</Text>
          </View>

          {/* In Progress */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <AppIcon name={icons.ok} size={24} style={{ marginRight: 8 }} />
              <Text style={styles.statusNumber}>{openRequests.toString().padStart(2, '0')}</Text>
            </View>
            <Text style={styles.statusLabel}>In Progress</Text>
          </View>

          {/* Resolved */}
          <View style={styles.statusItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <AppIcon name={icons.closes} size={24} style={{ marginRight: 8 }} />
              <Text style={styles.statusNumber}>{closedRequests.toString().padStart(2, '0')}</Text>
            </View>
            <Text style={styles.statusLabel}>Resolved</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.statusCard}> <View style={[styles.statusRow, { justifyContent: 'space-between' }]}> {/* Total Tickets */} <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}> <AppIcon name={icons.totalTicket} size={24} style={{ marginRight: 40}}/> {/* Text next to icon */} <View style={{ flexDirection: 'column'}}> <Text style={styles.statusItem}>Total Tickets</Text> <Text style={styles.statusLabel}>No. of new Support Ticket</Text> </View> </View> {/* Ticket Open */} <View style={{ flexDirection: 'row', alignItems: 'center' }}> <Text style={[styles.statusNumber, { color: '#F59E0B' }]}>20</Text> </View> </View> </View>

      {/* Filters */}
  {/* Filters */}
<View style={[styles.controls, { justifyContent: 'space-between' }]}>
  {/* Icon + Text tightly together */}
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <AppIcon name={icons.totalTicket} size={24} />
    <Text style={{ marginLeft: 4, fontSize: 16, fontWeight: '500' }}>Support Tickets</Text>
  </View>

  {/* Refresh button */}
  <TouchableOpacity
    style={styles.refreshBtn}
    onPress={() => setFilterVisible(true)}
  >
    <AppIcon name={icons.progresses} size={24} />
  </TouchableOpacity>
</View>


      {loading ? (
        <View style={{ padding: 24 }}><ActivityIndicator /></View>
      ) : (
        <FlatList
          data={visible.filter(item => {
            let statusMatch = filters.status === 'All' || item.status === filters.status;
            let priorityMatch = filters.priority === 'All' || item.priority === filters.priority;
            let levelMatch = filters.level === 'All' || item.level === filters.level;
            return statusMatch && priorityMatch && levelMatch;
          })}
          keyExtractor={(i, idx) => i.request_id || i.id || String(idx)}
          renderItem={({ item }) => <TicketCard ticket={item} onPress={handleOpenTicket} />}
          ListFooterComponent={() => (
            <>
              {!showAll && requests.length > 3 && (
                <TouchableOpacity onPress={() => setShowAll(true)} style={styles.showMore}>
                  <Text style={styles.showMoreText}>Show More ({requests.length - 3})</Text>
                </TouchableOpacity>
              )}
              {showAll && requests.length > 3 && (
                <TouchableOpacity onPress={() => setShowAll(false)} style={styles.showMore}>
                  <Text style={styles.showMoreText}>Show Less</Text>
                </TouchableOpacity>
              )}
            </>
          )}
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
  pageTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16, paddingHorizontal: 16 },
  statusCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, marginHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statusItem: { alignItems: 'center', flex: 1 },
  statusNumber: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  statusLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 16 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DC2626', padding: 10, borderRadius: 22, paddingHorizontal: 14 },
  filterBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700' },
  refreshBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 10 },
  showMore: { alignSelf: 'center', padding: 10, marginVertical: 12 },
  showMoreText: { color: '#DC2626', fontWeight: '700' },
  glassContainer: { borderRadius: 20, padding: 16, marginBottom: 16, marginHorizontal: 16, backgroundColor: 'rgba(255,255,255,0.75)', borderWidth: 1, borderColor: 'rgba(229,57,53,0.15)', shadowColor: '#E53935', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#1F2937', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  cardId: { fontSize: 11, color: '#6B7280', marginBottom: 4 },
  cardCategory: { fontSize: 11, color: '#6B7280', marginBottom: 8 },
  cardDescription: { fontSize: 13, color: '#374151', marginBottom: 12 },
});
