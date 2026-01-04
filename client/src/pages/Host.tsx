import { useEffect, useState } from 'react';
import Alert from '../components/Alert.tsx';
import { Link } from 'react-router-dom';
import useCheckLogin from '../scripts/useCheckLogin.ts';
import type { Quiz } from '../types/types.ts';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [view, setView] = useState<'pub' | 'own'>('pub');
  const [pub, setPub] = useState<Quiz[]>([]);
  const [own, setOwn] = useState<Quiz[]>([]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const { logged, username } = useCheckLogin();

  useEffect(() => {
    if (!logged || !username) {
      window.location.href = '/';
      return;
    }
  }, [logged, username]);

  useEffect(() => {
    if (username) {
      fetchQuizzes();
    }
  }, [username]);

  useEffect(() => {
    if (quizzes.length > 0) {
      const publicQuizzes = quizzes
        .filter((q) => q.visibility === 'public')
        .filter(
          (q, idx, arr) => arr.findIndex((x) => x.code === q.code) === idx,
        );
      setPub(publicQuizzes);
      const ownQuizzes = quizzes
        .filter((q) => q.author === username)
        .filter(
          (q, idx, arr) => arr.findIndex((x) => x.code === q.code) === idx,
        );
      setOwn(ownQuizzes);
    }
  }, [quizzes]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch(`${apiUrl}/getQuizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: username }),
      });
      const data = await response.json();
      if (data.success) {
        setQuizzes(data.quizzes);
      } else {
        setAlertMsg('Error fetching quizzes.');
      }
    } catch (e) {
      setAlertMsg('Error fetching quizzes.');
      console.error(e);
    }
  };

  const StartQuiz = async (title: string) => {
    try {
      const response = await fetch(`${apiUrl}/startQuiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: title }),
      });
      const data = await response.json();
      if (data.success) {
        window.location.href = `/admin/${data.url}`;
      } else {
        setAlertMsg('Failed to start the quiz.');
      }
    } catch (e) {
      setAlertMsg('Failed to start the quiz.');
      console.error(e);
    }
  };

  if (quizzes.length === 0) {
    return (
      <>
        {alertMsg && (
          <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />
        )}
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
          <div className="text-xl font-semibold text-blue-600 animate-pulse">
            Loading quizzes...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {alertMsg && <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <main className="flex-grow flex items-start justify-center py-12 px-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
            <div className="flex justify-between">
              <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-8">
                Choose a Quiz
              </h1>
              <Link
                to="/"
                className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 h-full rounded-lg transition font-semibold"
              >
                Home
              </Link>
            </div>

            <div className="flex justify-center mb-6">
              <select
                value={view}
                onChange={(e) => setView(e.target.value as 'pub' | 'own')}
                className="bg-blue-50 border border-blue-200 text-blue-800 font-medium px-4 py-2 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none transition cursor-pointer"
              >
                <option value="pub">Public Quizzes</option>
                <option value="own">Your Quizzes</option>
              </select>
            </div>

            {view === 'pub' ? (
              <div>
                <h2 className="text-xl font-bold text-blue-700 mb-4 text-center">
                  Public Quizzes
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pub.map((quiz: Quiz, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-blue-100 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-blue-800">
                        {quiz.code}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Author:{' '}
                        <span className="font-medium text-blue-700">
                          {quiz.author}
                        </span>
                      </p>
                      <button
                        onClick={() => StartQuiz(quiz.code)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition cursor-pointer"
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
                  {own.map((quiz: Quiz, idx) => (
                    <div
                      key={idx}
                      className="p-5 border border-blue-100 bg-blue-50 rounded-xl shadow-sm hover:shadow-md transition-all"
                    >
                      <h3 className="text-lg font-semibold text-blue-800">
                        {quiz.code}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Author:{' '}
                        <span className="font-medium text-blue-700">
                          {quiz.author}
                        </span>
                      </p>
                      <button
                        onClick={() => StartQuiz(quiz.code)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg w-full font-semibold transition cursor-pointer"
                      >
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
        <footer className="text-center py-6 text-gray-500 text-sm bg-blue-50 border-t border-blue-100">
          © {new Date().getFullYear()} QuizParty — Made by{' '}
          <a
            className="text-blue-700 cursor-pointer font-bold"
            target="_blank"
            href={githubUrl}
          >
            {' '}
            Zsombor
          </a>
        </footer>
      </div>
    </>
  );
}

export default App;
