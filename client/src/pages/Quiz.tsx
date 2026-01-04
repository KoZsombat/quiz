import Alert from '../components/Alert.tsx';
import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ScoreBoard from '../components/Scoreboard.tsx';
import Socket from '../scripts/useSocket.ts';
import { isRoomAvailable } from '../scripts/useCheckRoom.ts';
import type { Question, Users } from '../types/types.ts';

function App() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const socket = Socket;
  const { quizId } = useParams();
  const [index, setIndex] = useState(0);
  const [soption, setOption] = useState('');
  const questionsRef = useRef<Question[]>([]);
  const optionRef = useRef('');
  const [userList, setUserList] = useState<Users[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const correct = useRef<HTMLButtonElement | null>(null);
  const [codeOfQuiz, setCodeOfQuiz] = useState('');
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    isRoomAvailable(quizId!).then((available) => {
      if (!available) {
        setAlertMsg('The quiz is not available or does not exist.');
        setTimeout(() => (window.location.href = `/`), 2000);
      }
    });
    const response = fetch(`${apiUrl}/getCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: quizId }),
    });
    response
      .then((res) => res.json())
      .then((data) => {
        if (data.valid === false) {
          setAlertMsg('The quiz is not available or does not exist.');
          setTimeout(() => (window.location.href = `/`), 2000);
        } else {
          setCodeOfQuiz(data.code);
        }
      })
      .catch((e) => {
        setAlertMsg('Error loading the quiz.' + e.message);
      });
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem('username');
    socket.emit('userCon', { roomId: quizId, name: jwt });
    socket.on('tokenExpired', () => {
      window.location.href = `/`;
    });
  }, []);

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    if (questions.length > 0 && typeof questions[index]?.timer === 'number') {
      setTimeLeft(questions[index].timer);
    }
  }, [index, questions]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          socket.emit('nextTrigger', quizId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, quizId]);
  useEffect(() => {
    optionRef.current = soption;
  }, [soption]);

  useEffect(() => {
    socket.emit('getQuiestions', quizId);
  }, []);

  socket.on('sendQuestions', (data) => {
    if (
      Array.isArray(data) &&
      data.every((q) => q.question && q.options && q.answer)
    ) {
      setQuestions(data);
      if (data.length > 0 && typeof data[0].timer === 'number') {
        setTimeLeft(data[0].timer);
      }
    } else {
      fetch(`${apiUrl}/getQuiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: quizId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.quiz)) {
            setQuestions(data.quiz);
            if (
              data.quiz.length > 0 &&
              typeof data.quiz[0].timer === 'number'
            ) {
              setTimeLeft(data.quiz[0].timer);
            }
          } else {
            setAlertMsg('No questions found for the quiz.');
          }
        })
        .catch(() => setAlertMsg('Failed to load questions.'));
    }
  });

  socket.on('setIndex', (data: number) => {
    setIndex(data);
  });

  socket.on('joinError', () => {
    window.location.href = `/`;
  });

  socket.on('scoreboardUpdate', (data: Users[]) => {
    setUserList(data);
  });

  useEffect(() => {
    const fetchImage = async () => {
      if (!codeOfQuiz) return;

      setImageUrl(null);

      const types = ['png', 'jpeg', 'jpg', 'gif'];

      for (const type of types) {
        const imageUrl = `${apiUrl}/files/${codeOfQuiz}_${index}.${type}`;
        try {
          const response = await fetch(imageUrl);
          if (response.ok) {
            const blob = await response.blob();
            const objectURL = URL.createObjectURL(blob);
            setImageUrl(objectURL);
            return () => URL.revokeObjectURL(objectURL);
          }
        } catch (error) {
          console.error(`Error fetching image ${imageUrl}:`, error);
        }
      }
    };

    fetchImage();
  }, [codeOfQuiz, index, apiUrl]);

  useEffect(() => {
    const nextHandler = async (index: number) => {
      const qs = questionsRef.current;
      const i = index;
      const opt = optionRef.current;

      if (opt === qs[i - 1].answer) {
        socket.emit('correctAns', {
          username: localStorage.getItem('username'),
          roomId: quizId,
        });
      }

      const child = correct.current;

      if (!child) return;

      child.classList.remove('bg-gray-200');
      child.classList.remove('bg-gray-400');
      child.classList.add('bg-green-500');

      await new Promise((resolve) => setTimeout(resolve, 3000));

      child.classList.remove('bg-green-500');
      child.classList.add('bg-gray-200');

      setOption('');

      if (i === qs.length) {
        setShowScoreboard(true);
        localStorage.removeItem('username');
        socket.emit('endOfQuiz', quizId);
        try {
          fetch(`${apiUrl}/endQuiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: quizId }),
          });
        } catch (e) {
          console.error('Error fetching quizzes', e);
        }
      } else {
        setIndex(index);
      }
    };

    socket.on('next', (index) => nextHandler(index));
    return () => {
      socket.off('next', nextHandler);
    };
  }, []);

  const handleOptionClick = (option: string) => {
    setOption(option);
  };

  if (questions.length === 0) {
    return (
      <>
        {alertMsg && (
          <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />
        )}
        <div className="p-4 text-center">Didn't find the quiz!</div>
      </>
    );
  }

  if (showScoreboard) {
    return (
      <>
        {alertMsg && (
          <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />
        )}
        <ScoreBoard userList={userList} />
      </>
    );
  }

  return (
    <>
      {alertMsg && <Alert error={alertMsg} onClose={() => setAlertMsg(null)} />}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
        <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8 flex flex-col items-center">
          <div className="w-full flex justify-between items-center mb-6">
            <p className="text-blue-700 font-semibold text-lg">
              Quiz ID: <span className="text-gray-600">{quizId}</span>
            </p>
            <span className="text-blue-700 font-semibold text-lg">
              {timeLeft > 0 ? `Timer: ${timeLeft} sec` : 'Timer is up'}
            </span>
          </div>

          <h2 className="text-2xl font-extrabold text-center text-blue-800 mb-6 w-full">
            {questions[index].question}
          </h2>

          {/* Centered image container */}
          <div className="w-full flex justify-center items-center my-6 min-h-[200px]">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={`Quiz image`}
                className="max-w-full max-h-[200px] object-contain"
              />
            )}
          </div>

          <div className="w-full flex flex-col items-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {questions[index].options.map((option, i) => {
                const isSelected = soption === option;
                const isCorrect = option === questions[index].answer;

                return (
                  <button
                    key={i}
                    ref={isCorrect ? correct : null}
                    onClick={() => handleOptionClick(option)}
                    className={`p-5 rounded-xl text-lg font-semibold shadow-sm border transition-all duration-200 cursor-pointer w-full
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
      </div>
    </>
  );
}

export default App;
