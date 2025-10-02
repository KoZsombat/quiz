import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import ScoreBoard from './Scoreboard.tsx'

function App() {
  const socket = io("http://localhost:3000");
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)
  const [soption, setOption] = useState("")
  const questionsRef = useRef<Question[]>([]);
  const optionRef = useRef("");
  const [userList, setUserList] = useState<Users[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);

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
    } else {
      console.error("Invalid data format:", data);
    }
  });

  socket.on("joinError", () => {
    window.location.href = `/`
  })

  socket.on("scoreboardUpdate", (data: Users[]) => {
    setUserList(data);
  });

  useEffect(() => {
    console.log(questions)
  }, [questions])

  useEffect(() => {
    const nextHandler = (index: number) => {
      console.log(`${index}`)
      const qs = questionsRef.current;
      const i = index;
      const opt = optionRef.current;

      if (!qs[i]) return;

      if (opt === qs[i].answer) {
        alert("Correct!");
        socket.emit("correctAns", localStorage.getItem("username"));
      } else {
        alert("Wrong answer.");
      }

      setOption("");
      if (i === qs.length - 1) {
        setShowScoreboard(true)
        localStorage.removeItem("username")
        socket.emit("endOfQuiz", quizId)
        try {
          fetch(`http://localhost:3000/api/endQuiz`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(quizId)
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
    console.log(questions)
  }

  if (questions.length === 0) {
    return <div className="p-4 text-center">Loading quiz...</div>;
  }

  if (showScoreboard) {
    return <ScoreBoard userList={userList} />;
  }

  return (
    <>
    <div className='container mx-auto p-4'>
      <button onClick={() => console.log(questions)}>Next</button>
      <p>{quizId}</p>
      <div className="p-4 border rounded mb-4">
        <h2 className="text-lg font-bold text-center">{questions[index].question}</h2>
        <div className="grid grid-cols-2 pl-5 mt-2">
          {questions[index].options.map((option, i) => (
            <button key={i} className={soption == option ? "m-1 bg-gray-400 p-5 cursor-pointer hover:bg-gray-300 transition-all transition-normal duration-100 ease-linear" : "m-1 bg-gray-200 p-5 cursor-pointer hover:bg-gray-300 transition-all transition-normal duration-100 ease-linear"} onClick={() => handleOptionClick(option)}>{option}</button>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default App
