import React, { useState, useEffect, useRef } from 'react';
import { fixVietnamese } from '../../utils/vietnameseUtils';

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange: (val: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({
  value = '',
  onChange,
  className,
  placeholder,
  type = 'text',
  required,
  ...rest
}) => {
  const [localVal, setLocalVal] = useState(value);
  const isComposingRef = useRef(false);

  // Sync localVal from parent props ONLY when not actively composing IME
  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalVal(fixVietnamese(value));
    }
  }, [value]);

  return (
    <input
      {...rest}
      type={type}
      required={required}
      placeholder={placeholder}
      className={className}
      value={localVal}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        const val = fixVietnamese((e.target as HTMLInputElement).value);
        setLocalVal(val);
        onChange(val);
      }}
      onChange={(e) => {
        const val = e.target.value;
        setLocalVal(val);
        if (!isComposingRef.current) {
          onChange(fixVietnamese(val));
        }
      }}
      onBlur={(e) => {
        isComposingRef.current = false;
        const val = fixVietnamese(e.target.value);
        setLocalVal(val);
        onChange(val);
      }}
    />
  );
};

export interface TextAreaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value?: string;
  onChange: (val: string) => void;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  value = '',
  onChange,
  rows = 3,
  className,
  placeholder,
  ...rest
}) => {
  const [localVal, setLocalVal] = useState(value);
  const isComposingRef = useRef(false);

  useEffect(() => {
    if (!isComposingRef.current) {
      setLocalVal(fixVietnamese(value));
    }
  }, [value]);

  return (
    <textarea
      {...rest}
      rows={rows}
      placeholder={placeholder}
      className={className}
      value={localVal}
      onCompositionStart={() => {
        isComposingRef.current = true;
      }}
      onCompositionEnd={(e) => {
        isComposingRef.current = false;
        const val = fixVietnamese((e.target as HTMLTextAreaElement).value);
        setLocalVal(val);
        onChange(val);
      }}
      onChange={(e) => {
        const val = e.target.value;
        setLocalVal(val);
        if (!isComposingRef.current) {
          onChange(fixVietnamese(val));
        }
      }}
      onBlur={(e) => {
        isComposingRef.current = false;
        const val = fixVietnamese(e.target.value);
        setLocalVal(val);
        onChange(val);
      }}
    />
  );
};
