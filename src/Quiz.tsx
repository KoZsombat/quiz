import { useEffect, useState } from 'react'
import { useParams } from "react-router-dom";

function App() {
  const { quizId } = useParams(); 
  const [index, setIndex] = useState(0)

  interface Question {
    question: string;
    options: string[];
    answer: string;
  }

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    fetch(`http://localhost:3000/api/getQuiz/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: quizId }),
    })
      .then(response => response.json())
      .then(data => {
        console.log("Fetched Quiz Data:", data);
        setQuestions(data);
      })
      .catch(error => {
        console.error("Error fetching quiz data:", error);
      });
  }, [quizId]);

  const handleOptionClick = (option: string) => {
    if (option === questions[index].answer) {
      alert("Correct!");
    } else {
      alert("Wrong answer.");
    }
    questions.length - 1 == index ? alert("Quiz completed!") : setIndex((prevIndex) => (prevIndex + 1));
  }

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
