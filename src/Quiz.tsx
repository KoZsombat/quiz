import React from 'react'

function App() {

  //api kód küldés és rá quiz fogadás
  
  const [index, setIndex] = React.useState(0)

  const questions = [
    {
      question: "What is the capital of France?",
      options: ["Paris", "London", "Berlin", "Madrid"],
      answer: "Paris"
    },
    {
      question: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      answer: "4"
    }
  ]

  const handleOptionClick = (option: string) => {
    if (option === questions[index].answer) {
      alert("Correct!");
    } else {
      alert("Wrong answer.");
    }
    questions.length - 1 == index ? alert("Quiz completed!") : setIndex((prevIndex) => (prevIndex + 1));
  }

  return (
    <>
    <div className='container mx-auto p-4'>
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
