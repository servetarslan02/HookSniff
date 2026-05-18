'use client';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon = '📭', title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card p-6 sm:p-8 lg:p-12 text-center">
      <div className="text-4xl sm:text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 max-w-md mx-auto">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition btn-ripple"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
