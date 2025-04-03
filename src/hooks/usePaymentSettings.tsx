
import { useState, useEffect } from 'react';
import { getPaymentSettings, updatePaymentSettings } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PaymentSettings {
  id?: string;
  upi_id: string;
  qr_code_url?: string;
  payment_instructions?: string;
  updated_at?: string;
  updated_by?: string;
}

export const usePaymentSettings = () => {
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const queryClient = useQueryClient();
  
  // Fix: Provide a proper queryFn that doesn't take parameters directly
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['paymentSettings'],
    queryFn: () => getPaymentSettings(true), // Always pass skipCache=true to ensure fresh data
    staleTime: 1000 * 10, // 10 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
  
  const mutation = useMutation({
    mutationFn: (newSettings: PaymentSettings) => updatePaymentSettings(newSettings),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['paymentSettings'] });
      toast.success('Payment settings updated successfully');
    },
    onError: (error: any) => {
      console.error('Error updating payment settings:', error);
      toast.error(`Failed to update payment settings: ${error?.message || 'Unknown error'}`);
    }
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
      
      toast.error('Unable to load payment settings. Using defaults.');
    }
  }, [data, error]);
  
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
  
  const updateSettings = async (newSettings: PaymentSettings) => {
    try {
      console.log('Updating payment settings:', newSettings);
      return mutation.mutate(newSettings);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      throw error;
    }
  };
  
  return { 
    paymentSettings, 
    isLoading, 
    error, 
    isUpdating: mutation.isPending,
    refreshPaymentSettings,
    updateSettings
  };
};
