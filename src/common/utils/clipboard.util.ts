import { showInfoToast } from './toast.util';

export const copyToClipboard = async (textToCopy: string) => {
  await navigator.clipboard.writeText(textToCopy);
  showInfoToast('Text copied to clipboard!');
};
