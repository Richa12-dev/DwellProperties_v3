import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import Modal from 'react-native-modal';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppIcon } from '../../components/AppIcon';
import { icons } from '../../Assets';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';
import { launchImageLibrary } from 'react-native-image-picker';

const JobDetailsModal = ({
  visible,
  job,
  onClose,
  onAccept,
  onDecline,
  onMarkComplete,
  isAccepting = false,
}) => {
  const [showDeclineInput, setShowDeclineInput] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);

  const handleDecline = () => {
    setShowDeclineInput(true);
  };

  const submitDecline = () => {
    if (declineReason.trim()) {
      onDecline(declineReason);
      setShowDeclineInput(false);
      setDeclineReason('');
    }
  };

  const pickImage = async (type) => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
    };

    try {
      const result = await launchImageLibrary(options);
      
      if (!result.didCancel && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        if (type === 'before') {
          setBeforeImage(imageUri);
        } else {
          setAfterImage(imageUri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  if (!job) return null;

  const isInProgress = job.status?.toLowerCase() === 'in progress';
  const isNew = job.status?.toLowerCase() === 'new';
  const hasInvoice = job.has_invoice || job.invoice;
  const invoiceTotal = job.invoice?.total;

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={styles.modalContent}>
        {/* Handle Bar */}
        <View style={styles.modalHandle} />
        
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          disabled={isAccepting}
        >
          <Text style={styles.closeButtonText}>×</Text>
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Status Badge */}
          {isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}
          {isInProgress && (
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>In Progress</Text>
            </View>
          )}

          {/* Job Details */}
          <View style={styles.detailsSection}>
            <View style={styles.locationRow}>
              <AppIcon name={icons.location} size={wp(5)} color={Colors.red} />
              <Text style={styles.detailAddress}>{job.address}</Text>
            </View>
            
            <Text style={styles.detailDescription}>{job.description}</Text>

            <View style={styles.detailRow}>
              <AppIcon name={icons.dollar} size={wp(4.5)} color="#666" />
              <Text style={styles.detailText}>{job.price}</Text>
            </View>

            <View style={styles.detailRow}>
              <AppIcon name={icons.calendar} size={wp(4.5)} color="#666" />
              <Text style={styles.detailText}>{job.date}</Text>
            </View>
          </View>

          {/* Invoice Total Display for In Progress jobs */}
          {isInProgress && hasInvoice && invoiceTotal && (
            <View style={styles.invoiceTotalCard}>
              <View style={styles.invoiceTotalHeader}>
                <AppIcon name={icons.document} size={wp(5)} color="#388E3C" />
                <Text style={styles.invoiceTotalTitle}>Invoice Created</Text>
              </View>
              <View style={styles.invoiceTotalRow}>
                <Text style={styles.invoiceTotalLabel}>Total Amount:</Text>
                <Text style={styles.invoiceTotalValue}>${invoiceTotal.toFixed(2)}</Text>
              </View>
              {job.invoice?.subtotal && (
                <View style={styles.invoiceBreakdown}>
                  <View style={styles.invoiceBreakdownRow}>
                    <Text style={styles.invoiceBreakdownLabel}>Subtotal:</Text>
                    <Text style={styles.invoiceBreakdownValue}>
                      ${job.invoice.subtotal.toFixed(2)}
                    </Text>
                  </View>
                  {job.invoice?.tax > 0 && (
                    <View style={styles.invoiceBreakdownRow}>
                      <Text style={styles.invoiceBreakdownLabel}>Tax:</Text>
                      <Text style={styles.invoiceBreakdownValue}>
                        ${job.invoice.tax.toFixed(2)}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Contact Actions */}
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.callButton}
              disabled={isAccepting}
            >
              <AppIcon name={icons.phone} size={wp(4.5)} color="#000" />
              <Text style={styles.callButtonText}>Call Tenant</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.chatButton}
              disabled={isAccepting}
            >
              <AppIcon name={icons.messages} size={wp(4.5)} color="#fff" />
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Photos Section (for In Progress jobs) */}
          {isInProgress && (
            <View style={styles.uploadSection}>
              <Text style={styles.uploadTitle}>Upload Photos</Text>
              <View style={styles.uploadRow}>
                <View style={styles.uploadBox}>
                  <Text style={styles.uploadLabel}>Before</Text>
                  {beforeImage ? (
                    <Image source={{ uri: beforeImage }} style={styles.uploadedImage} />
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => pickImage('before')}
                    >
                      <AppIcon name={icons.camera} size={wp(4)} color="#999" />
                      <Text style={styles.uploadPlaceholderText}>Upload Image</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.uploadBox}>
                  <Text style={styles.uploadLabel}>After</Text>
                  {afterImage ? (
                    <Image source={{ uri: afterImage }} style={styles.uploadedImage} />
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadPlaceholder}
                      onPress={() => pickImage('after')}
                    >
                      <AppIcon name={icons.camera} size={wp(4)} color="#999" />
                      <Text style={styles.uploadPlaceholderText}>Upload Image</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              
              {/* Info about invoice */}
              {!hasInvoice && (
                <View style={styles.invoiceInfoBox}>
                  <AppIcon name={icons.document} size={wp(4.5)} color="#F57C00" />
                  <Text style={styles.invoiceInfoText}>
                    Add an invoice from the job card to mark this job as complete
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons */}
          {isNew && !showDeclineInput && (
            <>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  isAccepting && styles.buttonDisabled
                ]}
                onPress={onAccept}
                disabled={isAccepting}
              >
                {isAccepting ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator color="#fff" size="small" />
                    <Text style={styles.acceptButtonText}>Processing...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.acceptButtonText}>✓ Accept Job</Text>
                    <Text style={styles.acceptButtonSubtext}>
                      Accept and start working
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.declineButton,
                  isAccepting && styles.buttonDisabled
                ]}
                onPress={handleDecline}
                disabled={isAccepting}
              >
                <Text style={styles.declineButtonText}>✕ Decline Job</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Decline Reason Input */}
          {showDeclineInput && (
            <View style={styles.declineSection}>
              <TextInput
                style={styles.declineInput}
                placeholder="Reason to Decline Job"
                value={declineReason}
                onChangeText={setDeclineReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <View style={styles.declineActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowDeclineInput(false);
                    setDeclineReason('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitDecline}
                >
                  <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Mark as Complete Button */}
          {isInProgress && (
            <TouchableOpacity
              style={[
                styles.completeButton,
                !hasInvoice && styles.completeButtonDisabled
              ]}
              onPress={onMarkComplete}
              disabled={!hasInvoice}
            >
              <Text style={styles.completeButtonText}>✓ Mark as Completed</Text>
              {!hasInvoice && (
                <Text style={styles.completeButtonSubtext}>
                  Invoice required to complete
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wp(6),
    maxHeight: '90%',
  },
  modalHandle: {
    width: wp(10),
    height: hp(0.5),
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: hp(2),
  },
  closeButton: {
    position: 'absolute',
    right: wp(4),
    top: hp(2),
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: wp(6),
    color: '#666',
    marginTop: -hp(0.5),
  },
  newBadge: {
    backgroundColor: '#E3F2FD',
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 12,
    marginBottom: hp(2),
  },
  newBadgeText: {
    color: '#1976D2',
    fontSize: wp(3),
    fontFamily: getFontFamily('semibold'),
  },
  progressBadge: {
    backgroundColor: '#FFF3E0',
    alignSelf: 'flex-start',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.8),
    borderRadius: 12,
    marginBottom: hp(2),
  },
  progressBadgeText: {
    color: '#F57C00',
    fontSize: wp(3),
    fontFamily: getFontFamily('semibold'),
  },
  detailsSection: {
    gap: hp(2),
    marginBottom: hp(3),
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  detailAddress: {
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
    flex: 1,
  },
  detailDescription: {
    fontSize: wp(3.5),
    color: '#666',
    lineHeight: hp(2.5),
    fontFamily: getFontFamily('regular'),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  detailText: {
    fontSize: wp(3.5),
    color: Colors.black,
    fontFamily: getFontFamily('medium'),
  },
  invoiceTotalCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: wp(4),
    marginBottom: hp(2),
    borderWidth: 1,
    borderColor: '#81C784',
  },
  invoiceTotalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    marginBottom: hp(1.5),
  },
  invoiceTotalTitle: {
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
    color: '#388E3C',
  },
  invoiceTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  invoiceTotalLabel: {
    fontSize: wp(3.8),
    fontFamily: getFontFamily('semibold'),
    color: '#2E7D32',
  },
  invoiceTotalValue: {
    fontSize: wp(5.5),
    fontFamily: getFontFamily('bold'),
    color: '#1B5E20',
  },
  invoiceBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#81C784',
    paddingTop: hp(1),
    gap: hp(0.5),
  },
  invoiceBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  invoiceBreakdownLabel: {
    fontSize: wp(3.2),
    fontFamily: getFontFamily('medium'),
    color: '#388E3C',
  },
  invoiceBreakdownValue: {
    fontSize: wp(3.2),
    fontFamily: getFontFamily('semibold'),
    color: '#2E7D32',
  },
  contactActions: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(3),
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    backgroundColor: '#F5F5F5',
    padding: hp(1.8),
    borderRadius: 12,
  },
  callButtonText: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('semibold'),
    color: Colors.black,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    backgroundColor: '#22C55E',
    padding: hp(1.8),
    borderRadius: 12,
  },
  chatButtonText: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('semibold'),
    color: '#fff',
  },
  uploadSection: {
    marginBottom: hp(1),
  },
  uploadTitle: {
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
    marginBottom: hp(1.5),
  },
  uploadRow: {
    flexDirection: 'row',
    gap: wp(3),
    marginBottom: hp(1),
  },
  uploadBox: {
    flex: 1,
  },
  uploadLabel: {
    fontSize: wp(3.5),
    color: '#666',
    fontFamily: getFontFamily('medium'),
    marginBottom: hp(1),
  },
  uploadPlaceholder: {
 height: wp(28),
  borderWidth: 1,
  borderColor: "#D1D5DB",
  borderRadius: 10,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#F9FAFB",
    },
  uploadPlaceholderText: {
    fontSize: wp(3),
    color: '#999',
    fontFamily: getFontFamily('regular'),
  },
  uploadedImage: {
     height: wp(28),
  width: "100%",
  borderRadius: 10,
  },
  invoiceInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(3),
    backgroundColor: '#FFF8E1',
    padding: wp(3.5),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  invoiceInfoText: {
    flex: 1,
    fontSize: wp(3.2),
    color: '#F57C00',
    fontFamily: getFontFamily('medium'),
    lineHeight: hp(2.2),
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
    padding: hp(2),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: hp(1.5),
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
  },
  acceptButtonSubtext: {
    color: '#fff',
    fontSize: wp(3),
    fontFamily: getFontFamily('regular'),
    marginTop: hp(0.3),
    opacity: 0.9,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  declineButton: {
    backgroundColor: '#fff',
    padding: hp(2),
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.red,
  },
  declineButtonText: {
    color: Colors.red,
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
  },
  declineSection: {
    gap: hp(1.5),
  },
  declineInput: {
    backgroundColor: '#F5F5F5',
    padding: wp(4),
    borderRadius: 12,
    minHeight: hp(12),
    fontSize: wp(3.5),
    fontFamily: getFontFamily('regular'),
  },
  declineActions: {
    flexDirection: 'row',
    gap: wp(3),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('semibold'),
    color: '#666',
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.red,
    padding: hp(1.8),
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: wp(3.5),
    fontFamily: getFontFamily('semibold'),
    color: '#fff',
  },
  completeButton: {
    backgroundColor: '#3B82F6',
    padding: hp(2),
    borderRadius: 12,
    alignItems: 'center',
  },
  completeButtonDisabled: {
    backgroundColor: '#BDBDBD',
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
  },
  completeButtonSubtext: {
    color: '#fff',
    fontSize: wp(2.8),
    fontFamily: getFontFamily('regular'),
    marginTop: hp(0.3),
    opacity: 0.9,
  },
});

export default JobDetailsModal;
