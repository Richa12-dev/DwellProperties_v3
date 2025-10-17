import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {useSelector} from 'react-redux';
import {queriesSelectors} from '../../Redux/Queries/queriesSlice';
import {icons} from '../../Assets';
import {AppIcon} from '../../components/AppIcon';
import Navbar from '../../components/CommonNavBar/index';
import GenericIcon from '../../components/GenericIcon';
import BottomSheet from '../../components/SupportButton';
import SupportComponent from '../../components/SupportComponent';
import {Colors} from '../../Theme';
import {getFontFamily} from '../../utils';
import CollectionNavBar from '../../components/CollectionNavBar/CollectionNavBar';

const Support = ({navigation}) => {
  const [associates, setAssociates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isBottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setType] = useState('');

  // Get queries from Redux store instead of static data
  const quaryListData = useSelector(queriesSelectors.getQueries);

  const isFocused = useIsFocused();

  useEffect(() => {
    fetchData();
  }, [isFocused]);

  const fetchData = () => {
    setLoading(false);
    setAssociates(null);
    // No need to set static data anymore, we're using Redux
  };

  const handleAddClick = () => {
    navigation.navigate('Query');
  };

  const renderFooterComponent = () => <View style={styles.footerComponent} />;

  const closeBottomSheet = () => {
    setBottomSheetVisible(false);
    setSelectedItem(null);
  };

  const submitFeedBack = text => {
    console.log(text, 'texttexttext');
    setType(text);
  };

  const fetchData2 = () => {
    console.log('Static feedback submitted for:', selectedItem);
    fetchData();
    setSelectedItem(null);
  };

  const onFeedbackPress = item => {
    setSelectedItem(item);
    setBottomSheetVisible(true);
  };

  const renderItem = ({item, index}) => {
    return (
      <SupportComponent
        data={item}
        fetchdata={fetchData}
        navigation={navigation}
        onFeedbackPress={() => onFeedbackPress(item)}
        name={item.queryType}
        id={item.queryId}
        status={item.queryStatusL1}
        level={`| Level ${item.queryStatusL2 ? 2 : 1}`}
        subject={item.querySubject}
      />
    );
  };

  const renderEmptyComponent = () => (
    <View style={styles.centeredContent}>
      <AppIcon name={icons.nOrecordFound} size={80} />
      <Text style={styles.noRecordText}>No record found</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container2}
      behavior={Platform.OS === 'ios' ? 'padding' : ''}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 100}
    >
      <View style={styles.container}>
        <StatusBar backgroundColor={Colors.black} barStyle="light-content" />
        <CollectionNavBar />

        <Text style={styles.manageText}>Support</Text>

        <FlatList
          data={quaryListData}
          ListFooterComponent={renderFooterComponent}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={renderEmptyComponent}
          refreshing={loading}
          onRefresh={fetchData}
        />
        <TouchableOpacity
          onPress={handleAddClick}
          style={styles.floatingButton}>
          <GenericIcon
            name={'add'}
            style={{fontSize: wp(10), color: 'white'}}
          />
        </TouchableOpacity>
      </View>

      <BottomSheet
        isVisible={isBottomSheetVisible}
        onClose={closeBottomSheet}
        onSubmit={fetchData2}
        onchangetext={submitFeedBack}
        value={type}
        data={false}
      />
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  manage: {
    flexDirection: 'column',
    margin: 10,
    marginTop: 10,
    justifyContent: 'space-between',
    flex: 1,
  },
  footerComponent: {
    height: hp(10),
  },
  manageText: {
    fontSize: wp('6%'),
    fontFamily: getFontFamily('bold'),
    marginHorizontal: 15,
    marginBottom: 7,
    color: Colors.black,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 70,
    right: 20,
    width: wp(15),
    height: wp(15),
    backgroundColor: Colors.black,
    borderRadius: wp(12.5),
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 200,
  },
  noRecordText: {
    fontFamily: getFontFamily('bold'),
    fontSize: 15,
  },
  container2: {
    flex: 1,
    backgroundColor: Colors.black,
    paddingTop: Platform.OS === 'android' ? 0 : StatusBar.currentHeight,
    ...Platform.select({
      ios: {
        paddingTop: hp(7),
      },
    }),
  },
});

export default Support;
