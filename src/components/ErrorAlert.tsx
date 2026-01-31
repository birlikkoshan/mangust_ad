interface ErrorAlertProps {
  message: string;
  className?: string;
}

export default function ErrorAlert({ message, className = 'user-alert-error' }: ErrorAlertProps) {
  return <div className={className}>{message}</div>;
}
