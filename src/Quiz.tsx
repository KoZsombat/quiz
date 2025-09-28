import { useEffect, useState, useRef } from 'react'
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {
  const socket = io("http://localhost:3000");
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)
  const [soption, setOption] = useState("")
  const questionsRef = useRef<Question[]>([]);
  const indexRef = useRef(0);
  const optionRef = useRef("");

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
  useEffect(() => { indexRef.current = index }, [index]);
  useEffect(() => { optionRef.current = soption }, [soption]);

  useEffect(() => {
    socket.emit("getQuiestions", quizId)
  }, [])

  socket.on("sendQuestions", (data) => {
    if (Array.isArray(data) && data.every(q => q.question && q.options && q.answer)) {
      data.forEach(q => {
        setQuestions(prev => [...prev, q]);
      })
    } else {
      console.error("Invalid data format:", data);
    }
  });

  useEffect(() => {
    console.log(questions)
  }, [questions])

  useEffect(() => {
    const nextHandler = () => {
      const qs = questionsRef.current;
      const i = indexRef.current;
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
        alert("Quiz completed!");
      } else {
        setIndex(prev => prev + 1);
      }
    };

    socket.on("next", nextHandler);
    return () => {socket.off("next", nextHandler)}
  }, []);

  const handleOptionClick = (option: string) => {
    setOption(option)
     console.log(questions)
  }

  if (questions.length === 0) {
    return <div className="p-4 text-center">Loading quiz...</div>;
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
