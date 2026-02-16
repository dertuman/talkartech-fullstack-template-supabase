import { useEffect, useState } from 'react';
import { Workbox, WorkboxLifecycleEvent } from 'workbox-window';

// Define custom event interface for PWA installation prompt
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Extend Window interface for TypeScript
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    workbox?: Workbox;
  }
}

export function usePWA() {
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  useEffect(() => {
    // Handle service worker registration and updates
    const registerServiceWorker = async () => {
      if (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        window.workbox !== undefined
      ) {
        const wb = window.workbox;

        const handleInstall = (event: WorkboxLifecycleEvent) => {
          if (event.isUpdate === true) {
            setIsUpdateAvailable(true);
          }
        };

        wb.addEventListener('installed', handleInstall);
        wb.addEventListener('waiting', () => setIsUpdateAvailable(true));

        try {
          await wb.register();
        } catch (error) {
          console.error('Service worker registration failed:', error);
        }

        return () => {
          wb.removeEventListener('installed', handleInstall);
        };
      }
    };

    // Handle PWA installation prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    void registerServiceWorker();
    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt as EventListener
    );

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener
      );
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsInstallable(false);
      }
    } catch (error) {
      console.error('PWA installation failed:', error);
    }
  };

  const updateServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      window.location.reload();
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  };

  const dismissPrompt = () => {
    setIsDismissed(true);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  return {
    isInstallable,
    installPWA,
    isUpdateAvailable,
    updateServiceWorker,
    isDismissed,
    dismissPrompt,
  };
}
