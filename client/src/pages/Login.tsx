import { useState } from 'react';
import Alert from '../components/Alert.tsx'

function App() {
    const apiUrl = import.meta.env.VITE_API_URL;
    const githubUrl = import.meta.env.VITE_GITHUB_URL;
    const [showLogin, setShowLogin] = useState(true);
    const [loginName, setLoginName] = useState('');
    const [loginPass, setLoginPass] = useState('');
    const [registerName, setRegisterName] = useState('');
    const [registerEmail, setRegisterEmail] = useState('');
    const [registerPass, setRegisterPass] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const storeUser = async (user: string) => {
        try {
            await localStorage.setItem("user", JSON.stringify(user));
        } catch (e) {
            console.error("Failed to save user data", e);
        }
    };

    const handleLogin = async () => {
        if (loginName && loginPass) {
                const user = {
                name: loginName,
                password: loginPass,
            };
            try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: { 
                'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            const data = await response.json();
            if (data.response === 1) {
                setShowLogin(false);
                storeUser(user.name);
                setErrorMsg(null);
                window.location.href = '/';
            } else {
                setErrorMsg("Invalid username or password");
            }
            } catch (error) {
                setErrorMsg("Server error. Please try again later.");
            }
        } else {
            setErrorMsg("Please enter valid credentials");
        }
    };

    const validateEmail = (email: string) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleRegister = async () => {
        if (registerName && registerEmail && registerPass.length >= 8) {
            if (!validateEmail(registerEmail)) {
                    setErrorMsg("Please enter a valid email address");
                    return;
                }
                const user = {
                    name: registerName,
                    email: registerEmail,
                    password: registerPass,
                };
                const response = await fetch(`${apiUrl}/register`, {
                    method: 'POST',
                    headers: 
                        { 
                        'Content-Type': 'application/json'
                        },
                    body: JSON.stringify(user)
                });

                let data = null;
                try {
                    const text = await response.text();
                    data = text ? JSON.parse(text) : null;
                } catch (err) {
                    console.error("Invalid JSON from server:", err);
            }

            if (!data) {
                setErrorMsg("Unexpected server response");
                return;
            }

            if (data.response === 0) {
                setErrorMsg("User already exists");
                return;
            } else if (data.response === 1) {
                setRegisterName('');
                setRegisterEmail('');
                setRegisterPass('');
                setShowLogin(true);
            } else {
                setErrorMsg("Registration failed");
                return;
            }
            setShowLogin(true);
        } else {
            setErrorMsg("Please fill in all fields (password must be at least 8 characters)");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center p-6">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500">
            <h2 className="text-white text-xl font-bold">QuizParty</h2>
            <div className="text-white text-sm opacity-90">Learn. Play. Win.</div>
            </div>

            <div className="p-6">
            {errorMsg && <Alert error={errorMsg} onClose={() => setErrorMsg(null)}/>}

            <div className="flex items-center justify-center gap-2 mb-6">
                <button
                onClick={() => setShowLogin(true)}
                className={`px-5 py-2 rounded-xl font-semibold transition cursor-pointer ${
                    showLogin ? 'bg-white text-blue-600 shadow' : 'bg-blue-50 text-blue-500'
                }`}
                >
                Login
                </button>
                <button
                onClick={() => setShowLogin(false)}
                className={`px-5 py-2 rounded-xl font-semibold transition cursor-pointer ${
                    !showLogin ? 'bg-white text-blue-600 shadow' : 'bg-blue-50 text-blue-500'
                }`}
                >
                Register
                </button>
            </div>

            {showLogin ? (
                <div className="space-y-4">
                <input
                    className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Username"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    autoCapitalize="none"
                />
                <input
                    className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Password"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition cursor-pointer"
                >
                    Login
                </button>
                </div>
            ) : (
                <div className="space-y-4">
                <input
                    className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Username"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    autoCapitalize="none"
                />
                <input
                    className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoCapitalize="none"
                />
                <input
                    className="w-full rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="Password (min 8 chars)"
                    type="password"
                    value={registerPass}
                    onChange={(e) => setRegisterPass(e.target.value)}
                />
                <button
                    onClick={handleRegister}
                    className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-3 rounded-xl font-semibold shadow-md hover:from-blue-600 hover:to-blue-700 transition cursor-pointer"
                >
                    Register
                </button>
                </div>
            )}
            </div>

            <div className="px-6 py-4 bg-blue-50 border-t border-blue-100 text-center text-sm text-blue-600">
            © {new Date().getFullYear()} QuizParty — Made by <a className="text-blue-700 cursor-pointer font-bold" target='_blank' href={githubUrl}> Zsombor</a>
            </div>
        </div>
        </div>
    );
    
}

export default App;