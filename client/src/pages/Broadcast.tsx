import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ScoreBoard from '../components/Scoreboard.tsx';
import Socket from '../scripts/useSocket.ts';
import { isRoomAvailable } from '../scripts/useCheckRoom.ts';
import type { Question, Users, BroadcastProps } from '../types/types.ts';

function App({ showScoreboard = true }: BroadcastProps) {
  const socket = Socket;
  const { quizId } = useParams();
  const [index, setIndex] = useState(0);
  const questionsRef = useRef<Question[]>([]);
  const [userList, setUserList] = useState<Users[]>([]);
  const div = useRef<HTMLDivElement>(null);
  const [codeOfQuiz, setCodeOfQuiz] = useState('');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = fetch(`${apiUrl}/getCode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: quizId }),
    });
    response
      .then((res) => res.json())
      .then((data) => {
        if (data.valid !== false) {
          setCodeOfQuiz(data.code);
        }
      });
  }, [quizId]);
  const correct = useRef<HTMLButtonElement | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const [, setTimer] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    isRoomAvailable(quizId!).then((available) => {
      if (!available) {
        window.location.href = `/`;
      }
    });
  }, []);

  useEffect(() => {
    socket.emit('broadcastCon', { roomId: quizId });
    socket.on('broadcastSetIndex', (index: number) => {
      setIsStarted(true);
      setIndex(index);
    });
  }, []);

  useEffect(() => {
    socket.emit('getQuiestions', quizId);
  }, []);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    if (!codeOfQuiz || questions.length === 0) return;
    const fetchImage = async () => {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/files/${codeOfQuiz}_${index}`, {
        method: 'GET',
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        if (div.current) {
          div.current.style.backgroundImage = `url(${url})`;
          div.current.style.backgroundSize = 'cover';
          div.current.style.backgroundPosition = 'center';
        }
      } else {
        if (div.current) {
          div.current.style.backgroundImage = `none`;
        }
      }
    };
    fetchImage();
  }, [codeOfQuiz, index, questions]);

  useEffect(() => {
    if (questions.length > 0 && typeof questions[index]?.timer === 'number') {
      setTimer(questions[index].timer!);
      setTimeLeft(questions[index].timer!);
    }
  }, [questions, index]);

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
    console.info('Questions updated:', questions);
  }, [questions]);

  socket.on('sendQuestions', (data) => {
    if (
      Array.isArray(data) &&
      data.every((q) => q.question && q.options && q.answer)
    ) {
      setQuestions(data);
      if (data.length > 0 && typeof data[0].timer === 'number') {
        setTimer(data[0].timer);
        setTimeLeft(data[0].timer);
      }
    }
  });

  socket.on('scoreboardUpdate', (data: Users[]) => {
    setUserList(data);
  });

  useEffect(() => {
    const nextHandler = async (index: number) => {
      const qs = questionsRef.current;
      const i = index;

      const child = correct.current;

      if (!child) return;

      child.classList.remove('bg-blue-50');
      child.classList.add('bg-green-500');

      await new Promise((resolve) => setTimeout(resolve, 3000));

      child.classList.remove('bg-green-500');
      child.classList.add('bg-blue-50');

      if (i !== qs.length) {
        setIndex(index);
      } else {
        setIsOver(true);
      }
    };

    socket.on('next', (index) => nextHandler(index));
    return () => {
      socket.off('next', nextHandler);
    };
  }, []);

  if (questions.length === 0) {
    return (
      <>
        <div className="p-4 text-center">Didn't find the quiz!</div>
      </>
    );
  }

  if (isOver) {
    if (!showScoreboard) {
      return (
        <>
          <div>
            <div className="p-4 text-center text-2xl font-extrabold text-blue-800">
              The quiz has ended!
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
          <ScoreBoard userList={userList} />
          <div className="p-4 text-center mt-20 text-2xl font-extrabold text-blue-800">
            The quiz has ended!
          </div>
        </div>
      </>
    );
  }

  socket.on('startQuiz', () => {
    setIsStarted(true);
  });

  if (isStarted === false) {
    return (
      <>
        <div className="p-4 text-center">Quiz didn't start yet</div>
      </>
    );
  }

  return (
    <>
      {showScoreboard ? (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 flex flex-col items-center py-10 px-4">
          <ScoreBoard userList={userList} />
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg border border-blue-100 p-8 mt-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-extrabold text-center text-blue-800 mb-6">
                {questions[index].question}
              </h2>
              <span className="text-blue-700 font-semibold text-lg">
                {timeLeft > 0 ? `Timer: ${timeLeft} sec` : ''}
              </span>
            </div>
            <div
              className="my-6 w-full min-h-[200px] flex justify-center items-center"
              ref={div}
            ></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {questions[index].options.map((option, i) => {
                const isCorrect = option === questions[index].answer;
                return (
                  <button
                    key={i}
                    ref={isCorrect ? correct : null}
                    className={`p-5 rounded-xl text-lg font-semibold shadow-sm border transition-all duration-200 bg-blue-50 border-blue-200 text-blue-800'`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full py-10">
          <div className="flex justify-between items-center mb-4 w-full max-w-3xl">
            <h2 className="font-bold text-2xl text-center mb-6 text-blue-800">
              {questions[index].question}
            </h2>
            <span className="text-blue-700 font-semibold text-lg">
              {timeLeft > 0 ? `Timer: ${timeLeft} sec` : ''}
            </span>
          </div>
          <div
            className="my-6 w-full min-h-[200px] flex justify-center items-center"
            ref={div}
          ></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questions[index].options.map((option, i) => {
              const isCorrect = option === questions[index].answer;
              return (
                <button
                  key={i}
                  ref={isCorrect ? correct : null}
                  className={`p-5 rounded-xl text-lg font-semibold shadow-sm border transition-all duration-200 bg-blue-50 border-blue-200 text-blue-800'`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
