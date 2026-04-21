import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

export function InstallAppButton() {
  const { isInstalled, isInstallable, showIosHint, install } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);

  const onInstall = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  if (isInstalled) {
    return (
      <span className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-xs font-medium text-green-700">
        App installed
      </span>
    );
  }

  if (isInstallable) {
    return (
      <Button variant="outline" size="sm" onClick={onInstall} disabled={installing}>
        <Download className="h-4 w-4" />
        {installing ? 'Installing...' : 'Install App'}
      </Button>
    );
  }

  if (showIosHint) {
    return <span className="text-xs text-gray-600">Use Share - Add to Home Screen</span>;
  }

  return null;
}

