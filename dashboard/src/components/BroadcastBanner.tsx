'use client';

import {useState} from 'react';
import {useRouter} from '@/i18n/navigation';
import {useBroadcasts, useDismissBroadcast} from '@/hooks/useBroadcasts';
import {X, AlertTriangle, AlertCircle, Info, ExternalLink} from '@/components/icons';

const severityConfig: Record<string, {bg: string; border: string; text: string; icon: React.ReactNode}> = {
 critical: {
  bg: 'bg-red-50 dark:bg-red-500/10',
  border: 'border-red-300 dark:border-red-500/40',
  text: 'text-red-800 dark:text-red-300',
  icon: <AlertCircle size={18} strokeWidth={1.75} className="text-red-500 shrink-0" />,
},
 warning: {
  bg: 'bg-amber-50 dark:bg-amber-500/10',
  border: 'border-amber-300 dark:border-amber-500/40',
  text: 'text-amber-800 dark:text-amber-300',
  icon: <AlertTriangle size={18} strokeWidth={1.75} className="text-amber-500 shrink-0" />,
},
 info: {
  bg: 'bg-blue-50 dark:bg-blue-500/10',
  border: 'border-blue-300 dark:border-blue-500/40',
  text: 'text-blue-800 dark:text-blue-300',
  icon: <Info size={18} strokeWidth={1.75} className="text-blue-500 shrink-0" />,
},
};

export function BroadcastBanner() {
 const router = useRouter();
 const {data: broadcasts = []} = useBroadcasts();
 const dismissMutation = useDismissBroadcast();
 const [dismissed, setDismissed] = useState<Set<string>>(new Set());

 const handleDismiss = (id: string) => {
  setDismissed((prev) => new Set(prev).add(id));
  dismissMutation.mutate(id);
 };

 // Filter out dismissed and only show warning/critical as banners
 const visibleBroadcasts = broadcasts.filter(
  (b) => !dismissed.has(b.id) && (b.severity === 'critical' || b.severity === 'warning')
 );

 if (visibleBroadcasts.length === 0) return null;

 return (
  <div className="space-y-2 mb-4">
   {visibleBroadcasts.map((b) => {
    const config = severityConfig[b.severity] || severityConfig.info;
    return (
     <div
      key={b.id}
      className={`${config.bg} ${config.border} border rounded-xl px-4 py-3 flex items-start gap-3 transition-all`}
     >
      {config.icon}
      <div className="flex-1 min-w-0">
       <p className={`text-sm font-semibold ${config.text}`}>
        {b.title}
       </p>
       <p className={`text-xs ${config.text} opacity-80 mt-0.5`}>
        {b.message}
       </p>
       {b.link && (
        <button
         onClick={() => router.push(b.link!)}
         className={`text-xs font-medium ${config.text} underline underline-offset-2 mt-1 hover:opacity-80 transition inline-flex items-center gap-1`}
        >
         {b.link_text || 'Learn more'}
         <ExternalLink size={12} strokeWidth={1.75} />
        </button>
       )}
      </div>
      <button
       onClick={() => handleDismiss(b.id)}
       className={`${config.text} opacity-50 hover:opacity-100 transition shrink-0 p-0.5`}
       aria-label="Dismiss"
      >
       <X size={16} strokeWidth={1.75} />
      </button>
     </div>
    );
})}
  </div>
 );
}

export default BroadcastBanner;
