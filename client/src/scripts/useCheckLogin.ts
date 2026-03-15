import { useEffect, useState } from 'react';
import Socket from './useSocket.ts';

const decodeUsername = (value: string | null): string | null => {
  if (!value) return null;

  try {
    // JWT format: header.payload.signature
    const [, payload] = value.split('.');
    if (!payload) return value.replace(/"/g, '');
    const decodedPayload = JSON.parse(atob(payload));
    const name = decodedPayload?.name;
    if (typeof name === 'string') {
      return name.replace(/"/g, '');
    }
    return value.replace(/"/g, '');
  } catch {
    return value.replace(/"/g, '');
  }
};

function useCheckLogin() {
  const [username, setUsername] = useState<string | null>(
    decodeUsername(localStorage.getItem('user')),
  );
  const socket = Socket;

  useEffect(() => {
    const token = localStorage.getItem('user');
    if (!token) {
      setUsername(null);
      return;
    }

    socket.emit('verifyAdmin', { name: token });
    const handler = (name: string) => setUsername(decodeUsername(name));
    socket.on('adminVerified', handler);

    return () => {
      socket.off('adminVerified', handler);
    };
  }, [socket]);

  const logged = !!username;

  return { logged, username };
}

export default useCheckLogin;
