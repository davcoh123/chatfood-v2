import React, { createContext, useContext, useEffect, useState } from 'react';

export interface CookieConsent {
  version: number;
  timestamp: string;
  expiresAt: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent | null;
  isBannerOpen: boolean;
  isModalOpen: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveConsent: (choices: Partial<Pick<CookieConsent, 'analytics' | 'marketing'>>) => void;
  openModal: () => void;
  closeModal: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const COOKIE_NAME = 'cf_cookie_consent';
const CONSENT_VERSION = 1;
const CONSENT_DURATION_DAYS = 183; // ~6 months

// Helper to get cookie
const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i=0;i < ca.length;i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
};

// Helper to set cookie
const setCookie = (name: string, value: string, days: number) => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    expires = "; expires=" + date.toUTCString();
  }
  // Secure in production (HTTPS), Lax for navigation
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = name + "=" + (value || "")  + expires + "; path=/; SameSite=Lax" + secure;
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load consent on mount
  useEffect(() => {
    const loadConsent = () => {
      // Try localStorage first (easier to parse)
      const localConsent = localStorage.getItem(COOKIE_NAME);
      const cookieConsent = getCookie(COOKIE_NAME);
      
      let parsedConsent: CookieConsent | null = null;

      // Prefer cookie as source of truth for server compatibility if needed later, 
      // but localStorage is fine for client-side. We check both for consistency.
      if (cookieConsent) {
        try {
          parsedConsent = JSON.parse(decodeURIComponent(cookieConsent));
        } catch (e) {
          console.error("Failed to parse cookie consent", e);
        }
      } else if (localConsent) {
        try {
          parsedConsent = JSON.parse(localConsent);
        } catch (e) {
          console.error("Failed to parse local consent", e);
        }
      }

      // Check validity (version and expiration)
      if (parsedConsent) {
        const now = new Date();
        const expiresAt = new Date(parsedConsent.expiresAt);
        
        if (parsedConsent.version === CONSENT_VERSION && now < expiresAt) {
          setConsent(parsedConsent);
          return;
        }
      }

      // If no valid consent, show banner
      setIsBannerOpen(true);
    };

    loadConsent();
  }, []);

  const saveToStorage = (newConsent: CookieConsent) => {
    const json = JSON.stringify(newConsent);
    localStorage.setItem(COOKIE_NAME, json);
    setCookie(COOKIE_NAME, encodeURIComponent(json), CONSENT_DURATION_DAYS);
    setConsent(newConsent);
  };

  const acceptAll = () => {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CONSENT_DURATION_DAYS);

    const newConsent: CookieConsent = {
      version: CONSENT_VERSION,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      necessary: true,
      analytics: true,
      marketing: true
    };

    saveToStorage(newConsent);
    setIsBannerOpen(false);
    setIsModalOpen(false);
  };

  const rejectAll = () => {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CONSENT_DURATION_DAYS);

    const newConsent: CookieConsent = {
      version: CONSENT_VERSION,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      necessary: true,
      analytics: false,
      marketing: false
    };

    saveToStorage(newConsent);
    setIsBannerOpen(false);
    setIsModalOpen(false);
  };

  const saveConsent = (choices: Partial<Pick<CookieConsent, 'analytics' | 'marketing'>>) => {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + CONSENT_DURATION_DAYS);

    const newConsent: CookieConsent = {
      version: CONSENT_VERSION,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      necessary: true,
      analytics: choices.analytics ?? false,
      marketing: choices.marketing ?? false
    };

    saveToStorage(newConsent);
    setIsBannerOpen(false);
    setIsModalOpen(false);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  const resetConsent = () => {
    localStorage.removeItem(COOKIE_NAME);
    setCookie(COOKIE_NAME, "", -1);
    setConsent(null);
    setIsBannerOpen(true);
  };

  return (
    <CookieConsentContext.Provider value={{
      consent,
      isBannerOpen,
      isModalOpen,
      acceptAll,
      rejectAll,
      saveConsent,
      openModal,
      closeModal,
      resetConsent
    }}>
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};
