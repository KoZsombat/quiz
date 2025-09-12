import React from 'react'

function App() {

    type Question = {
        question: string;
        options: string[];
        answer: string;
    }

    const [createdquietions, setCreatedQuestions] = React.useState<Question[]>([]);

    React.useEffect(() => {
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
        const codeInput = document.getElementById('code') as HTMLInputElement;
        if (!codeInput || !codeInput.value) {
            alert("Please enter a room code.");
            return;
        }
        fetch
        ('http://192.168.1.35:3000/api/saveQuiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ createdquietions, code: codeInput.value }),
        })
        .then(async response => {
            const text = await response.text(); // read the full response
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
        <h1 className='text-3xl p-5 text-center'>Create Quiz</h1>
        {
            createdquietions.map((element) => {
                return (
                    <div key={element.question} className="container mx-auto p-4 border rounded mb-4 flex flex-col gap-2 justify-cenezr items-center w-[95vw] lg:w-[20vw]">
                        <h2 className="text-lg font-bold">{element.question}</h2>
                        <div className="grid grid-cols-2 pl-5 mt-2">
                            {element.options.map((option, i) => (
                                <span key={i} className="m-1 bg-gray-200 p-5">{option}</span>
                            ))}
                        </div>
                        <p className="mt-2">Answer: {element.answer}</p>
                        <button className='bg-red-500 p-3 rounded-lg text-white' onClick={() => handleDelete(element.question)}>Delete</button>
                    </div>
                );
            })
        }
        <form onSubmit={(e) => {
          e.preventDefault();
            const question = (e.target as HTMLFormElement).question.value;
            const rawOptions = (e.target as HTMLFormElement).options.value.split(',');
            const options = rawOptions.map((opt: string) => opt.trim());
            const answer = (e.target as HTMLFormElement).answer.value;
          
            if (!question || options.length === 0 || !answer) {
                alert("Please fill in all fields.");
                return;
            }

            if (!options.includes(answer)) {
                alert("Answer must be one of the options.");
                return;
            }

          setCreatedQuestions([...createdquietions, { question, options: options.map((opt: string) => opt.trim()), answer }]);
          (e.target as HTMLFormElement).reset();
        }}>
            <div className='container mx-auto p-4 border rounded mb-4 flex flex-col gap-2 justify-cenezr items-center w-[95vw] lg:w-[20vw]'>
                <input className='bg-gray-100 border-gray-300 rounded-sm border border-solid p-1 w-full text-center' type="text" name="question" placeholder="Question" required />
                <input className='bg-gray-100 border-gray-300 rounded-sm border border-solid p-1 w-full text-center' type="text" name="options" placeholder="Options (comma separated)" required />
                <input className='bg-gray-100 border-gray-300 rounded-sm border border-solid p-1 w-full text-center' type="text" name="answer" placeholder="Answer" required />
                <button className='bg-green-500 p-3 rounded-lg text-white' type="submit">Add Question</button>
            </div>
        </form>
        <div className='container mx-auto p-4 border rounded mb-4 flex flex-col gap-2 justify-cenezr items-center w-[95vw] lg:w-[20vw]'>
        <input className='bg-gray-100 border-gray-300 rounded-sm border border-solid p-1 text-center' type="text" id='code' placeholder='Room code'/>
        <button className='bg-green-500 p-3 rounded-lg text-white' onClick={handleSaveQuiz}>Save Quiz</button>
        </div>
    </>
  )
}

export default App
