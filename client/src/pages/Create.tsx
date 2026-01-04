import { useRef, useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import useCheckLogin from '../scripts/useCheckLogin';
import Alert from '../components/Alert.tsx';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  const { code: editCode } = useParams();
  const { logged, username } = useCheckLogin();

  useEffect(() => {
    if (!logged || !username) {
      window.location.href = '/';
      return;
    }
  }, [logged, username]);

  type Question = {
    question: string;
    timer: number;
    options: string[];
    answer: string;
  };

  const [createdquietions, setCreatedQuestions] = useState<Question[]>([]);
  const [code, setCode] = useState<string>('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const isEditMode = !!editCode;

  useEffect(() => {
    if (isEditMode && editCode) {
      fetch(`${apiUrl}/getQuizForEdit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: editCode, author: username }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (!data.success) {
            setAlertMsg(data.message || 'Failed to load quiz data');
            return;
          }
          setCode(editCode);
          setCreatedQuestions(
            data.quiz.map((q: Question) => ({
              question: q.question,
              timer: q.timer || 100,
              options: q.options,
              answer: q.answer,
            })),
          );
          setVisibility(data.quiz[0]?.visibility || 'public');
        })
        .catch((err) =>
          setAlertMsg('Failed to load quiz data: ' + err.message),
        );
    }
  }, [isEditMode, editCode, apiUrl, username]);

  const handleDelete = async (questionToDelete: string, idx?: number) => {
    if (!code) {
      setAlertMsg('Please enter a room code before deleting images.');
      return;
    }
    const index =
      typeof idx === 'number'
        ? idx
        : createdquietions.findIndex((q) => q.question === questionToDelete);
    const filename = `${code}_${index}`;
    const response = await fetch(`${apiUrl}/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename }),
    });
    const data = await response.json();
    if (data.error) {
      setAlertMsg(`Failed to delete question image: ${data.error}`);
    }
    setCreatedQuestions((prevQuestions) =>
      prevQuestions.filter((_, i) => i !== index),
    );
  };

  const handleSaveQuiz = () => {
    if (createdquietions.length === 0) {
      setAlertMsg('Please add at least one question before saving.');
      return;
    }
    if (code == '') {
      setAlertMsg('Please enter a room code.');
      return;
    }
    fetch(`${apiUrl}/saveQuiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        array: createdquietions,
        code: code,
        author: username,
        visibility: visibility,
      }),
    })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'Network response was not ok');
        } else {
          setCreatedQuestions([]);
          setAlertMsg('Quiz saved successfully!');
        }
      })
      .catch((err) => {
        setAlertMsg(`Failed to save quiz: ${err.message}`);
      });
  };

  const handleUpdateQuiz = () => {
    if (createdquietions.length === 0) {
      setAlertMsg('Please add at least one question before updating.');
      return;
    }
    fetch(`${apiUrl}/updateQuiz`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        array: createdquietions,
        code: code,
        author: username,
        visibility: visibility,
      }),
    })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok) {
          throw new Error(text || 'Network response was not ok');
        } else {
          setAlertMsg('Quiz updated successfully!');
        }
      })
      .catch((err) => {
        setAlertMsg(`Failed to update quiz: ${err.message}`);
      });
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-start justify-center py-12 px-4">
        <div className="w-full max-w-3xl">
          <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg px-6 py-8 mb-8">
            <div className="flex justify-between">
              <h1 className="text-3xl font-extrabold tracking-tight">
                {isEditMode ? 'Edit Quiz' : 'Create Quiz'}
              </h1>
              <Link
                to="/"
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition font-semibold"
              >
                Home
              </Link>
            </div>
            <p className="mt-2 text-blue-100 max-w-2xl">
              Build engaging quizzes — add questions, choose visibility and
              save.
            </p>
          </header>

          <main className="space-y-6">
            {alertMsg && (
              <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />
            )}

            <section>
              <h2 className="text-lg font-semibold text-blue-700 mb-4">
                Questions ({createdquietions.length})
              </h2>

              <div className="space-y-4">
                {createdquietions.length === 0 && (
                  <div className="text-center text-sm text-blue-500 bg-white border border-blue-100 rounded-xl py-6 shadow-sm">
                    No questions yet. Use the form below to add your first
                    question.
                  </div>
                )}

                {createdquietions.map((element, idx) => (
                  <article
                    key={element.question}
                    className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-md font-semibold text-blue-800">
                          {element.question}
                        </h3>
                        <p className="mt-2 text-sm text-blue-600">
                          Answer:{' '}
                          <span className="font-medium text-blue-800">
                            {element.answer}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100">
                          Options: {element.options.length}
                        </span>
                        <button
                          onClick={() => handleDelete(element.question, idx)}
                          className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md border border-red-100 shadow-sm transition"
                          title="Delete question"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {element.options.map((option, i) => (
                        <div
                          key={i}
                          className="bg-blue-50 text-blue-800 text-sm rounded-lg p-3 border border-blue-100"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const question = (e.target as HTMLFormElement).question.value;
                  const timer = (e.target as HTMLFormElement).timer.value;
                  const rawOptions = (
                    e.target as HTMLFormElement
                  ).options.value.split(',');
                  const options = rawOptions
                    .map((opt: string) => opt.trim())
                    .filter(Boolean);
                  const answer = (e.target as HTMLFormElement).answer.value;

                  if (!question || options.length === 0 || !answer) {
                    setAlertMsg('Please fill in all fields.');
                    return;
                  }

                  if (!options.includes(answer)) {
                    setAlertMsg('Answer must be one of the options.');
                    return;
                  }

                  if (isNaN(Number(timer)) || Number(timer) <= 0) {
                    setAlertMsg('Timer must be a positive number.');
                    return;
                  }

                  if ((e.target as HTMLFormElement).file.files?.length > 0) {
                    if (!code) {
                      setAlertMsg(
                        'Please enter a room code before uploading images.',
                      );
                      return;
                    }
                    if (codeInput.current) {
                      codeInput.current.disabled = true;
                    }
                    const formData = new FormData();
                    formData.append('code', code);
                    formData.append(
                      'index',
                      createdquietions.length.toString(),
                    );
                    formData.append(
                      'image',
                      (e.target as HTMLFormElement).file.files[0],
                    );
                    const response = await fetch(`${apiUrl}/upload`, {
                      method: 'POST',
                      body: formData,
                    });

                    if (!response.ok) {
                      setAlertMsg(
                        `Image upload failed: ${response.status} ${response.statusText}`,
                      );
                      return;
                    }

                    const data = await response.json();
                    if (data.error) {
                      setAlertMsg(`Image upload failed: ${data.error}`);
                    }
                  }

                  setCreatedQuestions([
                    ...createdquietions,
                    {
                      question,
                      timer: Number(timer),
                      options: options.map((opt: string) => opt.trim()),
                      answer,
                    },
                  ]);

                  (e.target as HTMLFormElement).reset();
                }}
                className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm"
              >
                <div className="grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Question
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="text"
                      name="question"
                      placeholder="Type your question"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Timer
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="number"
                      name="timer"
                      placeholder="Timer (seconds)"
                      defaultValue={100}
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Image (if needed)
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="file"
                      name="file"
                      placeholder="Image File"
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Options (comma separated)
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="text"
                      name="options"
                      placeholder="One, Two, Three, Four"
                      required
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Correct answer
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="text"
                      name="answer"
                      placeholder="One of the options"
                      required
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-5 py-3 shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
                      type="submit"
                    >
                      Add Question
                    </button>
                  </div>
                </div>
              </form>
            </section>

            <section>
              <div className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm">
                <div className="grid grid-cols-1 gap-4">
                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Room name
                    </span>
                    <input
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      type="text"
                      placeholder="Room name"
                      ref={codeInput}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      disabled={isEditMode}
                    />
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium text-blue-700">
                      Visibility
                    </span>
                    <select
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(e.target.value as 'public' | 'private')
                      }
                      className="mt-1 block w-full rounded-lg border border-blue-100 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                  </label>

                  <div className="flex justify-end gap-3">
                    <button
                      className="bg-white text-blue-600 border border-blue-100 px-5 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition cursor-pointer"
                      onClick={() => {
                        setCreatedQuestions([]);
                      }}
                      type="button"
                    >
                      Clear
                    </button>
                    <button
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-6 py-3 shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
                      onClick={isEditMode ? handleUpdateQuiz : handleSaveQuiz}
                      type="button"
                    >
                      {isEditMode ? 'Update Quiz' : 'Save Quiz'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
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
    </>
  );
}

export default App;
