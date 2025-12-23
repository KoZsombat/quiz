import {useState} from 'react'
import { Link } from 'react-router-dom'
import useCheckLogin from '../scripts/useCheckLogin';
import Alert from '../components/Alert.tsx'

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
    const { username } = useCheckLogin();

    type Question = {
        question: string;
        options: string[];
        answer: string;
    }

    const [createdquietions, setCreatedQuestions] = useState<Question[]>([]);
    const [code, setCode] = useState<string>('');
    const [visibility, setVisibility] = useState<"public" | "private">("public");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const handleDelete = (questionToDelete: string) => {
        setCreatedQuestions((prevQuestions) => 
        prevQuestions.filter(q => q.question !== questionToDelete)
        );
    };

    const handleSaveQuiz = () => {
        if (createdquietions.length === 0) {
            setErrorMsg("Please add at least one question before saving.");
            return;
        }
        if (code == "") {
            setErrorMsg("Please enter a room code.");
            return;
        }
        fetch (`${apiUrl}/saveQuiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ array: createdquietions, code: code, author: username, visibility: visibility}),
        })
        .then(async response => {
            const text = await response.text();
            if (!response.ok) {
                throw new Error(text || 'Network response was not ok');
            } else {
                setCreatedQuestions([]);
                setErrorMsg("Quiz saved successfully!");
            }
        })
        .catch(err => {
            setErrorMsg(`Failed to save quiz: ${err.message}`);
        });
    };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <header className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl shadow-lg px-6 py-8 mb-8">
          <div className='flex justify-between'>
            <h1 className="text-3xl font-extrabold tracking-tight">Create Quiz</h1>
            <Link
                to="/"
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition font-semibold"
            >
                Home
            </Link>
          </div>
          <p className="mt-2 text-blue-100 max-w-2xl">Build engaging quizzes — add questions, choose visibility and save.</p>
        </header>

        <main className="space-y-6">
          {errorMsg && <Alert error={errorMsg} onClose={() => setErrorMsg(null)}/>}

          <section>
            <h2 className="text-lg font-semibold text-blue-700 mb-4">Questions ({createdquietions.length})</h2>

            <div className="space-y-4">
              {createdquietions.length === 0 && (
                <div className="text-center text-sm text-blue-500 bg-white border border-blue-100 rounded-xl py-6 shadow-sm">
                  No questions yet. Use the form below to add your first question.
                </div>
              )}

              {createdquietions.map((element) => (
                <article
                  key={element.question}
                  className="bg-white border border-blue-100 rounded-lg p-4 shadow-sm flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-md font-semibold text-blue-800">{element.question}</h3>
                      <p className="mt-2 text-sm text-blue-600">Answer: <span className="font-medium text-blue-800">{element.answer}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100">Options: {element.options.length}</span>
                      <button
                        onClick={() => handleDelete(element.question)}
                        className="text-red-600 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-md border border-red-100 shadow-sm transition"
                        title="Delete question"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {element.options.map((option, i) => (
                      <div key={i} className="bg-blue-50 text-blue-800 text-sm rounded-lg p-3 border border-blue-100">
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
              onSubmit={(e) => {
                  e.preventDefault();
                  const question = (e.target as HTMLFormElement).question.value;
                  const rawOptions = (e.target as HTMLFormElement).options.value.split(',');
                  const options = rawOptions.map((opt: string) => opt.trim()).filter(Boolean);
                  const answer = (e.target as HTMLFormElement).answer.value;

                  if (!question || options.length === 0 || !answer) {
                  setErrorMsg('Please fill in all fields.');
                  return;
                  }

                  if (!options.includes(answer)) {
                  setErrorMsg('Answer must be one of the options.');
                  return;
                  }

                  setCreatedQuestions([
                  ...createdquietions,
                  { question, options: options.map((opt: string) => opt.trim()), answer },
                  ]);
                  (e.target as HTMLFormElement).reset();
              }}
              className="bg-white border border-blue-100 rounded-xl p-6 shadow-sm"
            >
              <div className="grid grid-cols-1 gap-4">
                <label className="block">
                  <span className="text-sm font-medium text-blue-700">Question</span>
                  <input
                    className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="text"
                    name="question"
                    placeholder="Type your question"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-blue-700">Options (comma separated)</span>
                  <input
                    className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="text"
                    name="options"
                    placeholder="One, Two, Three, Four"
                    required
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-blue-700">Correct answer</span>
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
                  <span className="text-sm font-medium text-blue-700">Room name</span>
                  <input
                    className="mt-1 block w-full rounded-lg border border-blue-100 bg-gray-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    type="text"
                    placeholder="Room name"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-blue-700">Visibility</span>
                  <select
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                    className="mt-1 block w-full rounded-lg border border-blue-100 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </label>

                <div className="flex justify-end gap-3">
                  <button
                    className="bg-white text-blue-600 border border-blue-100 px-5 py-2 rounded-lg shadow-sm hover:bg-blue-50 transition cursor-pointer"
                    onClick={() => { setCreatedQuestions([]); }}
                    type="button"
                  >
                    Clear
                  </button>
                  <button
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg px-6 py-3 shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
                    onClick={handleSaveQuiz}
                    type="button"
                  >
                    Save Quiz
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
    <footer className="text-center py-6 text-gray-500 text-sm bg-blue-50 border-t border-blue-100">
        © {new Date().getFullYear()} QuizParty — Made by <a className="text-blue-700 cursor-pointer font-bold" target='_blank' href={githubUrl}> Zsombor</a>
    </footer>
    </>
  );
}

export default App
