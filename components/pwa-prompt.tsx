'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, X } from 'lucide-react';

import { usePWA } from '@/hooks/usePWA';
import { Button } from '@/components/ui/button';

const BUTTON_VARIANTS = ['Install App', 'Quick Access', 'Add Shortcut'];

// Helper to get a deterministic variant based on user session
const getVariant = () => {
  // Get or create a session ID from localStorage
  let sessionId = localStorage.getItem('pwa_session_id');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2);
    localStorage.setItem('pwa_session_id', sessionId);
  }

  // Convert sessionId to a number between 0-99
  const hash = Array.from(sessionId).reduce(
    (hash, char) => char.charCodeAt(0) + ((hash << 5) - hash),
    0
  );
  const bucket = Math.abs(hash % 100);

  // Split into three equal groups (33/33/34)
  if (bucket < 33) return BUTTON_VARIANTS[0];
  if (bucket < 66) return BUTTON_VARIANTS[1];
  return BUTTON_VARIANTS[2];
};

export function PWAPrompt() {
  const {
    isInstallable,
    installPWA,
    isUpdateAvailable,
    updateServiceWorker,
    isDismissed,
    dismissPrompt,
  } = usePWA();

  const [buttonText, setButtonText] = useState<string>('Install App');

  useEffect(() => {
    const variant = getVariant();
    setButtonText(variant);

    // sendGTMEvent({
    //   event: 'pwa_install_variant',
    //   value: variant,
    // });
  }, []);

  const handleInstall = () => {
    // sendGTMEvent({
    //   event: 'pwa_install_click',
    //   value: buttonText,
    // });
    installPWA();
  };

  if ((!isInstallable && !isUpdateAvailable) || isDismissed) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 flex justify-center">
      <div className="bg-background relative rounded-lg p-0 shadow-lg">
        {isInstallable && (
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={dismissPrompt}
              className="h-full rounded-r-none px-0"
            >
              <X className="size-5" />
            </Button>
            <Button onClick={handleInstall} className="h-full rounded-l-none">
              <Download className="mr-2 size-4" />
              {buttonText}
            </Button>
          </div>
        )}
        {isUpdateAvailable && (
          <Button
            onClick={updateServiceWorker}
            className="flex items-center gap-2"
          >
            <RefreshCw className="size-4" />
            Update Available
          </Button>
        )}
      </div>
    </div>
  );
}
