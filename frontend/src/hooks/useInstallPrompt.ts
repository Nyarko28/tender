import { useCallback, useEffect, useMemo, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const isStandaloneDisplayMode = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false;
  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  return isStandaloneDisplayMode || navigatorStandalone;
}

function detectIosSafariWithoutPrompt(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
  return isIos && isSafari;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(detectStandalone());

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstalled(true);
      return true;
    }
    return false;
  }, [deferredPrompt]);

  const isInstallable = !!deferredPrompt && !isInstalled;
  const showIosHint = useMemo(
    () => !isInstallable && !isInstalled && detectIosSafariWithoutPrompt(),
    [isInstallable, isInstalled]
  );

  return {
    isInstalled,
    isInstallable,
    showIosHint,
    install,
  };
}

