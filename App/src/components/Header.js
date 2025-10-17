import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {widthPercentageToDP as wp} from 'react-native-responsive-screen';
import {icons} from '../Assets';
import {Colors} from '../Theme';
import {getFontFamily} from '../utils';
import {AppIcon} from './AppIcon';

const Header = ({...props}) => {
  const navigation = useNavigation();
  return (
    <View style={{...style.container, ...props.container}}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{flex: 0.1}}
        hitSlop={{top: 20, bottom: 20, right: 20}}>
        <AppIcon name={props.icon ? props.icon : icons.backIcon} size={wp(5)} />
      </TouchableOpacity>
      <View style={{justifyContent: 'center', flex: 1}}>
        <Text style={{...style.titleStyle2, ...props.textstyle}}>
          {props.title ? props.title : ''}
        </Text>
      </View>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleStyle2: {
    fontSize: wp(5),
    fontWeight: '600',
    color: Colors.primary,
    fontFamily: getFontFamily('bold'),
  },
});

export default Header;
