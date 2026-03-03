import type { ReactElement } from 'react';

export type OverlayId = string;

export interface OverlayContextValue {
  mount: (id: OverlayId, element: ReactElement) => void;
  unmount: (id: OverlayId) => void;
}

export type CreateOverlayElement = (props: {
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
}) => ReactElement;

export interface OverlayControlRef {
  close: () => void;
}
