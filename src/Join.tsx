import { useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {
    const socket = io("http://localhost:3000");
    const { quizId } = useParams();
    const [username, setUsername] = useState('');

    const readyUp = () => {
        socket.emit('joinRoom', { quizId, username: 'test' });
    }

    socket.on('startQuiz', () => {
        //window.location.href = `/quiz/${quizId}` 
    })

    return (
    <>
    <div className='container mx-auto p-4'>
        <p>{quizId}</p>
        <div className="p-4 border rounded mb-4">
            <input value={username} type="text" placeholder='Username' onChange={() => setUsername}/>
            <button onClick={readyUp}>Ready</button>
        </div>
    </div>
    </>
    )
}

export default App
