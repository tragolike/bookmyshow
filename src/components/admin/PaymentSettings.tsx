
import { useState, useEffect } from 'react';
import { uploadFile } from '@/integrations/supabase/client';
import PaymentSettingsForm from './payment/PaymentSettingsForm';

const PaymentSettings = () => {
  return <PaymentSettingsForm />;
};

export default PaymentSettings;
