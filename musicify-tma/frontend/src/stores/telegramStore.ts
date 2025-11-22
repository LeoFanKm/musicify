import { create } from 'zustand';

interface TelegramState {
  isReady: boolean;
  platform: string;
  colorScheme: 'light' | 'dark';
  initData: string;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    photoUrl?: string;
  } | null;
  init: () => void;
  showMainButton: (text: string, onClick: () => void) => void;
  hideMainButton: () => void;
  showBackButton: (onClick: () => void) => void;
  hideBackButton: () => void;
  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => void;
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
}

export const useTelegramStore = create<TelegramState>((set, get) => ({
  isReady: false,
  platform: 'unknown',
  colorScheme: 'light',
  initData: '',
  user: null,

  init: () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      console.warn('Telegram WebApp not available');
      return;
    }

    tg.ready();
    tg.expand();

    set({
      isReady: true,
      platform: tg.platform,
      colorScheme: tg.colorScheme,
      initData: tg.initData,
      user: tg.initDataUnsafe.user ? {
        id: tg.initDataUnsafe.user.id,
        firstName: tg.initDataUnsafe.user.first_name,
        lastName: tg.initDataUnsafe.user.last_name,
        username: tg.initDataUnsafe.user.username,
        languageCode: tg.initDataUnsafe.user.language_code,
        photoUrl: tg.initDataUnsafe.user.photo_url,
      } : null,
    });
  },

  showMainButton: (text: string, onClick: () => void) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.MainButton.setText(text);
    tg.MainButton.onClick(onClick);
    tg.MainButton.show();
  },

  hideMainButton: () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.MainButton.hide();
  },

  showBackButton: (onClick: () => void) => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.BackButton.onClick(onClick);
    tg.BackButton.show();
  },

  hideBackButton: () => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.BackButton.hide();
  },

  hapticFeedback: (type: 'light' | 'medium' | 'heavy') => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;
    tg.HapticFeedback.impactOccurred(type);
  },

  showAlert: (message: string) => {
    return new Promise<void>((resolve) => {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        alert(message);
        resolve();
        return;
      }
      tg.showAlert(message, () => resolve());
    });
  },

  showConfirm: (message: string) => {
    return new Promise<boolean>((resolve) => {
      const tg = window.Telegram?.WebApp;
      if (!tg) {
        resolve(confirm(message));
        return;
      }
      tg.showConfirm(message, (confirmed) => resolve(confirmed));
    });
  },
}));
