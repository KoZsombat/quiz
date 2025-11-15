import { useState } from 'react';
import { Link } from 'react-router-dom'
import useCheckLogin from '../scripts/useCheckLogin.ts'

function App() {
    const { logged, username } = useCheckLogin();
    const user = username?.replace(/"/g, '');
    const [loggedIn, setLoggedIn] = useState(logged);

    const [joinCode, setJoinCode] = useState("");

    const handleLogout = async () => {
        try {
            await localStorage.removeItem("user");
            setLoggedIn(false)
        } catch (e) {
            console.error("Failed to remove user data", e);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 text-gray-800 font-sans flex flex-col">
        <header className="flex justify-between items-center px-8 py-4 bg-blue-600 text-white shadow-md">
            <h1 className="text-2xl font-extrabold tracking-tight">QuizParty</h1>
            {loggedIn ? (
            <div className="flex gap-4 items-center">
                <span className="hidden sm:block font-medium text-white/90">{user}</span>
                <button
                onClick={handleLogout}
                className="bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded-full transition font-semibold cursor-pointer"
                >
                Logout
                </button>
            </div>
            ) : (
            <Link
                to="/login"
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full transition font-semibold cursor-pointer"
            >
                Login
            </Link>
            )}
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-10 text-center border border-blue-100">
            {loggedIn ? (
                <>
                <h2 className="text-4xl font-extrabold mb-3 text-blue-700">Welcome, {user}!</h2>
                <p className="text-gray-600 mb-10 text-lg">
                    Ready to host or join a quiz? Let's make learning fun!
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center pb-5">
                    <input 
                    className="w-120 px-6 py-4 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    type="text" 
                    value={joinCode} 
                    onChange={(e) => setJoinCode(e.target.value)} 
                    placeholder='Enter code'/>
                    <Link
                    to={joinCode ? `/join/${joinCode}` : '#'}
                    className={` flex-1 bg-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-md hover:bg-green-700 transition-all ${!joinCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Join Room
                    </Link>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                    <Link
                    to="/create"
                    className="flex-1 bg-blue-600 text-white font-bold px-6 py-4 rounded-xl shadow-md hover:bg-blue-700 transition-all"
                    >
                    Create Quiz
                    </Link>
                    <Link
                    to="/host"
                    className="flex-1 border-2 border-blue-600 text-blue-700 font-bold px-6 py-4 rounded-xl hover:bg-blue-50 transition-all"
                    >
                    Host Quiz
                    </Link>
                </div>
                </>
            ) : (
                <>
                <h2 className="text-4xl font-extrabold mb-3 text-blue-700">Welcome to QuizParty!</h2>
                <p className="text-gray-600 mb-10 text-lg">
                    Please log in to create or host quizzes with your friends.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center pb-5">
                    <input 
                    className="w-120 px-6 py-4 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    type="text" 
                    value={joinCode} 
                    onChange={(e) => setJoinCode(e.target.value)} 
                    placeholder='Enter code'/>
                    <Link
                    to={joinCode ? `/join/${joinCode}` : '#'}
                    className={` flex-1 bg-green-600 text-white font-bold px-6 py-4 rounded-xl shadow-md hover:bg-green-700 transition-all ${!joinCode ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Join Room
                    </Link>
                </div>
                </>
            )}
            </div>
        </main>

        <footer className="text-center py-6 text-gray-500 text-sm bg-blue-50 border-t border-blue-100">
            © {new Date().getFullYear()} QuizParty — Made by <a className="text-blue-700 cursor-pointer font-bold" target='_blank' href='https://github.com/KoZsombat?'> Zsombor</a>
        </footer>
        </div>
    );
}

export default App