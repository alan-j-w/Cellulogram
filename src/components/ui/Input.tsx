import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TextInputProps 
} from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  inputClassName?: string;
  disabled?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  containerClassName = '',
  inputClassName = '',
  disabled,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <View className={`w-full mb-4 ${containerClassName}`}>
      {label ? (
        <Text className="text-textPrimary text-xs font-semibold mb-1.5 uppercase tracking-widest opacity-80">
          {label}
        </Text>
      ) : null}

      <View 
        className={`w-full bg-background rounded-xl border px-4 py-3.5 flex-row items-center ${
          error 
            ? 'border-red-500' 
            : isFocused 
              ? 'border-accent' 
              : 'border-border'
        }`}
      >
        <TextInput
          placeholderTextColor={colors.muted}
          className={`flex-1 text-textPrimary text-sm ${inputClassName}`}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={{ padding: 0 }} // Remove default OS padding inside container
          editable={disabled !== undefined ? !disabled : props.editable}
          {...props}
        />
      </View>

      {error ? (
        <Text className="text-red-500 text-xs mt-1.5 font-medium ml-1">
          {error}
        </Text>
      ) : helperText ? (
        <Text className="text-muted text-xs mt-1.5 ml-1">
          {helperText}
        </Text>
      ) : null}
    </View>
  );
}
