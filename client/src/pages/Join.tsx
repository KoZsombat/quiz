import { useRef, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Alert from '../components/Alert.tsx'
import Socket from '../scripts/useSocket.ts'

function App() {
    const socket = Socket;
    const { quizId } = useParams();
    const username = useRef<string | null>(localStorage.getItem("username"));
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const btn = useRef<HTMLButtonElement>(null)

    useEffect(() => {
      if (errorMsg != null){
        setTimeout(() => {
          setErrorMsg(null)
        }, 3000);
      }
    }, [errorMsg]);

    const isRoomAvailable = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/isQuizCodeAvailable`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: quizId }),
            });

            if (!response.ok) {
                window.location.href = `/`;
                return;
            }

            const data = await response.json();
            if (!data.success || !data.available) {
                window.location.href = `/`;
            }
        } catch (err) {
            window.location.href = `/`;
        }
    };

    useEffect(() => {
        isRoomAvailable();
    }, [])

    const readyUp = () => {
        setErrorMsg(null)
        socket.emit('joinRoom', { roomId: JSON.stringify(quizId), name: username.current });
        if (username.current) {
            localStorage.setItem("username", username.current);
        }
        if (btn.current) {
            btn.current.setAttribute("disabled", "true")
        }
    }

    socket.on('startQuiz', () => {
        if (localStorage.getItem("username") != null) {
            window.location.href = `/quiz/${quizId}`
        }
    })

    socket.on("nameExist", () => {
        setErrorMsg("Name already exist!")
        localStorage.removeItem("username")
        if (btn.current) {
            btn.current.removeAttribute("disabled")
        }
    })

    return (
    <>
    <div className="flex-1 w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
            {errorMsg && <Alert error={errorMsg} />}

            <p className="text-center text-sm text-gray-500 mb-6">
            Quiz ID: <span className="font-semibold text-blue-700">{quizId}</span>
            </p>

            <h2 className="text-2xl font-extrabold text-blue-700 text-center mb-6">
            Join the Quiz
            </h2>

            <div className="flex flex-col items-center">
            <input
                type="text"
                placeholder="Enter your username"
                defaultValue={username.current ? username.current : ''}
                onChange={(e) => (username.current = e.target.value)}
                className="w-full border border-blue-200 rounded-lg px-4 py-3 mb-5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            />

            <button
                ref={btn}
                onClick={readyUp}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all"
            >
                Ready Up
            </button>
            </div>
        </div>
    </div>
    </>
    )
}

export default App
