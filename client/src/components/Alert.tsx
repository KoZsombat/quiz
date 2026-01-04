import './Alert.css';
import { useState, useEffect } from 'react';

export default function Alert({
  error,
  onClose,
}: {
  error: string;
  onClose: () => void;
}) {
  const [animation, setAnimation] = useState('animate-slideDown');

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimation('animate-slideUp');

      setTimeout(() => onClose(), 400);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const msg = error || 'An unexpected error occurred. Please try again later.';

  return (
    <div className="flex justify-center items-start w-full fixed top-4 right-0 z-50 px-4">
      <div
        className={`bg-blue-100 border border-blue-400 text-blue-800 px-6 py-4 rounded-lg shadow-md max-w-lg w-full ${animation}`}
        role="alert"
      >
        <p className="font-bold text-blue-700 mb-1">Notice</p>
        <p className="text-blue-800">{msg}</p>
      </div>
    </div>
  );
}
