import { useRef, useEffect, useCallback, useState } from 'react';
import { Order } from './useOrders';

const NOTIFICATION_SOUND_KEY = 'orderNotificationEnabled';

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create oscillator for a pleasant "ding" sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5 note
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
    
    // Second tone for a "ding-dong" effect
    setTimeout(() => {
      const osc2 = audioContext.createOscillator();
      const gain2 = audioContext.createGain();
      
      osc2.connect(gain2);
      gain2.connect(audioContext.destination);
      
      osc2.frequency.setValueAtTime(1174.66, audioContext.currentTime); // D6 note
      osc2.type = 'sine';
      
      gain2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      osc2.start(audioContext.currentTime);
      osc2.stop(audioContext.currentTime + 0.5);
    }, 150);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
  }
};

export const useOrderNotification = (orders: Order[]) => {
  const previousOrderIds = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  
  const [notificationEnabled, setNotificationEnabled] = useState(() => {
    const stored = localStorage.getItem(NOTIFICATION_SOUND_KEY);
    return stored === null ? true : stored === 'true';
  });

  const toggleNotification = useCallback(() => {
    setNotificationEnabled(prev => {
      const newValue = !prev;
      localStorage.setItem(NOTIFICATION_SOUND_KEY, String(newValue));
      return newValue;
    });
  }, []);

  useEffect(() => {
    if (!orders || orders.length === 0) return;

    const currentIds = new Set(orders.map(o => o.id));
    
    // Skip notification on first load
    if (isFirstLoad.current) {
      previousOrderIds.current = currentIds;
      isFirstLoad.current = false;
      return;
    }

    // Find new pending orders
    const newPendingOrders = orders.filter(
      o => !previousOrderIds.current.has(o.id) && o.status === 'pending'
    );

    if (newPendingOrders.length > 0 && notificationEnabled) {
      playNotificationSound();
    }

    previousOrderIds.current = currentIds;
  }, [orders, notificationEnabled]);

  return {
    notificationEnabled,
    toggleNotification,
  };
};
