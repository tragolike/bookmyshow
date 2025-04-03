
import { PaymentSettings } from '@/hooks/usePaymentSettings';

export interface UpiPaymentProps {
  amount: number;
  reference: string;
  onComplete: () => void;
}

export interface UpiPaymentViewProps {
  paymentSettings: PaymentSettings;
  amount: number;
  reference: string;
  upiLink: string;
  onContinue: () => void;
}

export interface UtrVerificationProps {
  amount: number;
  upiId: string;
  countdown: number;
  onVerify: (utrNumber: string) => void;
  savedUtrNumber?: string;
}

export interface PaymentMethodTabsProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  upiContent: React.ReactNode;
  manualContent: React.ReactNode;
}

export interface PaymentCountdownProps {
  initialTime: number;
  onExpire?: () => void;
}
