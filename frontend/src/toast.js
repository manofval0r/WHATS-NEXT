/**
 * JADA-themed toast notifications powered by goey-toast.
 * Import { toast } from './toast' and call toast.success('Saved!') etc.
 */
import { goeyToast } from 'goey-toast';

// Re-export the goeyToast instance for direct use
export const toast = goeyToast;
export default goeyToast;
