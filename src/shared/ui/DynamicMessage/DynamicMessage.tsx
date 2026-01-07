import { useEffect, useState } from 'react';

interface DynamicMessageProps {
  messages: string[];
  interval?: number;
}

export function DynamicMessage({
  messages,
  interval = 3000,
}: DynamicMessageProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, interval);

    return () => clearInterval(timer);
  }, [messages, interval]);

  if (!messages || messages.length === 0) return null;

  return (
    <div className='flex flex-col items-center justify-center p-4'>
      <p
        key={index} // Key change triggers animation
        className='animate-in fade-in slide-in-from-bottom-2 duration-500 text-lg font-medium text-blue-600'
      >
        {messages[index]}
      </p>
    </div>
  );
}
