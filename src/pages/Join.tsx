import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Alert from '../components/Alert.tsx'

function App() {
    const socket = io("http://localhost:3000");
    const { quizId } = useParams();
    const username = useRef<string | null>(localStorage.getItem("username"));
    const [errorMsg, seterrorMsg] = useState<string | null>(null);
    const btn = useRef<HTMLButtonElement>(null)

    const readyUp = () => {
        seterrorMsg(null)
        console.log(`id: ${quizId}, name: ${username.current}`)
        socket.emit('joinRoom', { roomId: JSON.stringify(quizId), name: username.current });
        if (username.current) {
            localStorage.setItem("username", username.current);
        }
        if (btn.current) {
            btn.current.setAttribute("disabled", "true")
        }
    }

    socket.on('startQuiz', () => {
        localStorage.getItem("username") != null ? window.location.href = `/quiz/${quizId}` : console.log("no name xd")
    })

    socket.on("nameExist", () => {
        console.log("asd")
        seterrorMsg("Name already exist!")
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
