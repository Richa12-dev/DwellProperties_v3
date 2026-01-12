// ContractorSupport.jsx - FIXED VERSION with proper invoice display
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import { AppIcon } from '../../components/AppIcon';
import { icons } from '../../Assets';
import Container from '../../components/Container/Container';
import JobRequestCard from './JobRequestCard';
import JobDetailsModal from './JobDetailsModal';
import InvoiceModal from './InvoiceModal';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllContractorJobs,
  acceptContractorJob,
  declineContractorJob,
  getContractorJob,
  createContractorInvoice,
  getContractorInvoice,
  submitContractorServices,
} from '../../Redux/ContractorServices/services';
import {
  contractorSelectors,
  addPendingJob,
  removePendingJob,
  updateJobLocally,
} from '../../Redux/ContractorServices/contractorSlice';
import Toast from 'react-native-simple-toast';

const categoryPricing = {
  'Electrical': 120,
  'Plumbing': 100,
  'Carpentry': 90,
  'HVAC': 150,
  'Painting': 85,
  'Cleaning': 60,
  'Landscaping': 75,
  'Appliances': 95,
  'Other': 85,
};

// ✅ FIXED: Enhanced transform function to properly extract invoice data and all IDs
const transformJobData = (item, allJobsWithInvoices = {}) => {
  if (!item) {
    console.warn('⚠️ transformJobData received null/undefined item');
    return null;
  }
  
  const property = item.contractor_job_snapshot?.property || {};
  const tenant = item.contractor_job_snapshot?.tenant || {};
  const ids = item.contractor_job_snapshot?.ids || {};
  
  const addressParts = [
    property.name,
    property.street,
    property.city,
    property.state,
    property.pincode
  ].filter(Boolean);
  
  const address = item.address ||
    (addressParts.length > 0
      ? addressParts.join(', ')
      : item.location || 'Location not specified');

  const getUIStatus = () => {
    const assignmentState = item.contractor_assignment?.state?.toUpperCase();
    
    if (assignmentState === 'COMPLETED') {
      return 'Complete';
    } else if (assignmentState === 'ACCEPTED' || assignmentState === 'IN_PROGRESS') {
      return 'In Progress';
    } else if (assignmentState === 'OFFERED' || assignmentState === 'PENDING') {
      return 'New';
    } else {
      return 'New';
    }
  };
  
  // ✅ FIXED: Check for invoice in multiple places and from the lookup object
  const invoiceData =
    allJobsWithInvoices[item.ticket_id] ||  // First check the lookup object from Redux
    item.invoice ||
    item.contractor_assignment?.invoice ||
    null;
  
  const hasInvoice = !!(
    invoiceData ||
    item.has_invoice ||
    item.contractor_assignment?.has_invoice
  );

  const transformedData = {
    ...item,
    id: item.ticket_id,
    address: address,
    title: item.title || 'Maintenance Request',
    price: item.price || `${categoryPricing[item.category] || 85} USD`,
    date: item.date || (item.preferred_window?.start_utc
      ? new Date(item.preferred_window.start_utc).toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Date not specified'),
    status: getUIStatus(),
    description: item.description || item.title || 'No description',
    tenant_name: item.tenant_name || tenant.name,
    tenant_phone: item.tenant_phone || tenant.phone,
    tenant_email: item.tenant_email || tenant.email,
    property_name: item.property_name || property.name,
    has_invoice: hasInvoice,
    invoice: invoiceData,
    // ✅ FIXED: Extract IDs from multiple possible locations
    property_id: item.property_id || ids.property_id,
    tenant_id: item.tenant_id || ids.tenant_id,
    landlord_id: item.landlord_id || ids.landlord_id,
  };

  console.log('📋 Transform result:', {
    ticket_id: transformedData.id,
    has_invoice: transformedData.has_invoice,
    invoice_total: transformedData.invoice?.total,
    property_id: transformedData.property_id,
    tenant_id: transformedData.tenant_id,
    landlord_id: transformedData.landlord_id,
  });

  return transformedData;
};

const ContractorSupport = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [acceptingJobId, setAcceptingJobId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceJob, setInvoiceJob] = useState(null);
  const [isSubmittingInvoice, setIsSubmittingInvoice] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoicesMap, setInvoicesMap] = useState({}); // ✅ NEW: Store invoices separately

  const {
    jobs,
    pendingJobs,
    loading,
    appliedFilters,
  } = useSelector(contractorSelectors.getContractorData);

  const [filters] = useState({
    status: null,
    offered_only: false,
    unassigned_only: false,
    limit: 20,
  });

  // Memoize combined jobs list
  const allJobs = useMemo(() => {
    return [
      ...(Array.isArray(pendingJobs) ? pendingJobs : []),
      ...(Array.isArray(jobs) ? jobs : [])
    ];
  }, [pendingJobs, jobs]);

  // ✅ FIXED: Memoize statistics with invoice data
  const stats = useMemo(() => {
    const totalJobs = allJobs.length;
    const newJobs = Array.isArray(pendingJobs) ? pendingJobs.length : 0;
    const inProgressJobs = allJobs.filter(j => {
      const state = j?.contractor_assignment?.state?.toUpperCase();
      return state === 'ACCEPTED' || state === 'IN_PROGRESS';
    }).length;
    const completedJobs = allJobs.filter(j => {
      const state = j?.contractor_assignment?.state?.toUpperCase();
      return state === 'COMPLETED';
    }).length;
    const totalEarnings = allJobs.reduce((sum, job) => {
      const price = job?.price || categoryPricing[job?.category] || 85;
      return sum + (typeof price === 'number' ? price : parseInt(price.toString().replace(/[^0-9]/g, '')) || 0);
    }, 0);

    return { totalJobs, newJobs, inProgressJobs, completedJobs, totalEarnings };
  }, [allJobs, pendingJobs]);

  // ✅ FIXED: Memoize visible jobs with invoice data
  const visibleJobs = useMemo(() => {
    const jobsToShow = showAll ? allJobs : allJobs.slice(0, 2);
    
    // Add invoice data to jobs
    return jobsToShow.map(job => {
      if (invoicesMap[job.ticket_id]) {
        return {
          ...job,
          invoice: invoicesMap[job.ticket_id],
          has_invoice: true,
        };
      }
      return job;
    });
  }, [showAll, allJobs, invoicesMap]);

  // Initial load - Fetch all jobs
  useEffect(() => {
    console.log('🔄 Initial load: Fetching all contractor jobs');
    dispatch(getAllContractorJobs(filters));
  }, [dispatch]);

  // ✅ FIXED: Load invoices and update local state
  useEffect(() => {
    const loadInvoicesForInProgressJobs = async () => {
      if (!allJobs || allJobs.length === 0) {
        return;
      }
      
      // Get all "In Progress" jobs
      const inProgressJobs = allJobs.filter(job => {
        const state = job?.contractor_assignment?.state?.toUpperCase();
        return state === 'ACCEPTED' || state === 'IN_PROGRESS';
      });
      
      if (inProgressJobs.length === 0) {
        return;
      }
      
      console.log(`📋 Found ${inProgressJobs.length} in-progress jobs, checking for invoices...`);
      setLoadingInvoices(true);
      
      // ✅ NEW: Create a map to store invoices
      const newInvoicesMap = { ...invoicesMap };
      
      // Fetch invoices for all in-progress jobs
      const invoicePromises = inProgressJobs.map(async (job) => {
        try {
          const result = await dispatch(getContractorInvoice({ ticket_id: job.ticket_id })).unwrap();
          
          if (result && result.invoice) {
            console.log(`✅ Invoice loaded for ${job.ticket_id}:`, result.invoice.total);
            
            // ✅ NEW: Store invoice in the map
            newInvoicesMap[job.ticket_id] = result.invoice;
            
            return { ticket_id: job.ticket_id, success: true, invoice: result.invoice };
          }
        } catch (error) {
          console.log(`ℹ️ No invoice for job ${job.ticket_id}`);
          return { ticket_id: job.ticket_id, success: false };
        }
      });
      
      await Promise.allSettled(invoicePromises);
      
      // ✅ NEW: Update the invoices map state
      setInvoicesMap(newInvoicesMap);
      
      setLoadingInvoices(false);
      console.log('✅ Finished loading all invoices. Total invoices:', Object.keys(newInvoicesMap).length);
    };
    
    loadInvoicesForInProgressJobs();
  }, [allJobs.length, dispatch]);

  // Handle new job notification
  useEffect(() => {
    if (route?.params?.newJobTicketId) {
      const ticketId = route.params.newJobTicketId;
      console.log('🔔 New job notification received:', ticketId);
      
      fetchAndShowNewJob(ticketId);
      navigation.setParams({ newJobTicketId: undefined });
    }
  }, [route?.params?.newJobTicketId]);

  const fetchAndShowNewJob = useCallback(async (ticketId) => {
    try {
      console.log('📡 Fetching new job details for:', ticketId);
      
      const result = await dispatch(getContractorJob({ ticket_id: ticketId })).unwrap();
      
      if (result) {
        dispatch(addPendingJob(result));
        
        const transformedJob = transformJobData(result, invoicesMap);
        setSelectedJob(transformedJob);
        setModalVisible(true);
        
        Toast.show('New job request received!');
      }
    } catch (error) {
      console.error('❌ Failed to fetch new job:', error);
      Toast.show('Failed to load job details');
    }
  }, [dispatch, invoicesMap]);

  // ✅ FIXED: Handle job card press with invoice data
  const handleJobPress = useCallback((transformedJob) => {
    console.log('📋 Selected Job:', {
      ticket_id: transformedJob.ticket_id,
      status: transformedJob.status,
      has_invoice: transformedJob.has_invoice,
      invoice_total: transformedJob.invoice?.total,
    });
    setSelectedJob(transformedJob);
    setModalVisible(true);
  }, []);

  // Handle Add Invoice button click from card
  const handleAddInvoiceFromCard = useCallback((job) => {
    console.log('📄 Add Invoice from card:', job.ticket_id);
    setInvoiceJob(job);
    setShowInvoiceModal(true);
  }, []);

  // Handle Accept Job
  const handleAcceptJob = useCallback(async () => {
    if (!selectedJob) return;
    
    const ticketId = selectedJob.ticket_id;
    
    if (acceptingJobId === ticketId) {
      console.log('⚠️ Already processing this job');
      return;
    }
    
    try {
      console.log('✅ Accepting job:', ticketId);
      setAcceptingJobId(ticketId);
      
      const result = await dispatch(acceptContractorJob({
        ticket_id: ticketId
      })).unwrap();
      
      console.log('✅ Job accepted successfully:', result);
      
      dispatch(updateJobLocally({
        ticket_id: ticketId,
        contractor_assignment: {
          ...result.contractor_assignment,
          state: result.contractor_assignment?.state || 'ACCEPTED'
        }
      }));
      
      dispatch(removePendingJob({ ticket_id: ticketId }));
      
      await dispatch(getAllContractorJobs(filters));
      
      setModalVisible(false);
      setAcceptingJobId(null);
      
      Toast.show('Job accepted! You can now create an invoice.');
      
    } catch (error) {
      console.error('❌ Accept job error:', error);
      setAcceptingJobId(null);
      
      const errorMessage = error?.message || error?.toString() || '';
      
      if (errorMessage.includes('already assigned') ||
          errorMessage.includes('ConditionalCheckFailed') ||
          errorMessage.includes('cannot be accepted')) {
        
        Alert.alert(
          'Job Already Assigned',
          'Another contractor has already accepted this job. The job has been removed from your list.',
          [
            {
              text: 'OK',
              onPress: () => {
                dispatch(removePendingJob({ ticket_id: ticketId }));
                setModalVisible(false);
                dispatch(getAllContractorJobs(filters));
              }
            }
          ]
        );
        
      } else {
        Toast.show(errorMessage || 'Failed to accept job. Please try again.');
      }
    }
  }, [selectedJob, acceptingJobId, dispatch, filters]);

  // Handle Decline Job
  const handleDeclineJob = useCallback(async (reason) => {
    if (!selectedJob) return;
    
    try {
      console.log('❌ Declining job:', selectedJob.ticket_id, 'Reason:', reason);
      
      await dispatch(declineContractorJob({
        ticket_id: selectedJob.ticket_id,
        reason: reason || 'Not available'
      })).unwrap();
      
      dispatch(removePendingJob({ ticket_id: selectedJob.ticket_id }));
      setModalVisible(false);
      
      dispatch(getAllContractorJobs(filters));
      
      Toast.show('Job declined');
    } catch (error) {
      console.error('❌ Decline job error:', error);
      Toast.show('Failed to decline job');
    }
  }, [selectedJob, dispatch, filters]);

  // ✅ FIXED: Handle invoice submission with proper job data
  const handleSubmitInvoice = useCallback(async (invoiceData) => {
    if (!invoiceJob) return;
    
    try {
      setIsSubmittingInvoice(true);
      console.log('📤 Submitting invoice for job:', invoiceJob.ticket_id);
      console.log('📋 Job data:', {
        ticket_id: invoiceJob.ticket_id,
        property_id: invoiceJob.property_id,
        tenant_id: invoiceJob.tenant_id,
        landlord_id: invoiceJob.landlord_id,
      });
      
      // ✅ FIXED: Include all required IDs from the job
      const completeInvoiceData = {
        ...invoiceData,
        ticket_id: invoiceJob.ticket_id,
        property_id: invoiceJob.property_id,
        tenant_id: invoiceJob.tenant_id,
        landlord_id: invoiceJob.landlord_id,
      };
      
      console.log('📤 Complete invoice data:', completeInvoiceData);
      
      const result = await dispatch(createContractorInvoice({
        ticket_id: invoiceJob.ticket_id,
        invoiceData: completeInvoiceData
      })).unwrap();
      
      console.log('✅ Invoice created:', result);
      
      // ✅ FIXED: Fetch the invoice immediately after creation
      const invoiceResult = await dispatch(getContractorInvoice({
        ticket_id: invoiceJob.ticket_id
      })).unwrap();
      
      console.log('✅ Invoice fetched:', invoiceResult);
      
      // ✅ NEW: Update the invoices map immediately
      setInvoicesMap(prev => ({
        ...prev,
        [invoiceJob.ticket_id]: invoiceResult.invoice
      }));
      
      setIsSubmittingInvoice(false);
      setShowInvoiceModal(false);
      
      Toast.show('Invoice submitted successfully!');
      
      // Refresh the jobs list
      await dispatch(getAllContractorJobs(filters));
      
      // Update selected job if it's the same job
      if (selectedJob?.ticket_id === invoiceJob.ticket_id) {
        setSelectedJob({
          ...selectedJob,
          has_invoice: true,
          invoice: invoiceResult.invoice
        });
      }
      
    } catch (error) {
      console.error('❌ Submit invoice error:', error);
      setIsSubmittingInvoice(false);
      
      // ✅ FIXED: Better error handling
      const errorMessage = error?.message || error?.toString() || 'Failed to submit invoice';
      
      if (errorMessage.includes('Property not found')) {
        Alert.alert(
          'Property Error',
          'The property information for this job is missing. Please contact support.',
          [{ text: 'OK' }]
        );
      } else {
        Toast.show(errorMessage);
      }
    }
  }, [invoiceJob, dispatch, filters, selectedJob]);

 const handleMarkComplete = useCallback(async () => {
  if (!selectedJob) return;

  // 1️⃣ Invoice check
  if (!selectedJob.has_invoice) {
    Alert.alert(
      'Invoice Required',
      'Please create an invoice before marking this job as complete.',
      [{ text: 'OK' }]
    );
    return;
  }

  // 2️⃣ Extract services from multiple possible locations
  const services =
    selectedJob.services ||
    selectedJob.contractor_assignment?.services ||
    (selectedJob.category ? [selectedJob.category.toLowerCase()] : null);

  console.log('🔍 Job data for completion:', {
    ticket_id: selectedJob.ticket_id,
    services: services,
    category: selectedJob.category,
    contractor_assignment: selectedJob.contractor_assignment,
  });

  if (!Array.isArray(services) || services.length === 0) {
    Alert.alert(
      'Services Required',
      'No services found for this job. Cannot mark as complete.',
      [{ text: 'OK' }]
    );
    return;
  }

  try {
    console.log('📤 Submitting services:', services);
    
    // 3️⃣ Call the API to submit services
    await dispatch(
      submitContractorServices({ services })
    ).unwrap();

    console.log('✅ Services submitted successfully');

    // 4️⃣ Update job locally to show completed status
    dispatch(updateJobLocally({
      ticket_id: selectedJob.ticket_id,
      contractor_assignment: {
        ...selectedJob.contractor_assignment,
        state: 'COMPLETED',
        completed_at: new Date().toISOString(),
      },
    }));

    // 5️⃣ Refresh jobs list
    await dispatch(getAllContractorJobs(filters));

    Toast.show('Job marked as completed successfully!');
    setModalVisible(false);

  } catch (error) {
    console.error('❌ Mark Complete Error:', error);
    
    const errorMessage = error?.message || error?.toString() || 'Failed to mark job complete';
    
    // Check if it's a token expiration error
    if (errorMessage.includes('Invalid or expired') || errorMessage.includes('401')) {
      Alert.alert(
        'Session Expired',
        'Your session has expired. Please log in again.',
        [
          {
            text: 'OK',
            onPress: () => {
              // You might want to navigate to login or refresh token here
              // navigation.navigate('Login');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Error',
        errorMessage,
        [{ text: 'OK' }]
      );
    }
  }
}, [selectedJob, dispatch, filters]);

  // ✅ FIXED: Optimized render function with invoice data
  const renderJobCard = useCallback(({ item }) => {
    const transformedJob = transformJobData(item, invoicesMap);
    return (
      <JobRequestCard
        job={transformedJob}
        onPress={() => handleJobPress(transformedJob)}
        onAddInvoice={handleAddInvoiceFromCard}
      />
    );
  }, [handleJobPress, handleAddInvoiceFromCard, invoicesMap]);

  // Key extractor
  const keyExtractor = useCallback((item) => item.ticket_id, []);

  if (loading && allJobs.length === 0) {
    return (
      <Container>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading jobs...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
      >
        <View style={styles.container}>
          {/* Header Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <AppIcon name={icons.activeJob} size={wp(5)} color="#1976D2" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>TOTAL JOBS</Text>
                <Text style={styles.statValue}>
                  {stats.totalJobs.toString().padStart(2, '0')}
                </Text>
              </View>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.statItem}>
              <AppIcon name={icons.dollar} size={wp(5)} color="#388E3C" />
              <View style={styles.statContent}>
                <Text style={styles.statLabel}>TOTAL EARNINGS</Text>
                <Text style={styles.statValue}>${stats.totalEarnings.toLocaleString()}</Text>
              </View>
            </View>
          </View>

          {/* Jobs Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Jobs Request {appliedFilters && '(Filtered)'}
            </Text>
            {loadingInvoices && (
              <ActivityIndicator size="small" color={Colors.primary} />
            )}
          </View>

          {/* Status Summary */}
          <View style={styles.statusSummary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryNumber}>
                {stats.newJobs.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.summaryLabel}>New Request</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#F57C00' }]}>
                {stats.inProgressJobs.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.summaryLabel}>In Progress</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryNumber, { color: '#388E3C' }]}>
                {stats.completedJobs.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.summaryLabel}>Completed</Text>
            </View>
          </View>

          {/* Jobs List */}
          {allJobs.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No jobs available</Text>
              <Text style={styles.emptySubText}>
                {appliedFilters ? 'Try adjusting your filters' : 'New jobs will appear here'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={visibleJobs}
              renderItem={renderJobCard}
              keyExtractor={keyExtractor}
              scrollEnabled={false}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              windowSize={5}
              initialNumToRender={2}
              extraData={invoicesMap} // ✅ NEW: Re-render when invoices change
              ListFooterComponent={
                <>
                  {!showAll && allJobs.length > 2 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAll(true)}
                    >
                      <Text style={styles.showMoreText}>
                        Show More ({allJobs.length - 2})
                      </Text>
                    </TouchableOpacity>
                  )}
                  {showAll && allJobs.length > 2 && (
                    <TouchableOpacity
                      style={styles.showMoreButton}
                      onPress={() => setShowAll(false)}
                    >
                      <Text style={styles.showMoreText}>Show Less</Text>
                      <AppIcon name={icons.arrowUp} size={wp(4)} color={Colors.red} />
                    </TouchableOpacity>
                  )}
                </>
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Job Details Modal */}
      <JobDetailsModal
        visible={modalVisible}
        job={selectedJob}
        onClose={() => setModalVisible(false)}
        onAccept={handleAcceptJob}
        onDecline={handleDeclineJob}
        onMarkComplete={handleMarkComplete}
        isAccepting={acceptingJobId === selectedJob?.ticket_id}
      />

      {/* Invoice Modal */}
      <InvoiceModal
        visible={showInvoiceModal}
        onClose={() => {
          console.log('📄 Closing invoice modal');
          setShowInvoiceModal(false);
          if (invoiceJob) {
            setTimeout(() => {
              setSelectedJob(invoiceJob);
              setModalVisible(true);
            }, 300);
          }
        }}
        onSubmit={handleSubmitInvoice}
        job={invoiceJob}
        isSubmitting={isSubmittingInvoice}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
    padding: wp(4),
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: hp(2),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
  },
  statContent: {
    gap: hp(0.5),
  },
  statLabel: {
    fontSize: wp(2.5),
    color: '#666',
    fontFamily: getFontFamily('semibold'),
  },
  statValue: {
    fontSize: wp(5),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
  },
  verticalDivider: {
    width: 1,
    height: hp(5),
    backgroundColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  sectionTitle: {
    fontSize: wp(4.5),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
  },
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(2),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: wp(6),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
  },
  summaryLabel: {
    fontSize: wp(2.8),
    color: '#666',
    fontFamily: getFontFamily('medium'),
    marginTop: hp(0.5),
  },
  showMoreButton: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    paddingVertical: hp(1.5),
    gap: wp(2),
  },
  showMoreText: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('bold'),
    color: Colors.red,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(20),
  },
  loadingText: {
    marginTop: hp(2),
    fontSize: wp(4),
    color: Colors.placeholder,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: hp(10),
  },
  emptyText: {
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
    color: Colors.placeholder,
  },
  emptySubText: {
    fontSize: wp(3.5),
    color: Colors.placeholder,
    marginTop: hp(1),
  },
});

export default ContractorSupport;
