import {useEffect, useState} from 'react'
import useCheckLogin from './scripts/useCheckLogin';

function App() {
    const { username } = useCheckLogin();

    type Question = {
        question: string;
        options: string[];
        answer: string;
    }

    const [createdquietions, setCreatedQuestions] = useState<Question[]>([]);
    const [code, setCode] = useState<string>('');
    const [visibility, setVisibility] = useState<"public" | "private">("public");

    useEffect(() => {
        console.log("Created Questions:", createdquietions);
    }, [createdquietions]);

    const handleDelete = (questionToDelete: string) => {
        setCreatedQuestions((prevQuestions) => 
        prevQuestions.filter(q => q.question !== questionToDelete)
        );
    };

    const handleSaveQuiz = () => {
        if (createdquietions.length === 0) {
            alert("Please add at least one question before saving.");
            return;
        }
        if (code == "") {
            alert("Please enter a room code.");
            return;
        }
        fetch
        ('http://localhost:3000/api/saveQuiz', {
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
                alert("Quiz saved successfully!");
            }
        })
        .catch(err => {
            console.error(`Error: ${err.message}`);
        });
    };

  return (
    <>
        <h1 className="text-3xl font-extrabold text-center text-blue-700 p-6">
        Create Quiz
        </h1>

        {createdquietions.map((element) => (
        <div
            key={element.question}
            className="mx-auto p-6 border border-blue-200 rounded-2xl mb-6 flex flex-col gap-4 items-center w-[95vw] lg:w-[400px] bg-blue-50 shadow-sm"
        >
            <h2 className="text-lg font-bold text-blue-800 text-center">{element.question}</h2>
            <div className="grid grid-cols-2 gap-3 mt-2 w-full">
            {element.options.map((option, i) => (
                <span
                key={i}
                className="bg-white border border-blue-100 rounded-lg p-4 text-center shadow-sm"
                >
                {option}
                </span>
            ))}
            </div>
            <p className="mt-2 text-blue-700 font-medium">
            Answer: {element.answer}
            </p>
            <button
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold transition"
            onClick={() => handleDelete(element.question)}
            >
            Delete
            </button>
        </div>
        ))}

        <form
        onSubmit={(e) => {
            e.preventDefault();
            const question = (e.target as HTMLFormElement).question.value;
            const rawOptions = (e.target as HTMLFormElement).options.value.split(',');
            const options = rawOptions.map((opt: string) => opt.trim());
            const answer = (e.target as HTMLFormElement).answer.value;

            if (!question || options.length === 0 || !answer) {
            alert('Please fill in all fields.');
            return;
            }

            if (!options.includes(answer)) {
            alert('Answer must be one of the options.');
            return;
            }

            setCreatedQuestions([
            ...createdquietions,
            { question, options: options.map((opt: string) => opt.trim()), answer },
            ]);
            (e.target as HTMLFormElement).reset();
        }}
        >
        <div className="mx-auto p-6 border border-blue-200 rounded-2xl mb-6 flex flex-col gap-4 items-center w-[95vw] lg:w-[400px] bg-white shadow-sm">
            <input
            className="w-full p-3 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
            type="text"
            name="question"
            placeholder="Question"
            required
            />
            <input
            className="w-full p-3 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
            type="text"
            name="options"
            placeholder="Options (comma separated)"
            required
            />
            <input
            className="w-full p-3 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
            type="text"
            name="answer"
            placeholder="Answer"
            required
            />
            <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            type="submit"
            >
            Add Question
            </button>
        </div>
        </form>

        <div className="mx-auto p-6 border border-blue-200 rounded-2xl mb-6 flex flex-col gap-4 items-center w-[95vw] lg:w-[400px] bg-blue-50 shadow-sm">
        <input
            className="w-full p-3 border border-blue-100 rounded-lg text-center focus:ring-2 focus:ring-blue-400 focus:outline-none"
            type="text"
            placeholder="Room name"
            value={code}
            onChange={(e) => setCode(e.target.value)}
        />
        <div className="w-full flex justify-between items-center p-3 border border-blue-100 rounded-lg bg-white text-gray-700">
            <label htmlFor="public" className="font-medium">Visibility:</label>
            <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
            className="px-3 py-2 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            id="public"
            >
            <option value="public">Public</option>
            <option value="private">Private</option>
            </select>
        </div>
        <button
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition"
            onClick={handleSaveQuiz}
        >
            Save Quiz
        </button>
        </div>
    </>
    );
}

export default App
