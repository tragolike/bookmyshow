
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

export const usePaymentSettings = (isManualFetch = false) => {
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
    queryFn: () => getPaymentSettings(true), // Pass skipCache=true here
    enabled: !isManualFetch, // Only auto-fetch if not manually triggered
    staleTime: 1000 * 30, // 30 seconds
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
  
  const updateSettings = async (newSettings: PaymentSettings) => {
    return mutation.mutate(newSettings);
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
