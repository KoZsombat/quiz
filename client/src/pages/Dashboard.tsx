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
    fetch(`${apiUrl}/deleteQuiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, author: username }),
    })
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
    fetch(`${apiUrl}/getQuizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author: username }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!data.success) {
          setAlertMsg(data.message || 'Failed to load user data');
          return;
        }
        const quizzes = data.quizzes.filter(
          (quiz: Quiz) => quiz.author === username,
        );
        setQuizzes(quizzes);
      })
      .catch((err) => setAlertMsg('Failed to load user data: ' + err.message));

    fetch(`${apiUrl}/getUserData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    })
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
  }, [logged, username, apiUrl]);

  const savePersonalData = () => {
    fetch(`${apiUrl}/updateUserData`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldUsername: username,
        newUsername: usernameInput,
        email: emailInput,
      }),
    })
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
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-100 via-white to-blue-50">
        <main className="flex-grow flex items-start justify-center py-12 px-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
            <div className="flex justify-between">
              <h1 className="text-3xl font-extrabold text-blue-700 text-center mb-8">
                Dashboard
              </h1>
              <Link
                to="/"
                className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 h-full rounded-lg transition font-semibold"
              >
                Home
              </Link>
            </div>

            <div className="mb-6">
              <div className="mb-4">
                <h2 className="text-xl font-bold text-blue-700 mb-2">
                  Personal data
                </h2>
                <li className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center mb-4">
                  <h3 className="text-lg font-bold text-blue-800">Username</h3>
                  <div className="ml-auto flex space-x-2">
                    <input
                      className="ml-auto text-blue-600"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                    />
                    <button className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-semibold">
                      Save
                    </button>
                  </div>
                </li>
                <li className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center">
                  <h3 className="text-lg font-bold text-blue-800">Email</h3>
                  <div className="ml-auto flex space-x-2">
                    <input
                      className="ml-auto text-blue-600"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <button className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-semibold">
                      Save
                    </button>
                  </div>
                </li>
                <button
                  className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-semibold"
                  onClick={savePersonalData}
                >
                  Save
                </button>
              </div>
              <h2 className="text-xl font-bold text-blue-700 mb-2">
                Quiz List
              </h2>
              {quizzes.length === 0 ? (
                <div className="text-blue-500">No quizzes found.</div>
              ) : (
                <ul className="space-y-4">
                  {Object.keys(onlyCodes(quizzes)).map((name: string) => (
                    <li
                      key={name}
                      className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center"
                    >
                      <h3 className="text-lg font-bold text-blue-800 mb-2">
                        {name}
                      </h3>
                      <div className="ml-auto flex space-x-2">
                        <Link
                          to={`/edit/${name}`}
                          className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-semibold"
                        >
                          Edit
                        </Link>
                        <button
                          className="bg-blue-50 border border-blue-200 text-blue-800 hover:bg-blue-100 px-4 py-2 rounded-lg transition font-semibold"
                          onClick={() => deleteQuiz(name)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
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
