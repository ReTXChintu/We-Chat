export async function searchUser(query) {
  const serverUrl = process.env.REACT_APP_SERVER_URL;
  try {
    const response = await fetch(`${serverUrl}/searchUser/${query}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Serahing Failed", response);

    const result = await response.json();

    return result;
  } catch (error) {
    console.log(error);
  }
}

export const formatText = (time) => {
  const inputDate = new Date(time);
  return `${inputDate.getHours().toString().padStart(2, "0")}:${inputDate
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

