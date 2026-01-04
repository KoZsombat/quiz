export const isRoomAvailable = async (quizId: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(`${apiUrl}/isQuizCodeAvailable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: quizId }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (!data.success || !data.available) {
      return false;
    }
  } catch (err) {
    console.error(err);
    return false;
  }
  return true;
};
