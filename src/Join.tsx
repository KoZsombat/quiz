import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Alert from './Alert'

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
    <div className="flex-1 w-full items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
    <div className='container mx-auto p-4'>
        {errorMsg && <Alert error={errorMsg} /> }
        <p>{quizId}</p>
        <div className="p-4 border rounded mb-4">
            <input type="text" placeholder='Username' defaultValue={username.current ? username.current : ""} onChange={(e) => username.current = e.target.value}/>
            <button ref={btn} onClick={readyUp}>Ready</button>
        </div>
    </div>
    </div>
    </>
    )
}

export default App
