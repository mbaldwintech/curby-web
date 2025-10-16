import { toast } from 'sonner';

export const copyToClipboard = async (textToCopy: string) => {
  await navigator.clipboard.writeText(textToCopy);
  toast.info('Text copied to clipboard!', { dismissible: true });
};
