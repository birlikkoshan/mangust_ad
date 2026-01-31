interface PageLoadingProps {
  className?: string;
}

export default function PageLoading({ className = 'user-container' }: PageLoadingProps) {
  return (
    <div className={className} style={{ padding: '48px 20px', textAlign: 'center' }}>
      <p style={{ color: 'var(--user-text-muted, #666)' }}>Loading...</p>
    </div>
  );
}
