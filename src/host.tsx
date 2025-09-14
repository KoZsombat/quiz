import { useEffect, useState } from 'react';
import useCheckLogin from './scripts/useCheckLogin.ts'

function App() {
    const { logged, username } = useCheckLogin();
    const [user] = useState<string | null>(username);
    const [loggedIn] = useState(logged);

    useEffect(() => {
        if (user) {
            fetchQuizzes();
        }
    }, [user]);

    const fetchQuizzes = async () => {
        try {
            const response = await fetch(`/api/getQuizzes`, { //összes public és user quiz lekerese
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ author: user })
            });
            const data = await response.json();
            if (data.success) {
                console.log(data.quizzes); // tarolni a quizeket egy state-ben
            } else {
                console.error('Failed to fetch quizzes');
            }
        } catch (e) {
            console.error('Error fetching quizzes', e);
        }
    };

    if (loggedIn) {
        return (
            <>
            </>
        )
    } else {
        window.location.href = '/';
    }
}

export default App