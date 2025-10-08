import { useEffect, useState } from 'react';
import useCheckLogin from './scripts/useCheckLogin.ts'

function App() {
    const { logged, username } = useCheckLogin();
    const [user] = useState<string | null>(username);
    const [loggedIn] = useState(logged);
    const [quizzes, setQuizzes] = useState<any[]>([]);
    const [view, setView] = useState<'pub' | 'own'>('pub');
    const [pub, setPub] = useState<any[]>([]);
    const [own, setOwn] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            fetchQuizzes();
        }
    }, [user]);

    useEffect(() => {
        if (quizzes.length > 0) {
            const publicQuizzes = quizzes.filter(q => q.visibility === 'public');
            setPub(publicQuizzes);
            const ownQuizzes = quizzes.filter(q => q.author === user);
            setOwn(ownQuizzes);
        }
    }, [quizzes]);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/getQuizzes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: user })
            });
            const data = await response.json();
            if (data.success) {
                setQuizzes(data.quizzes);
            } else {
                console.error('Failed to fetch quizzes');
            }
        } catch (e) {
            console.error('Error fetching quizzes', e);
        }
    };

    const StartQuiz = async (title: string) => {
        try {
            const response = await fetch(`http://localhost:3000/api/startQuiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: title })
            });
            const data = await response.json();
            if (data.success) {
                window.location.href = `/admin/${data.url}`
            } else {
                console.error('Failed to start quiz');
            }
        } catch (e) {
            console.error('Error starting quiz', e);
        }
    };

    if (quizzes.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
            <div className="text-xl font-semibold text-blue-600 animate-pulse">Loading quizzes...</div>
            </div>
        );
    }

    if (loggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center py-10 px-4">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
                <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-8">
                Choose a Quiz
                </h1>

                <div className="flex justify-center mb-6">
                <select
                    value={view}
                    onChange={(e) => setView(e.target.value as 'pub' | 'own')}
                    className="bg-blue-50 border border-blue-200 text-blue-800 font-medium px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
                >
                    <option value="pub">🌍 Public Quizzes</option>
                    <option value="own">👤 Your Quizzes</option>
                </select>
                </div>

                {view === 'pub' ? (
                <div>
                    <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
                    Public Quizzes
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                    {pub.map((quiz: any, idx) => (
                        <div
                        key={idx}
                        className="p-5 border border-blue-100 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                        <h3 className="text-lg font-semibold text-blue-800">
                            {quiz.code}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Author: <span className="font-medium text-blue-700">{quiz.author}</span>
                        </p>
                        <button
                            onClick={() => StartQuiz(quiz.code)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition"
                        >
                            Start
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
                ) : (
                <div>
                    <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
                    Your Quizzes
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                    {own.map((quiz: any, idx) => (
                        <div
                        key={idx}
                        className="p-5 border border-blue-100 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
                        >
                        <h3 className="text-lg font-semibold text-blue-800">
                            {quiz.code}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Author: <span className="font-medium text-blue-700">{quiz.author}</span>
                        </p>
                        <button
                            onClick={() => StartQuiz(quiz.code)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition"
                        >
                            Start
                        </button>
                        </div>
                    ))}
                    </div>
                </div>
                )}
            </div>
            </div>
        );
    } else {
        window.location.href = '/';
    }
}

export default App