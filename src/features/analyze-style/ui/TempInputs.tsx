'use client';

import type { ChangeEvent } from 'react';

const UI_CLASSES = {
  INPUT: 'input-base',
  LABEL: 'text-sm font-medium text-gray-700',
  DESCRIPTION: 'mt-2 text-sm text-gray-500',
};

interface InputProps<T> {
  id: string;
  label: string;
  value: T;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

interface UrlInputProps extends InputProps<string> {
  placeholder?: string;
  required?: boolean;
}

export const UrlInput = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
}: UrlInputProps) => (
  <div>
    <label htmlFor={id} className={UI_CLASSES.LABEL}>
      {label}
    </label>
    <input
      id={id}
      name={id}
      type='url'
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={UI_CLASSES.INPUT}
    />
  </div>
);

interface NumberInputProps extends InputProps<number> {
  min?: number;
  max?: number;
  description?: string;
}

export const NumberInput = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  description,
}: NumberInputProps) => (
  <div>
    <label htmlFor={id} className={UI_CLASSES.LABEL}>
      {label}
    </label>
    <input
      id={id}
      name={id}
      type='number'
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={UI_CLASSES.INPUT}
    />
    {description && <p className={UI_CLASSES.DESCRIPTION}>{description}</p>}
  </div>
);
