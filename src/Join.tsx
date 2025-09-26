import { useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {
    const socket = io("http://localhost:3000");
    const { quizId } = useParams();
    const username = useRef<string>("");

    const readyUp = () => {
        
        console.log(`id: ${quizId}, name: ${username.current}`)
        socket.emit('joinRoom', { roomId: JSON.stringify(quizId), name: username.current });
        localStorage.setItem("username", username.current)
    }

    socket.on('startQuiz', () => {
        window.location.href = `/quiz/${quizId}` 
    })

    return (
    <>
    <div className='container mx-auto p-4'>
        <p>{quizId}</p>
        <div className="p-4 border rounded mb-4">
            <input type="text" placeholder='Username' onChange={(e) => username.current = e.target.value}/>
            <button onClick={readyUp}>Ready</button>
        </div>
    </div>
    </>
    )
}

export default App
