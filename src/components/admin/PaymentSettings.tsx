
import { useState, useEffect } from 'react';
import PaymentSettingsForm from './payment/PaymentSettingsForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getPaymentSettings } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Info } from 'lucide-react';

const PaymentSettings = () => {
  // Fix: Provide a proper queryFn that doesn't take parameters
  const { data, isLoading, error } = useQuery({
    queryKey: ['paymentSettingsDiagnostic'],
    queryFn: () => getPaymentSettings(true), // Pass true here to skip cache
    staleTime: 0,
    retry: 2,
  });

  useEffect(() => {
    // Log diagnostic information about data fetch
    if (data) {
      console.log('Diagnostic payment settings fetch successful:', data);
    }
    if (error) {
      console.error('Diagnostic payment settings fetch error:', error);
    }
  }, [data, error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Configure how customers can pay for tickets
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Connection Issue Detected</AlertTitle>
            <AlertDescription>
              There seems to be a problem connecting to the database. 
              This might affect saving and loading your settings.
            </AlertDescription>
          </Alert>
        )}

        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Changes made here will be immediately reflected on the payment screens.
            Make sure your UPI ID is active and correctly configured.
          </AlertDescription>
        </Alert>

        <PaymentSettingsForm />
      </CardContent>
    </Card>
  );
};

export default PaymentSettings;
