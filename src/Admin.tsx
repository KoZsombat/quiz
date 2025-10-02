import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {

  interface Users {
    roomId: string;
    userId: string;
    username: string;
    score: number;
  }

    const socket = io("http://localhost:3000");
    const { quizId } = useParams();
    const [users, setUsers] = useState("0")
    const [userList, setUserList] = useState<Users[]>([])

    useEffect(() => {
        socket.emit("adminCon", JSON.stringify(quizId))
    }, [])

    socket.on('usersUpdate', (data) => {
        setUsers(data.count)
    })

    socket.on("scoreboardUpdate", (data) => {
        setUserList(data)
        console.log(data)
    })

    const Start = () =>{
        socket.emit("startRoom", JSON.stringify(quizId))
    }

    const Next = () =>{
        socket.emit("nextTrigger", JSON.stringify(quizId))
    }

    return (
    <>
    <div className='container mx-auto p-4'>
        <p>{quizId}</p>
        <div className="p-4 border rounded mb-4">
            <p>User count: {users}</p>
            <button onClick={() => Start()}>Start</button>
            <br />
            <button onClick={() => Next()}>Next</button>
        </div>
        {
            userList.sort((a, b) => b.score - a.score).map(p => {
                return (
                    <p key={p.username}>{p.username}: {p.score}</p>
                )
            })
        }
    </div>
    </>
    )
}

export default App
