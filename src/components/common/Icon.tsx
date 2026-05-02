import React from 'react';
import { Image, ImageProps, StyleSheet, View, Text } from 'react-native';
import { imageAssets } from '../constants/imageAssets';

interface IconProps extends Omit<ImageProps, 'source'> {
  name: keyof typeof imageAssets;
  size?: number;
  tintColor?: string;
}

/**
 * Reusable icon component that uses image assets instead of emojis
 * 
 * Usage:
 * <Icon name="cart" size={24} />
 * <Icon name="profile" size={32} tintColor="#FF6B00" />
 */
export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  tintColor, 
  style,
  ...props 
}) => {
  return (
    <Image
      source={imageAssets[name]}
      style={[
        styles.icon,
        { 
          width: size, 
          height: size,
          tintColor: tintColor,
        },
        style,
      ]}
      {...props}
    />
  );
};

/**
 * Display an icon with a label (replaces emoji + text patterns)
 */
export const IconLabel: React.FC<{
  iconName: keyof typeof imageAssets;
  label: string;
  iconSize?: number;
  containerStyle?: any;
  labelStyle?: any;
}> = ({ iconName, label, iconSize = 24, containerStyle, labelStyle }) => {
  return (
    <View style={[styles.iconLabelContainer, containerStyle]}>
      <Icon name={iconName} size={iconSize} />
      <Text style={[styles.label, labelStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  icon: {
    resizeMode: 'contain',
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: '#1B1F24',
  },
});
