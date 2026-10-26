const BASE = process.env.BASE_URL;

if (!BASE) {
  throw new Error("Set BASE_URL in backend/.env before starting the API");
}

export async function portalLogin(email, password) {
  const response = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: BASE,
      "x-sveltekit-action": "true",
      Accept: "application/json",
    },
    body: new URLSearchParams({ email, password }),
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error("The portal is unavailable");
  }

  if (result.type !== "redirect") {
    const error = new Error("Email or password is incorrect");
    error.status = 401;
    throw error;
  }

  const cookie = response.headers.getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");

  if (!cookie) {
    throw new Error("Portal login did not return a session");
  }

  return cookie;
}

export async function portalGet(path, cookie) {
  const response = await fetch(`${BASE}${path}`, {
    headers: { Cookie: cookie },
  });

  if (!response.ok) {
    const error = new Error(`Portal request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}
