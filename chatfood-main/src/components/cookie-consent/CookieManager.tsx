import React, { useEffect } from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import CookieBanner from './CookieBanner';
import CookieModal from './CookieModal';

const CookieManager = () => {
  const { consent } = useCookieConsent();

  // Effect to handle script injection based on consent
  useEffect(() => {
    if (!consent) return;

    // 1. Analytics Scripts
    if (consent.analytics) {
      // Example: Load Google Analytics
      // if (!document.getElementById('ga-script')) {
      //   const script = document.createElement('script');
      //   script.id = 'ga-script';
      //   script.async = true;
      //   script.src = 'https://www.googletagmanager.com/gtag/js?id=YOUR-ID';
      //   document.head.appendChild(script);
      //
      //   const inlineScript = document.createElement('script');
      //   inlineScript.innerHTML = `
      //     window.dataLayer = window.dataLayer || [];
      //     function gtag(){dataLayer.push(arguments);}
      //     gtag('js', new Date());
      //     gtag('config', 'YOUR-ID');
      //   `;
      //   document.head.appendChild(inlineScript);
      // }
      console.log('Analytics cookies allowed - Loading scripts...');
    } else {
      // Optional: Remove scripts if consent is revoked (complex for some 3rd parties)
      // location.reload() might be needed to fully clear state if user revokes
    }

    // 2. Marketing Scripts
    if (consent.marketing) {
      // Load marketing pixels (Facebook, LinkedIn, etc.)
      console.log('Marketing cookies allowed - Loading scripts...');
    }

  }, [consent]);

  return (
    <>
      <CookieBanner />
      <CookieModal />
    </>
  );
};

export default CookieManager;
