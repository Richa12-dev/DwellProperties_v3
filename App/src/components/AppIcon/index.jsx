import React from 'react';
import {SvgXml,SvgProps} from 'react-native-svg';

export const AppIcon=({name,size,...props})=>{
    return <SvgXml xml={name} width={size} height={size} {...props}/>;
}