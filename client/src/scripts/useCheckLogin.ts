import { useEffect, useState } from 'react';
import Socket from './useSocket.ts';

function useCheckLogin() {
  const [username, setUsername] = useState<string | null>(
    localStorage.getItem('user') || null,
  );
  const socket = Socket;

  useEffect(() => {
    socket.emit('verifyAdmin', { name: username });
    const handler = (name: string) => setUsername(name);
    socket.on('adminVerified', handler);

    return () => {
      socket.off('adminVerified', handler);
    };
  }, [username, socket]);

  const logged = !!username;

  return { logged, username };
}

export default useCheckLogin;
