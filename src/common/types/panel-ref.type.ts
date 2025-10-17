export interface PanelRef<OpenProps = void, CloseProps = void> {
  isOpen: boolean;
  open: OpenProps extends void ? () => void : (props?: OpenProps) => void;
  close: CloseProps extends void ? () => void : (props?: CloseProps) => void;
}
