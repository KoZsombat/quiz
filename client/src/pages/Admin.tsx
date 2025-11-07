import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Link } from 'react-router-dom'
import Socket from '../scripts/useSocket.ts'

function App() {
    const socket = Socket;

    interface Users {
        roomId: string;
        userId: string;
        username: string;
        score: number;
    }

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
    })

    const Start = () =>{
        socket.emit("startRoom", JSON.stringify(quizId))
    }

    const Next = () =>{
        socket.emit("nextTrigger", JSON.stringify(quizId))
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-50">
            <main className="flex-grow flex items-start justify-center py-12 px-4">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className='flex justify-between w-full'>
                        <h2 className="text-2xl font-extrabold text-blue-700 flex items-center">Quiz Lobby</h2>
                        <p className="text-gray-500 font-medium flex items-center">
                            ID: <span className="text-blue-700 font-semibold cursor-pointer" onClick={() => quizId && navigator.clipboard.writeText(quizId)}>{quizId} 📋</span>
                        </p>
                        <Link
                            to="/"
                            className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 h-full rounded-lg transition font-semibold"
                        >
                            Home
                        </Link>
                    </div>
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
            </main>
            <footer className="text-center py-6 text-gray-500 text-sm bg-blue-50 border-t border-blue-100">
                © {new Date().getFullYear()} QuizParty — Made with 💙 for fun learning
            </footer>
        </div>
    )
}

export default App
