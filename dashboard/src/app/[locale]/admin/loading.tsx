import LoadingSpinner from '@/components/LoadingSpinner';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}
