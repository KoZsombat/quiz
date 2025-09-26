import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {
    const socket = io("http://localhost:3000");
    const { quizId } = useParams();
    const [users, setUsers] = useState("0")

    useEffect(() => {
        socket.emit("adminCon", JSON.stringify(quizId))
    }, [])

    socket.on('usersUpdate', (data) => {
        setUsers(data.count)
    })

    const Start = () =>{
        socket.emit("startRoom", JSON.stringify(quizId))
    }

    return (
    <>
    <div className='container mx-auto p-4'>
        <p>{quizId}</p>
        <div className="p-4 border rounded mb-4">
            <p>User count: {users}</p>
            <button onClick={() => Start()}>Start</button>
        </div>
    </div>
    </>
    )
}

export default App
