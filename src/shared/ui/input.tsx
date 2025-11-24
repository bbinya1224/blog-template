'use client';

import type { ChangeEventHandler } from 'react';

const UI_CLASSES = {
  INPUT: 'input-base',
  LABEL: 'text-sm font-medium text-gray-700',
  DESCRIPTION: 'mt-2 text-sm text-gray-500',
};

interface InputProps<T> {
  id: string;
  label: string;
  value: T;
  onValueChange: (value: T) => void;
}

interface UrlInputProps extends InputProps<string> {
  placeholder?: string;
  required?: boolean;
}

export const UrlInput = ({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  required,
}: UrlInputProps) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    onValueChange(e.target.value);
  };

  return (
    <div>
      <label htmlFor={id} className={UI_CLASSES.LABEL}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type='url'
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className={UI_CLASSES.INPUT}
      />
    </div>
  );
};

interface NumberInputProps extends InputProps<number> {
  min?: number;
  max?: number;
  description?: string;
}

export const NumberInput = ({
  id,
  label,
  value,
  onValueChange,
  min,
  max,
  description,
}: NumberInputProps) => {
  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const numValue = e.target.valueAsNumber || 0;
    onValueChange(numValue);
  };

  return (
    <div>
      <label htmlFor={id} className={UI_CLASSES.LABEL}>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type='number'
        value={value}
        onChange={handleChange}
        min={min}
        max={max}
        className={UI_CLASSES.INPUT}
      />
      {description && <p className={UI_CLASSES.DESCRIPTION}>{description}</p>}
    </div>
  );
};
