import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ScoreBoard from './Scoreboard.tsx'

function App() {
  const socket = io("http://localhost:3000");
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)
  const questionsRef = useRef<Question[]>([]);
  const [userList, setUserList] = useState<Users[]>([]);
  const div = useRef<HTMLDivElement>(null);
  const correct = useRef<HTMLButtonElement | null>(null);

  interface Users {
    roomId: string;
    userId: string;
    username: string;
    score: number;
  }

  interface Question {
    question: string;
    options: string[];
    answer: string;
  }

  const [questions, setQuestions] = useState<Question[]>([]);

    useEffect(() => { questionsRef.current = questions }, [questions]);

    useEffect(() => {
        socket.emit("broadcastCon", { quizId: JSON.stringify(quizId)})
    }, [])

    useEffect(() => {
    socket.emit("getQuiestions", quizId)
    }, [])

  socket.on("sendQuestions", (data) => {
    if (Array.isArray(data) && data.every(q => q.question && q.options && q.answer)) {
      setQuestions(data)
    } else {
      console.error("Invalid data format:", data);
    }
  });

  socket.on("scoreboardUpdate", (data: Users[]) => {
    setUserList(data);
  });

  useEffect(() => {
    console.log(questions)
  }, [questions])

  useEffect(() => {
    const nextHandler = async (index: number) => {
      console.log(`${index}`)
      const qs = questionsRef.current;
      const i = index;

      const child = correct.current;

      if (!child) return;

      child.classList.remove("bg-blue-50");
      child.classList.add("bg-green-500");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      child.classList.remove("bg-green-500");
      child.classList.add("bg-blue-50");

      if (i !== qs.length - 1) {
        setIndex(index);
      }
    };

    socket.on("next", (index) => nextHandler(index));
    return () => {socket.off("next", nextHandler)}
  }, []);

  if (questions.length === 0) {
    return <div className="p-4 text-center">Didn't find the quiz!</div>;
  }

  if (index >= questions.length) {
    return <div className="p-4 text-center">The quiz has ended!</div>;
  }

  return (
    <>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
            <ScoreBoard userList={userList} />
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8 mt-20">

            <h2 className="text-2xl font-extrabold text-center text-blue-800 mb-6">
                {questions[index].question}
            </h2>

            <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                ref={div}
            >
                {questions[index].options.map((option, i) => {
                const isCorrect = option === questions[index].answer;

                return (
                    <button
                    key={i}
                    ref={isCorrect ? correct : null}
                    className={`p-5 rounded-xl text-lg font-semibold shadow-sm border transition-all duration-200 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'`}>
                    {option}
                    </button>
                );
                })}
            </div>
            </div>
        </div>
    </>
  )
}

export default App
