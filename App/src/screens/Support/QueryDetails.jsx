import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector, useDispatch} from 'react-redux';
import {queriesSelectors, escalateToLevel2, closeQuery} from '../../Redux/Queries/queriesSlice';
import {icons} from '../../Assets';
import {AppIcon} from '../../components/AppIcon';
import CustomButton from '../../components/CustomButton';
import Header from '../../components/Header';
import {Colors} from '../../Theme';
import {getFontFamily} from '../../utils';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';

export default function QueryDetails({route, navigation}) {
  const queryId = route?.params?.data?.queryId || route?.params?.queryId;
  const dispatch = useDispatch();
  
  // Get the latest query data from Redux store
  const data = useSelector(state => 
    queriesSelectors.getQueryById(state, queryId)
  );

  const [tickCount, setTickCount] = useState(1);
  const [showLevel2, setShowLevel2] = useState(false);
  const [escalateButtonEnabled, setEscalateButtonEnabled] = useState(false);
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [el2modalVisible, setEl2modalVisible] = useState(false);
  const [closeButtonEnabled, setCloseButtonEnabled] = useState(false);
  const [el2modalMessage, setEl2modalMessage] = useState('');

  useEffect(() => {
    if (!data) return;
    
    const queryRaisedTime = moment(data?.queryRaisedTime);
    const currentTime = moment();
    const daysDifference = currentTime.diff(queryRaisedTime, 'days');

    if (daysDifference > 8) {
      setCloseButtonEnabled(false);
      setEscalateButtonEnabled(false);
    } else {
      setCloseButtonEnabled(
        data?.queryStatusL2 === 'Open' ||
          (data?.queryStatusL2 == null && data?.queryStatusL1 === 'Open'),
      );
      setEscalateButtonEnabled(
        (data?.queryStatusL1 === 'Open' &&
          !data?.queryStatusL2 &&
          daysDifference >= 4) ||
          data?.queryStatusL2 === 'Open',
      );
    }
  }, [data]);

  const getStatusText = () => {
    if (data?.queryStatusL2 !== null) {
      return data.queryStatusL2;
    } else if (data?.queryStatusL1 !== null) {
      return data.queryStatusL1;
    }
    return 'No status available';
  };

  // Status component to replace the missing CommonStatusCard
  const StatusCard = ({status}) => {
    const normalizedStatus = String(status).toLowerCase();
    const getStatusStyle = () => {
      switch (normalizedStatus?.toLowerCase()) {
        case 'open':
          return {
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            borderColor: '#4caf50',
          };
        case 'closed':
          return {
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderColor: '#f44336',
          };
        case 'pending':
          return {
            backgroundColor: '#fff3e0',
            color: '#ef6c00',
            borderColor: '#ff9800',
          };
        default:
          return {
            backgroundColor: '#f5f5f5',
            color: '#757575',
            borderColor: '#bdbdbd',
          };
      }
    };

    const statusStyle = getStatusStyle();

    return (
      <View
        style={[
          styles.statusCard,
          {
            backgroundColor: statusStyle.backgroundColor,
            borderColor: statusStyle.borderColor,
          },
        ]}>
        <Text
          style={[
            styles.statusText,
            {color: statusStyle.color},
          ]}>
          {status}
        </Text>
      </View>
    );
  };

  if (!data) {
    return (
      <View style={styles.container}>
        <Header title="Query Details" />
        <View style={styles.centeredContent}>
          <Text>Query not found</Text>
        </View>
      </View>
    );
  }

  const formattedQueryRaiseDate = moment(data?.queryRaisedTime).format(
    'DD MMMM YYYY',
  );

  const formattedQueryEndDate = data?.queryStatusTimeL2 
    ? moment(data?.queryStatusTimeL2).format('DD MMMM YYYY')
    : '';

  const closeQuaryButton = () => {
    dispatch(closeQuery({ queryId: data.queryId }));
    setModalMessage(
      `Your query ${data?.queryId} has been closed successfully! \n Your feedback is valuable to us! Share your thoughts now and help us improve.`,
    );
    setModalVisible(true);
  };

  const escalationLevel = () => {
    dispatch(escalateToLevel2({ queryId: data.queryId }));
    setEl2modalMessage(
      `Query ${data?.queryId} Submitted Successfully to L2. \n Close your query when resolved.`,
    );
    setEl2modalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    navigation.navigate('BottomFotter', {screen: 'Menu'});
  };

  const e2closeModal = () => {
    setEl2modalVisible(false);
    navigation.navigate('BottomFotter', {screen: 'Menu'});
  };

  return (
    <KeyboardAvoidingView
      style={styles.container2}
      behavior={Platform.OS === 'ios' ? 'padding' : ''}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
    >
        <CollectionNavBar />
      <View style={styles.container}>
        <Header title="Query Details" />
        <View style={styles.detailsContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.leftText}>{data?.queryId}</Text>
          </View>
          <View style={styles.rightTextContainer}>
            <StatusCard status={getStatusText()} />
          </View>
        </View>
        <View style={[styles.levelContainer, {marginLeft: 20}]}>
          <AppIcon name={icons.tick} size={wp('6%')} />
          {data?.queryStatusL2 && <View style={styles.horizontalLine} />}
          {data?.queryStatusL2 && <AppIcon name={icons.tick} size={wp('6%')} />}
        </View>
        <View style={[styles.levelContainer, {marginLeft: 20, marginTop: 5}]}>
          <View>
            <Text style={styles.levelText}>Level 1</Text>
            <Text style={styles.dateText}>{formattedQueryRaiseDate}</Text>
          </View>
          {data?.queryStatusL2 && (
            <View style={{marginLeft: '28%'}}>
              <Text style={styles.levelText}>Level 2</Text>
              <Text style={styles.dateText}>{formattedQueryEndDate}</Text>
            </View>
          )}
        </View>

        <View style={styles.separator} />

        <View style={styles.queryDetailsContainer}>
          <View style={styles.queryDetailRow}>
            <Text style={styles.queryDetailText}>Type of Query </Text>
            <Text style={styles.queryDetailData}>{data?.queryType}</Text>
          </View>
          <View style={styles.queryDetailRow}>
            <Text style={styles.queryDetailText}>Query Subject</Text>
            <Text style={styles.queryDetailData}>{data?.querySubject}</Text>
          </View>
          <View style={styles.queryDetailRow}>
            <Text style={styles.queryDetailText}>Query</Text>
            <Text style={styles.queryDetailData}>{data?.queryDescription}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {data?.queryStatusL2 == 'Open' ||
          (data?.queryStatusL2 == null && data?.queryStatusL1 == 'Open') ? (
            <View style={{marginBottom: 10}}>
              {closeButtonEnabled && (
                <CustomButton
                  style={{borderRadius: 50}}
                  title={'Close'}
                  size={18}
                  action={closeQuaryButton}
                  align={'center'}
                  loading={false}
                />
              )}
            </View>
          ) : null}
          {data?.queryStatusL2 !== null
            ? null
            : data?.queryStatusL1 !== 'Closed' &&
              data?.queryStatusL2 !== 'Closed' && (
                <CustomButton
                  style={[styles.button, styles.buttonGap]}
                  title="Escalate to Level 2"
                  size={18}
                  action={escalationLevel}
                  disabled={!escalateButtonEnabled}
                  color={!escalateButtonEnabled ? '#7B8A85' : Colors.primary}
                  textColor={!escalateButtonEnabled ? '#a1a1a1' : Colors.white}
                  align="center"
                  loading={false}
                />
              )}
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
        >
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => setModalVisible(false)}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={closeModal}>
                  <Text style={styles.closeButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={el2modalVisible}
          onRequestClose={e2closeModal}>
          <TouchableOpacity
            style={styles.centeredView}
            activeOpacity={1}
            onPressOut={() => setEl2modalVisible(false)}>
            <TouchableWithoutFeedback>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>{el2modalMessage}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={e2closeModal}>
                  <Text style={styles.closeButtonText}>OK</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </TouchableOpacity>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

// Same styles as before...
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  detailsContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20 },
  textContainer: { flexDirection: 'row', alignItems: 'center' },
  leftText: { fontSize: wp('5%'), fontFamily: getFontFamily('bold'), color: '#174035' },
  rightTextContainer: {},
  statusCard: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: wp('3.5%'),
    fontFamily: getFontFamily('medium'),
    textTransform: 'uppercase',
  },
  levelContainer: { flexDirection: 'row' },
  levelText: { fontSize: wp('4%'), fontFamily: getFontFamily('bold'), color: Colors.primary },
  dateText: { fontSize: wp('4'), fontFamily: getFontFamily('bold'), color: '#7B8A85' },
  separator: { height: 1, backgroundColor: '#CCC', marginVertical: 30, marginHorizontal: 10 },
  horizontalLine: { height: 2, width: wp('50%'), backgroundColor: Colors.primary, marginTop: wp(3) },
  queryDetailsContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  queryDetailRow: { marginBottom: 25 },
  queryDetailText: { fontSize: wp('4'), fontFamily: getFontFamily('regular'), color: '#b8b8b8' },
  queryDetailData: { fontSize: wp('4'), fontFamily: getFontFamily('regular'), color: '#174035' },
  buttonContainer: { flexDirection: 'column', justifyContent: 'space-around', padding: 20, position: 'absolute', bottom: 10, width: '100%' },
  button: { backgroundColor: '#174035', width: '100%', justifyContent: 'center', alignItems: 'center', borderRadius: 30, marginTop: 30, height: 60 },
  buttonGap: { marginTop: 20 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { backgroundColor: 'white', borderRadius: 15, padding: 20, alignItems: 'center', shadowColor: '#000', height: hp(30), width: wp(80), shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalText: { marginBottom: 20, textAlign: 'center', fontSize: 18, fontFamily: getFontFamily('medium') , color: Colors.black,
},
  closeButton: { marginTop: 10, borderRadius: 20, paddingVertical: 15, paddingHorizontal: 50, backgroundColor: Colors.primary, position: 'absolute', bottom: 30 },
  closeButtonText: { color: 'white', fontFamily: getFontFamily('medium'), fontSize: 16 },
  container2: { flex: 1, backgroundColor: Colors.black, paddingTop: Platform.OS === 'android' ? 0 : StatusBar.currentHeight, ...Platform.select({ ios: { paddingTop: hp(7) } }) },
});