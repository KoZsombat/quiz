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
                window.location.href = `/join/${data.url}`
            } else {
                console.error('Failed to start quiz');
            }
        } catch (e) {
            console.error('Error starting quiz', e);
        }
    };

    if (quizzes.length === 0) {
        return <div>Loading...</div>;
    }

    if (loggedIn) {
        return (
            <>
            <select value={view} onChange={(e) => setView(e.target.value as 'pub' | 'own')}>
                <option value="pub">Public Quizzes</option>
                <option value="own">Your Quizzes</option>
            </select>
            {view === 'pub' ? (
                <div>
                    <h2>Public Quizzes</h2>
                    {pub.map((quiz: any, idx) => (
                        <div key={idx}>
                            <h3>{quiz.code}</h3>
                            <p>Author: {quiz.code}</p>
                            <button onClick={() => StartQuiz(quiz.code)}>Start</button>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>Your Quizzes</h2>
                    {own.map((quiz: any, idx) => (
                        <div key={idx}>
                            <h3>{quiz.code}</h3>
                            <p>Author: {quiz.code}</p>
                            <button onClick={() => StartQuiz(quiz.code)}>Start</button>
                        </div>
                    ))}
                </div>
            )}
            </>
        )
    } else {
        window.location.href = '/';
    }
}

export default App