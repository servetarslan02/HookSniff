'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';

interface Tab {
 label: string;
 code: string;
}

export default function SdkTabs({ tabs }: { tabs: Tab[] }) {
 const t = useTranslations('common');
 const [active, setActive] = useState(0);
 const [copied, setCopied] = useState(false);

 const handleCopy = async () => {
  await navigator.clipboard.writeText(tabs[active].code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
 };

 return (
  <div className="rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
   <div className="flex items-center overflow-x-auto border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
    {tabs.map((tab, i) => (
     <button
      key={tab.label}
      onClick={() => { setActive(i); setCopied(false); }}
      className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 ${
       i === active
        ? 'text-brand-700 dark:text-brand-400 border-b-2 border-brand-500 bg-white dark:bg-slate-900'
        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
      }`}
     >
      {tab.label}
     </button>
    ))}
    <div className="flex-1 min-w-2" />
    <button
     onClick={handleCopy}
     className="mr-2 px-2 py-1 text-xs font-medium rounded-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
    >
     {copied ? <><Check size={14} strokeWidth={1.75} className="inline mr-0.5" />{t('copied')}</> : t('copy')}
    </button>
   </div>
   <pre className="bg-gray-900 text-green-400 p-4 text-sm font-mono overflow-x-auto m-0">
    <code>{tabs[active].code}</code>
   </pre>
  </div>
 );
}
