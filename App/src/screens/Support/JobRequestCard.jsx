import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { AppIcon } from '../../components/AppIcon';
import { icons } from '../../Assets';
import { Colors } from '../../Theme';
import { getFontFamily } from '../../utils';

const JobRequestCard = ({ job, onPress, onAddInvoice }) => {
  const getStatusStyle = (status) => {
    switch(status?.toLowerCase()) {
      case 'in progress':
        return { backgroundColor: '#FFF3E0', color: '#F57C00' };
      case 'new':
        return { backgroundColor: '#E3F2FD', color: '#1976D2' };
      case 'complete':
      case 'completed':
        return { backgroundColor: '#E8F5E9', color: '#388E3C' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#757575' };
    }
  };

  const statusStyle = getStatusStyle(job.status);
  const isInProgress = job.status?.toLowerCase() === 'in progress';
  const hasInvoice = job.has_invoice || job.invoice;
  
  // Get invoice data
  const invoice = job.invoice;
  const invoiceTotal = invoice?.total || 0;
  const invoiceLineItems = invoice?.line_items || [];
  
  const displayAmount = hasInvoice && typeof invoice.total === 'number'
  ? `$${invoice.total.toFixed(2)}`
  : '—';

  return (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.jobHeader}>
        <View style={styles.jobLocation}>
          <AppIcon name={icons.location} size={wp(4)} color={Colors.red} />
          <Text style={styles.jobAddress} numberOfLines={1}>
            {job.address}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
          <Text style={[styles.statusText, { color: statusStyle.color }]}>
            {job.status}
          </Text>
        </View>
      </View>

      <Text style={styles.jobTitle}>{job.title}</Text>
      
      <View style={styles.jobFooter}>
        <View style={styles.jobInfo}>
          <AppIcon name={icons.dollar} size={wp(3.5)} color="#666" />
          <Text style={styles.jobInfoText}>{displayAmount}</Text>
        </View>
        <View style={styles.jobInfo}>
          <AppIcon name={icons.calendar} size={wp(3.5)} color="#666" />
          <Text style={styles.jobInfoText}>{job.date}</Text>
        </View>
      </View>
      
      {/* Show Invoice Status for In Progress jobs */}
      {isInProgress && (
        <>
          {hasInvoice ? (
            // Invoice Added - Show detailed information
            <View style={styles.invoiceAddedContainer}>
              <View style={styles.invoiceAddedHeader}>
                <View style={styles.invoiceAddedBadge}>
                  {/* ✅ FIXED: Use a fallback icon or text if document icon is missing */}
                  {icons.document ? (
                    <AppIcon name={icons.document} size={wp(4.5)} color="#fff" />
                  ) : (
                    <Text style={styles.invoiceIconText}>📄</Text>
                  )}
                  <Text style={styles.invoiceAddedText}>✓ Invoice Added</Text>
                </View>
                {invoiceTotal > 0 && (
                  <Text style={styles.invoiceAddedAmount}>
                    ${invoiceTotal.toFixed(2)}
                  </Text>
                )}
              </View>
              
              {/* Show invoice line items if available */}
              {invoiceLineItems.length > 0 && (
                <View style={styles.invoiceDetails}>
                  <Text style={styles.invoiceDetailsTitle}>Items:</Text>
                  {invoiceLineItems.slice(0, 2).map((item, index) => (
                    <View key={index} style={styles.invoiceLineItem}>
                      <Text style={styles.invoiceItemText} numberOfLines={1}>
                        • {item.description}
                      </Text>
                      <Text style={styles.invoiceItemPrice}>
                        ${(item.qty * item.unit_price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {invoiceLineItems.length > 2 && (
                    <Text style={styles.invoiceMoreItems}>
                      +{invoiceLineItems.length - 2} more item(s)
                    </Text>
                  )}
                </View>
              )}
              
              {/* Show tax if available */}
              {invoice?.tax > 0 && (
                <View style={styles.invoiceTaxRow}>
                  <Text style={styles.invoiceTaxLabel}>Tax:</Text>
                  <Text style={styles.invoiceTaxValue}>
                    ${invoice.tax.toFixed(2)}
                  </Text>
                </View>
              )}
              
            </View>
          ) : (
            // No Invoice - Show Add Invoice button
            <TouchableOpacity
              style={styles.addInvoiceButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent card click
                onAddInvoice && onAddInvoice(job);
              }}
              activeOpacity={0.7}
            >
              {/* ✅ FIXED: Use a fallback icon or text if document icon is missing */}
              {icons.document ? (
                <AppIcon name={icons.document} size={wp(4)} color="#fff" />
              ) : (
                <Text style={styles.invoiceIconText}>📄</Text>
              )}
              <Text style={styles.addInvoiceText}>Add Invoice</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  jobCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: wp(4),
    marginBottom: hp(1.5),
    borderWidth: 1,
    borderColor: 'rgba(229, 57, 53, 0.15)',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: hp(1),
  },
  jobLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1.5),
    flex: 1,
    marginRight: wp(2),
  },
  jobAddress: {
    fontSize: wp(3),
    color: '#666',
    fontFamily: getFontFamily('medium'),
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: 12,
  },
  statusText: {
    fontSize: wp(2.8),
    fontFamily: getFontFamily('semibold'),
  },
  jobTitle: {
    fontSize: wp(4),
    fontFamily: getFontFamily('bold'),
    color: Colors.black,
    marginBottom: hp(1.5),
  },
  jobFooter: {
    flexDirection: 'row',
    gap: wp(4),
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(1),
  },
  jobInfoText: {
    fontSize: wp(3),
    color: '#666',
    fontFamily: getFontFamily('medium'),
  },
  addInvoiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(2),
    backgroundColor: Colors.red,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(4),
    borderRadius: 10,
    marginTop: hp(1),
  },
  addInvoiceText: {
    color: '#fff',
    fontSize: wp(3.5),
    fontFamily: getFontFamily('bold'),
  },
  invoiceIconText: {
    fontSize: wp(4.5),
  },
  invoiceAddedContainer: {
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: wp(3),
    marginTop: hp(1),
    borderWidth: 1,
    borderColor: '#81C784',
  },
  invoiceAddedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp(1),
  },
  invoiceAddedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wp(2),
    backgroundColor: '#388E3C',
    paddingVertical: hp(0.6),
    paddingHorizontal: wp(3),
    borderRadius: 8,
  },
  invoiceAddedText: {
    color: '#fff',
    fontSize: wp(3.2),
    fontFamily: getFontFamily('bold'),
  },
  invoiceAddedAmount: {
    color: '#1B5E20',
    fontSize: wp(5),
    fontFamily: getFontFamily('bold'),
  },
  invoiceDetails: {
    borderTopWidth: 1,
    borderTopColor: '#81C784',
    paddingTop: hp(0.8),
    marginBottom: hp(0.5),
  },
  invoiceDetailsTitle: {
    fontSize: wp(3),
    fontFamily: getFontFamily('semibold'),
    color: '#2E7D32',
    marginBottom: hp(0.5),
  },
  invoiceLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(0.3),
  },
  invoiceItemText: {
    fontSize: wp(3),
    color: '#388E3C',
    fontFamily: getFontFamily('medium'),
    flex: 1,
    marginRight: wp(2),
  },
  invoiceItemPrice: {
    fontSize: wp(3),
    color: '#2E7D32',
    fontFamily: getFontFamily('semibold'),
  },
  invoiceMoreItems: {
    fontSize: wp(2.8),
    color: '#66BB6A',
    fontFamily: getFontFamily('medium'),
    fontStyle: 'italic',
    marginTop: hp(0.3),
  },
  invoiceTaxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: hp(0.5),
    borderTopWidth: 1,
    borderTopColor: '#81C784',
    marginTop: hp(0.5),
  },
  invoiceTaxLabel: {
    fontSize: wp(3),
    fontFamily: getFontFamily('medium'),
    color: '#388E3C',
  },
  invoiceTaxValue: {
    fontSize: wp(3.2),
    fontFamily: getFontFamily('semibold'),
    color: '#2E7D32',
  },
  invoiceNotes: {
    fontSize: wp(2.8),
    color: '#558B2F',
    fontFamily: getFontFamily('regular'),
    marginTop: hp(0.8),
    paddingTop: hp(0.8),
    borderTopWidth: 1,
    borderTopColor: '#A5D6A7',
    fontStyle: 'italic',
  },
});

export default JobRequestCard;
