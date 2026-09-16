'use client';

import { useState, useEffect } from 'react';
import { BusinessConfig, DEFAULT_BUSINESS_CONFIG, getBusinessConfig, saveBusinessConfig } from '@/config/business';

export function useBusinessConfig(): { config: BusinessConfig; updateConfig: (newConfig: Partial<BusinessConfig>) => Promise<void> } {
  const [config, setConfig] = useState<BusinessConfig>(DEFAULT_BUSINESS_CONFIG);

  const fetchLiveConfig = async () => {
    try {
      const res = await fetch(`/api/settings?t=${Date.now()}`);
      const data = await res.json();
      if (data && data.config) {
        saveBusinessConfig(data.config);
        setConfig(data.config);
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch live store settings, using cached:', err);
    }
    setConfig(getBusinessConfig());
  };

  useEffect(() => {
    fetchLiveConfig();

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

  const updateConfig = async (newConfig: Partial<BusinessConfig>) => {
    const saved = saveBusinessConfig(newConfig);
    setConfig(saved);

    try {
      await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saved),
      });
    } catch (err) {
      console.error('Failed to sync updated store settings to database:', err);
    }
  };

  return { config, updateConfig };
}
