'use client';

import { useState, useEffect } from 'react';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG, getBusinessConfig, saveBusinessConfig } from '@/config/business';

export function useBusinessConfig(): { config: BusinessConfig; updateConfig: (newConfig: Partial<BusinessConfig>) => void } {
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);

  useEffect(() => {
    setConfig(getBusinessConfig());

    const handleUpdate = () => {
      setConfig(getBusinessConfig());
    };

    window.addEventListener('business-settings-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('business-settings-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const updateConfig = (newConfig: Partial<BusinessConfig>) => {
    const saved = saveBusinessConfig(newConfig);
    setConfig(saved);
  };

  return { config, updateConfig };
}
