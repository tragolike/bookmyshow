
export interface PaymentSettings {
  upi_id: string;
  qr_code_url?: string;
  payment_instructions?: string;
  updated_by?: string;
}

export interface UpiPaymentProps {
  amount: number;
  reference: string;
  onComplete: () => void;
}

export interface PaymentSummaryCardProps {
  amount: number;
  reference: string;
}

export interface UpiQrCodeProps {
  qrCodeUrl?: string;
}

export interface UpiIdDisplayProps {
  upiId: string;
}

export interface PaymentCountdownProps {
  initialTime: number;
  onExpire?: () => void;
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
}

export interface PaymentErrorStateProps {
  onRefresh: () => void;
}

export interface PaymentMethodTabsProps {
  defaultValue: string;
  onValueChange: (value: string) => void;
  upiContent: React.ReactNode;
  manualContent: React.ReactNode;
}

export interface PaymentLoaderProps {
  message?: string;
}
