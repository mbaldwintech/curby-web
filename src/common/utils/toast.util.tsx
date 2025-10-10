import toast, { ToastOptions } from 'react-hot-toast';
import { ImageIconProps, ToastMessage, ToastType } from '../components';

/** Generic helper to show a toast */
export function showToast<T extends string | number | symbol>(
  type: ToastType,
  text1: string,
  text2?: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) {
  toast.custom(() => (
    <ToastMessage type={type} text1={text1} text2={text2} Icon={options?.Icon} iconProps={options?.iconProps} />
  ));
}

/** Convenience functions for each type */
export const showInfoToast = <T extends string | number | symbol>(
  text2: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) => showToast<T>('info', 'Info', text2, options);

export const showSuccessToast = <T extends string | number | symbol>(
  text2: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) => showToast<T>('success', 'Success', text2, options);

export const showWarningToast = <T extends string | number | symbol>(
  text2: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) => showToast<T>('warning', 'Warning', text2, options);

export const showErrorToast = <T extends string | number | symbol>(
  text2: string,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) => showToast<T>('error', 'Error', text2, options);

export const showNotificationToast = <T extends string | number | symbol>(
  title: string,
  text2: string,
  onClick: () => void,
  options?: Omit<ToastOptions, 'duration'> & {
    Icon?: (props: ImageIconProps<T>) => React.ReactElement;
    iconProps?: ImageIconProps<T>;
  }
) => showToast<T>('notification', title, text2, { ...options });
