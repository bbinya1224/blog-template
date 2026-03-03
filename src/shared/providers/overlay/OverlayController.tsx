'use client';

import { type Ref, useImperativeHandle, useState } from 'react';
import type { CreateOverlayElement, OverlayControlRef } from './types';

interface OverlayControllerProps {
  element: CreateOverlayElement;
  onExit: () => void;
  ref?: Ref<OverlayControlRef>;
}

export function OverlayController({
  element,
  onExit,
  ref,
}: OverlayControllerProps) {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    setIsOpen(false);
  };

  const unmount = () => {
    onExit();
  };

  useImperativeHandle(
    ref,
    () => ({
      close,
    }),
    [],
  );

  return element({ isOpen, close, unmount });
}

OverlayController.displayName = 'OverlayController';
