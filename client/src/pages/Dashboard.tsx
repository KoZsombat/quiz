import { useEffect, useState } from 'react';
import Alert from '../components/Alert.tsx';
import { Link } from 'react-router-dom';
import useCheckLogin from '../scripts/useCheckLogin.ts';
import type { Quiz } from '../types/types.ts';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [emailInput, setEmailInput] = useState<string>('');

  const { logged, username } = useCheckLogin();
  const normalizedUsername = (username ?? '').replace(/"/g, '');

  useEffect(() => {
    if (!logged || !username) {
      window.location.href = '/';
      return;
    }
  }, [logged, username]);

  const onlyCodes = (data: Quiz[]) =>
    data.reduce(
      (acc, curr) => {
        const name = curr.code;
        if (!acc[name]) {
          acc[name] = [];
        }
        return acc;
      },
      {} as Record<string, Quiz[]>,
    );

  const deleteQuiz = (code: string) => {
    fetch(
      `${apiUrl}/quizzes/${encodeURIComponent(code)}?author=${encodeURIComponent(
        normalizedUsername,
      )}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) {
          setAlertMsg(data.message || 'Failed to delete quiz');
          return;
        }
        setQuizzes((prev) => prev.filter((quiz) => quiz.code !== code));
        setAlertMsg('Quiz deleted successfully');
      })
      .catch((err) => setAlertMsg('Failed to delete quiz: ' + err.message));
  };

  useEffect(() => {
    if (!logged || !username) {
      window.location.href = '/';
      return;
    }
    fetch(
      `${apiUrl}/quizzes?author=${encodeURIComponent(normalizedUsername)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) {
          setAlertMsg(data.message || 'Failed to load user data');
          return;
        }
        const filteredQuizzes = data.quizzes.filter(
          (quiz: Quiz) => quiz.author === normalizedUsername,
        );
        setQuizzes(filteredQuizzes);
      })
      .catch((err) => setAlertMsg('Failed to load user data: ' + err.message));

    fetch(
      `${apiUrl}/users/${encodeURIComponent((username ?? '').replace(/"/g, ''))}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
      },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) {
          setAlertMsg(data.message || 'Failed to load user data');
          return;
        }
        setEmailInput(data.user.email);
        setUsernameInput(data.user.username);
      })
      .catch((err) => setAlertMsg('Failed to load user data: ' + err.message));
  }, [logged, normalizedUsername, username, apiUrl]);

  const savePersonalData = () => {
    fetch(
      `${apiUrl}/users/${encodeURIComponent((username ?? '').replace(/"/g, ''))}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify({
          newUsername: usernameInput,
          newEmail: emailInput,
        }),
      },
    )
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) {
          setAlertMsg(data.message || 'Failed to update user data');
          return;
        }
        setAlertMsg('User data updated successfully');
      })
      .catch((err) =>
        setAlertMsg('Failed to update user data: ' + err.message),
      );
  };

  if (!logged) {
    window.location.href = '/';
    return null;
  }

  return (
    <>
      {alertMsg && <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />}
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-100 via-blue-50 to-white text-slate-800">
        <main className="flex-grow flex items-start justify-center py-10 px-4 sm:px-6">
          <div className="w-full max-w-4xl bg-white/95 rounded-3xl shadow-xl border border-sky-100 p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-sky-800 tracking-tight">
                Dashboard
              </h1>
              <Link
                to="/"
                className="bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 px-4 py-2 h-full rounded-lg transition font-semibold"
              >
                Home
              </Link>
            </div>

            <div className="space-y-8">
              <section className="bg-sky-50/70 border border-sky-100 rounded-2xl p-5 sm:p-6">
                <h2 className="text-xl font-bold text-sky-800 mb-4">
                  Personal data
                </h2>

                <div className="space-y-3">
                  <div className="bg-white border border-sky-100 rounded-xl p-4 flex items-center gap-3">
                    <h3 className="text-base font-bold text-sky-900 min-w-24">
                      Username
                    </h3>
                    <div className="ml-auto flex items-center gap-2 w-full max-w-md">
                      <input
                        className="w-full text-sky-900 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                      />
                      <button onClick={savePersonalData} className="bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 px-4 py-2 rounded-lg transition font-semibold">
                        Save
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-sky-100 rounded-xl p-4 flex items-center gap-3">
                    <h3 className="text-base font-bold text-sky-900 min-w-24">
                      Email
                    </h3>
                    <div className="ml-auto flex items-center gap-2 w-full max-w-md">
                      <input
                        className="w-full text-sky-900 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                      <button onClick={savePersonalData} className="bg-white border border-sky-200 text-sky-800 hover:bg-sky-50 px-4 py-2 rounded-lg transition font-semibold">
                        Save
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  className="mt-4 bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 rounded-lg transition font-semibold"
                  onClick={savePersonalData}
                >
                  Save all changes
                </button>
              </section>

              <section>
                <h2 className="text-xl font-bold text-sky-800 mb-3">
                  Quiz List
                </h2>
                {quizzes.length === 0 ? (
                  <div className="text-sky-600 bg-sky-50 border border-sky-100 rounded-xl p-4">
                    No quizzes found.
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {Object.keys(onlyCodes(quizzes)).map((name: string) => (
                      <li
                        key={name}
                        className="bg-white border border-sky-100 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
                      >
                        <h3 className="text-base font-bold text-sky-900">
                          {name}
                        </h3>
                        <div className="ml-auto flex gap-2">
                          <Link
                            to={`/edit/${name}`}
                            className="bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 px-4 py-2 rounded-lg transition font-semibold"
                          >
                            Edit
                          </Link>
                          <button
                            className="bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 px-4 py-2 rounded-lg transition font-semibold"
                            onClick={() => deleteQuiz(name)}
                          >
                            Delete
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        </main>

        <footer className="text-center py-6 text-slate-500 text-sm bg-sky-50 border-t border-sky-100">
          � {new Date().getFullYear()} QuizParty � Made by{' '}
          <a
            className="text-sky-700 cursor-pointer font-bold"
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
