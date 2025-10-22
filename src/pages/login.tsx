import { useState } from 'react';
import Alert from '../components/Alert.tsx'

function App() {
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
            const response = await fetch(`http://localhost:3000/api/login`, {
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
                console.log(error)
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
                const response = await fetch(`http://localhost:3000/api/register`, {
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
    <>
    {
        <div className="flex-1 w-full items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
          {errorMsg && <Alert error={errorMsg} />}
          <div className='flex items-center text-center justify-center'>
            <div className="w-11/12 max-w-md bg-white/90 rounded-3xl shadow-2xl items-center justify-center m-5 p-8">
                <div className="flex-row justify-center mb-6">
                <button
                    className={`rounded-xl px-6 py-3 mx-2 ${showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowLogin(true)}
                >
                    Login
                </button>
                <button
                    className={`rounded-xl px-6 py-3 mx-2 ${!showLogin ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setShowLogin(false)}
                >
                    Register
                </button>
                </div>

                {showLogin ? (
                <div className="m-2 p-2 items-center justify-center z-10">
                    <p className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</p>
                    <input
                    className="bg-gray-100 rounded-xl h-12 w-max md:w-72 m-2 p-3 text-base mb-2 border border-gray-200 text-center"
                    placeholder="Username"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    autoCapitalize="none"
                    />
                    <input
                    className="bg-gray-100 rounded-xl h-12 w-max md:w-72 m-2 p-3 text-base mb-2 border border-gray-200 text-center"
                    placeholder="Password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    />
                    <button className="bg-blue-500 mt-6 p-3 rounded-xl shadow text-white" onClick={handleLogin}>
                    Login
                    </button>
                </div>
                ) : (
                <div className="m-2 p-2 items-center justify-center z-10">
                    <p className="text-3xl font-bold text-gray-800 mb-6 text-center">Register</p>
                    <input
                    className="bg-gray-100 rounded-xl h-12 w-max md:w-72 m-2 p-3 text-base mb-2 border border-gray-200 text-center"
                    placeholder="Username"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    autoCapitalize="none"
                    />
                    <input
                    className="bg-gray-100 rounded-xl h-12 w-max md:w-72 m-2 p-3 text-base mb-2 border border-gray-200 text-center"
                    placeholder="Email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    autoCapitalize="none"
                    />
                    <input
                    className="bg-gray-100 rounded-xl h-12 w-max md:w-72 m-2 p-3 text-base mb-2 border border-gray-200 text-center"
                    placeholder="Password"
                    value={registerPass}
                    onChange={(e) => setRegisterPass(e.target.value)}
                    />
                    <button className="bg-blue-500 mt-6 p-3 rounded-xl shadow text-white" onClick={handleRegister}>
                    Register
                    </button>
                </div>
                )}
            </div>
          </div>
        </div>
    }
    </>
  )
    
}

export default App;