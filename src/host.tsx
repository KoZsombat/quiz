import { useState } from 'react';
import useCheckLogin from './scripts/useCheckLogin.ts'

function App() {
    const { logged, username } = useCheckLogin();
    const [user, setUser] = useState<string | null>(username);
    const [loggedIn, setLoggedIn] = useState(logged);

    if (loggedIn) {
        return (
            <>
            </>
        )
    } else {
        window.location.href = '/';
    }
}

export default App