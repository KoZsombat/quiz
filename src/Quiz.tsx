import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

function App() {
  const socket = io("http://localhost:3000");
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)

  interface Question {
    question: string;
    options: string[];
    answer: string;
  }

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    socket.emit("getQuiestions", quizId)
  }, [])

  socket.on("sendQuestions", (data) => {
    setQuestions(data);
  })

  const handleOptionClick = (option: string) => {
    if (option === questions[index].answer) {
      alert("Correct!");
      socket.emit("correctAns", localStorage.getItem("username"))
    } else {
      alert("Wrong answer.");
    }
  }

  socket.on("next", () => {
    questions.length - 1 == index ? alert("Quiz completed!") : setIndex((prevIndex) => (prevIndex + 1));
  })

  if (questions.length === 0) {
    return <div className="p-4 text-center">Loading quiz...</div>;
  }

  return (
    <>
    <div className='container mx-auto p-4'>
      <p>{quizId}</p>
      <div className="p-4 border rounded mb-4">
        <h2 className="text-lg font-bold text-center">{questions[index].question}</h2>
        <div className="grid grid-cols-2 pl-5 mt-2">
          {questions[index].options.map((option, i) => (
            <button key={i} className="m-1 bg-gray-200 p-5 cursor-pointer hover:bg-gray-300 transition-all transition-normal duration-100 ease-linear" onClick={() => handleOptionClick(option)}>{option}</button>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default App
