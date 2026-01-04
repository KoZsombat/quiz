export interface Users {
  roomId: string;
  userId: string;
  username: string;
  score: number;
}

export interface Question {
  question: string;
  options: string[];
  answer: string;
  timer: number;
}

export interface BroadcastProps {
  showScoreboard?: boolean;
}

export interface Quiz {
  code: string;
  author: string;
  visibility: 'public' | 'private';
  question: string;
  timer: number;
  options: string[];
  answer: string;
}
