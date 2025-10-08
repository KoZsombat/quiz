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
        socket.emit("adminCon", { quizId: JSON.stringify(quizId), auth: localStorage.getItem("user")})
    }, [])

    socket.on("joinError", () => {
        window.location.href = `/`
    })

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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
            <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-blue-700">Quiz Lobby</h2>
            <p className="text-gray-500 font-medium">
                ID: <span className="text-blue-700 font-semibold">{quizId}</span>
            </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-center shadow-sm">
            <p className="text-lg font-semibold text-blue-800 mb-4">
                👥 Players Joined: <span className="text-blue-700 font-bold">{users}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                onClick={() => Start()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow transition"
                >
                Start Quiz
                </button>
                <button
                onClick={() => Next()}
                className="bg-white border-2 border-blue-600 hover:bg-blue-50 text-blue-700 px-6 py-3 rounded-lg font-semibold transition"
                >
                Next Question
                </button>
            </div>
            </div>

            <div className="bg-white/80 rounded-xl border border-blue-100 shadow-inner p-6">
            <h3 className="text-xl font-bold text-blue-700 mb-4 text-center">
                🏆 Leaderboard
            </h3>

            <div className="divide-y divide-blue-100">
                {userList
                .sort((a, b) => b.score - a.score)
                .map((p, index) => (
                    <div
                    key={p.username}
                    className="flex justify-between py-2 px-3 hover:bg-blue-50 rounded-lg transition"
                    >
                    <span className="font-medium text-gray-800">
                        {index + 1}. {p.username}
                    </span>
                    <span className="font-semibold text-blue-700">{p.score} pts</span>
                    </div>
                ))}
            </div>
            </div>
        </div>
    </div>
    </>
    )
}

export default App
