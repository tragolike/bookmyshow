
import { useState, useEffect } from 'react';
import { getPaymentSettings } from '@/integrations/supabase/client';
import { PaymentSettings } from '@/components/payment/types';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

export const usePaymentSettings = (isManualFetch = false) => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: getPaymentSettings,
    enabled: !isManualFetch, // Only auto-fetch if not manually triggered
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 3,
  });
  
  useEffect(() => {
    if (data?.data) {
      setPaymentSettings(data.data);
      console.log('Loaded payment settings from database:', data.data);
    } else if (error) {
      console.error('Error fetching payment settings:', error);
      // Set fallback values on error
      setPaymentSettings({
        upi_id: 'showtix@upi',
        qr_code_url: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg',
        payment_instructions: 'Please make the payment using any UPI app and enter the UTR number for verification.'
      });
      
      if (!isManualFetch) {
        toast.error('Using default payment information');
      }
    }
  }, [data, error, isManualFetch]);
  
  const refreshPaymentSettings = async () => {
    try {
      toast.info('Refreshing payment information...');
      const result = await refetch();
      
      if (result.error) {
        throw result.error;
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing payment settings:', error);
      return false;
    }
  };
  
  return { 
    paymentSettings, 
    isLoading, 
    error, 
    refreshPaymentSettings 
  };
};
