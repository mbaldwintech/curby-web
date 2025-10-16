export interface PanelRef<OpenProps = void, CloseProps = void> {
  isOpen: boolean;
  open: (props: OpenProps) => void;
  close: (props: CloseProps) => void;
}
