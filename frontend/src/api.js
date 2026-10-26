const API_URL = __API_URL__.replace(/\/$/, "");

export async function getData(url, options = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    ...options,
    credentials: "include",
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
