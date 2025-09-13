import { useState } from 'react';
import { Link } from 'react-router-dom'
import useCheckLogin from './scripts/useCheckLogin.ts'

function App() {
    const { logged, username } = useCheckLogin();
    const [user, setUser] = useState<string | null>(username);
    const [loggedIn, setLoggedIn] = useState(logged);

    const handleLogout = async () => {
        try {
            await localStorage.removeItem("user");
            setLoggedIn(false)
        } catch (e) {
            console.error("Failed to remove user data", e);
        }
    };

    return (
        <>
        <header className='flex justify-between items-center p-4 bg-neutral-700 text-white'>
            <h1>Quiz App</h1>
            {
                loggedIn ? (
                    <div className='flex gap-4 items-center'>
                        <Link className='bg-neutral-800 px-4 py-2 rounded cursor-pointer' to="/create">Create Quiz</Link>
                        <Link className='bg-neutral-800 px-4 py-2 rounded cursor-pointer' to="/host">Host Quiz</Link>
                        <button className='bg-neutral-900 px-4 py-2 rounded cursor-pointer' onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div className='flex gap-4 items-center'>
                        <Link className='bg-neutral-800 px-4 py-2 rounded cursor-pointer' to="/login">Login</Link>
                    </div>
                )
            }
        </header>
        </>
    )
}

export default App