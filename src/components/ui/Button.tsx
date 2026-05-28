import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  View, 
  TouchableOpacityProps 
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
  textClassName?: string;
}

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  containerClassName = '',
  textClassName = '',
  disabled,
  ...props
}: ButtonProps) {
  
  // Base container styles
  let variantStyles = '';
  let textStyles = '';

  switch (variant) {
    case 'primary':
      variantStyles = 'bg-accent border border-accent';
      textStyles = 'text-background font-bold';
      break;
    case 'secondary':
      variantStyles = 'bg-card border border-border';
      textStyles = 'text-white font-medium';
      break;
    case 'outline':
      variantStyles = 'bg-transparent border border-accent';
      textStyles = 'text-accent font-semibold';
      break;
    case 'text':
      variantStyles = 'bg-transparent';
      textStyles = 'text-white font-medium';
      break;
  }

  // Size configurations
  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3 py-1.5 rounded-md';
      textStyles += ' text-xs';
      break;
    case 'md':
      sizeStyles = 'px-5 py-3 rounded-xl';
      textStyles += ' text-sm tracking-wide';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-4 rounded-2xl';
      textStyles += ' text-base tracking-widest font-bold';
      break;
  }

  const isBtnDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={isBtnDisabled}
      className={`flex-row items-center justify-center ${variantStyles} ${sizeStyles} ${isBtnDisabled ? 'opacity-50' : ''} ${containerClassName}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#0B0B0B' : '#D4AF37'} 
          className="mr-2"
        />
      ) : null}

      {!loading && icon && iconPosition === 'left' ? (
        <View className="mr-2">{icon}</View>
      ) : null}

      <Text className={`${textStyles} ${textClassName} text-center`}>
        {label}
      </Text>

      {!loading && icon && iconPosition === 'right' ? (
        <View className="ml-2">{icon}</View>
      ) : null}
    </TouchableOpacity>
  );
}
