import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Icons } from '../icons';
import type { ConnectionStatus } from '../../types';
import acmeLogo from '../../assets/acme_logistics_inc_logo.jpeg';

interface HeaderProps {
  status: ConnectionStatus;
  isLoading: boolean;
  isGenerating: boolean;
  onRefresh: () => void;
  onGenerateDemo: () => void;
}

export function Header({ status, isLoading, isGenerating, onRefresh, onGenerateDemo }: HeaderProps) {
  const statusConfig = {
    connecting: { label: 'Connecting...', variant: 'secondary' as const },
    connected: { label: 'Connected', variant: 'success' as const },
    disconnected: { label: 'Disconnected', variant: 'destructive' as const },
    error: { label: 'Error', variant: 'destructive' as const },
  };

  const config = statusConfig[status];

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 max-w-screen-2xl items-center justify-between px-4'>
        <div className='flex items-center gap-4'>
          <a href='#' className='flex items-center gap-3'>
            <img 
              src={acmeLogo} 
              alt='ACME Logistics' 
              className='h-8 w-8 rounded-lg object-cover'
            />
            <div className='flex items-center gap-2'>
              <span className='font-semibold hidden sm:inline-block'>ACME Logistics</span>
              <Badge variant='outline' className='text-[10px]'>
                Voice AI
              </Badge>
            </div>
          </a>
        </div>

        <div className='flex items-center gap-2'>
          <Badge variant={config.variant} className='gap-1.5'>
            <span className={`h-2 w-2 rounded-full ${
              status === 'connected' ? 'bg-emerald-500 animate-pulse' : 
              status === 'connecting' ? 'bg-amber-500 animate-pulse' : 
              'bg-red-500'
            }`} />
            {config.label}
          </Badge>

          <Button
            variant='outline'
            size='sm'
            onClick={onRefresh}
            disabled={isLoading}
          >
            <Icons.refresh className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className='hidden sm:inline-block'>Refresh</span>
          </Button>

          <Button
            size='sm'
            onClick={onGenerateDemo}
            disabled={isGenerating}
          >
            <Icons.plus className='h-4 w-4' />
            <span className='hidden sm:inline-block'>
              {isGenerating ? 'Generating...' : 'Demo Calls'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
