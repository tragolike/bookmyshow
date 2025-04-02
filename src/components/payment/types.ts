
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
