export type OverlayId = string;

export interface OverlayController {
  id: OverlayId;
  element: React.ReactElement;
  close: () => void;
  isOpen: boolean;
}

export interface OverlayContextValue {
  mount: (id: OverlayId, element: React.ReactElement) => void;
  unmount: (id: OverlayId) => void;
}

export type CreateOverlayElement = (props: {
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
}) => React.ReactElement;

export interface OverlayControlRef {
  close: () => void;
}
