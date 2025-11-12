import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import ScoreBoard from '../components/Scoreboard.tsx'
import Socket from '../scripts/useSocket.ts'

function App() {
  const socket = Socket;
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)
  const [soption, setOption] = useState("")
  const questionsRef = useRef<Question[]>([]);
  const optionRef = useRef("");
  const [userList, setUserList] = useState<Users[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
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

  useEffect(() => {
    socket.emit("userCon", { roomId: JSON.stringify(quizId), name: localStorage.getItem("username") });
  }, [])

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => { questionsRef.current = questions }, [questions]);
  useEffect(() => { optionRef.current = soption }, [soption]);

  useEffect(() => {
    socket.emit("getQuiestions", quizId)
  }, [])

  socket.on("sendQuestions", (data) => {
    if (Array.isArray(data) && data.every(q => q.question && q.options && q.answer)) {
      setQuestions(data)
    }
  });

  socket.on("joinError", () => {
    window.location.href = `/`
  })

  socket.on("scoreboardUpdate", (data: Users[]) => {
    setUserList(data);
  });

  useEffect(() => {
    const nextHandler = async (index: number) => {
      const qs = questionsRef.current;
      const i = index;
      const opt = optionRef.current;

      if (opt === qs[i].answer) {
        socket.emit("correctAns", localStorage.getItem("username"));
      }

      const child = correct.current;

      if (!child) return;

      child.classList.remove("bg-gray-200");
      child.classList.remove("bg-gray-400");
      child.classList.add("bg-green-500");

      await new Promise((resolve) => setTimeout(resolve, 3000));

      child.classList.remove("bg-green-500");
      child.classList.add("bg-gray-200");

      setOption("");

      if (i === qs.length - 1) {
        setShowScoreboard(true)
        localStorage.removeItem("username")
        socket.emit("endOfQuiz", quizId)
        try {
          fetch(`http://localhost:3000/api/endQuiz`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: quizId })
          });           
        } catch (e) {
            console.error('Error fetching quizzes', e);
        }
      } else {
        setIndex(index);
      }
    };

    socket.on("next", (index) => nextHandler(index));
    return () => {socket.off("next", nextHandler)}
  }, []);

  const handleOptionClick = (option: string) => {
    setOption(option)
  }

  if (questions.length === 0) {
    return <div className="p-4 text-center">Didn't find the quiz!</div>;
  }

  if (showScoreboard) {
    return <ScoreBoard userList={userList} />;
  }

  return (
<>
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
    <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <p className="text-blue-700 font-semibold text-lg">
          Quiz ID: <span className="text-gray-600">{quizId}</span>
        </p>
      </div>

      <h2 className="text-2xl font-extrabold text-center text-blue-800 mb-6">
        {questions[index].question}
      </h2>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        ref={div}
      >
        {questions[index].options.map((option, i) => { //az elso kerdest irja ki ketszer es ha jol megvalaszolja ketszer ugyan ugy 1 pontot kap
          const isSelected = soption === option;
          const isCorrect = option === questions[index].answer;

          return (
            <button
              key={i}
              ref={isCorrect ? correct : null}
              onClick={() => handleOptionClick(option)}
              className={`p-5 rounded-xl text-lg font-semibold shadow-sm border transition-all duration-200
                ${
                  isSelected
                    ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-700'
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-800'
                }`}
            >
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
