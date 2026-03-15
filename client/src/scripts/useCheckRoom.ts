export const isRoomAvailable = async (quizId: string) => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL;
    const response = await fetch(
      `${apiUrl}/sessions/${encodeURIComponent(quizId)}/availability`,
      {
        method: 'GET',
      },
    );

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

