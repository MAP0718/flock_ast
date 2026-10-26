import express from "express";
import { randomUUID } from "node:crypto";
import { portalGet, portalLogin } from "./portal.mjs";

const app = express();
const sessions = new Map();
const sessionLength = 8 * 60 * 60 * 1000;
const sessionCookie = "meter_session";

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const frontendOrigins = (process.env.FRONTEND_URLS || "")
    .split(",")
    .map((url) => url.trim())
    .filter(Boolean);

  if (frontendOrigins.includes(origin)) {
    res.set("Access-Control-Allow-Origin", origin);
    res.set("Vary", "Origin");
    res.set("Access-Control-Allow-Credentials", "true");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json());

function getSession(req) {
  const cookieHeader = req.headers.cookie || "";
  const sessionId = cookieHeader
    .split("; ")
    .find((part) => part.startsWith(`${sessionCookie}=`))
    ?.split("=")[1];
  const session = sessions.get(sessionId);

  if (!session || session.expiresAt < Date.now()) {
    if (sessionId) sessions.delete(sessionId);
    return null;
  }

  session.expiresAt = Date.now() + sessionLength;
  return session;
}

function requireLogin(req, res, next) {
  const session = getSession(req);
  if (!session) {
    return res.status(401).json({ error: "unauthorized", message: "Please log in" });
  }

  req.portalCookie = session.portalCookie;
  next();
}

app.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ error: "bad_request", message: "Email and password are required" });
    }

    const portalCookie = await portalLogin(email, password);
    const sessionId = randomUUID();
    sessions.set(sessionId, {
      portalCookie,
      expiresAt: Date.now() + sessionLength,
    });
    res.cookie(sessionCookie, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionLength,
      path: "/",
    });
    res.json({ authenticated: true });
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({ error: "unauthorized", message: error.message });
    }
    next(error);
  }
});

app.get("/auth/session", (req, res) => {
  res.json({ authenticated: Boolean(getSession(req)) });
});

app.post("/auth/logout", (req, res) => {
  const cookieHeader = req.headers.cookie || "";
  const sessionId = cookieHeader
    .split("; ")
    .find((part) => part.startsWith(`${sessionCookie}=`))
    ?.split("=")[1];
  if (sessionId) sessions.delete(sessionId);
  res.clearCookie(sessionCookie, { httpOnly: true, sameSite: "lax", path: "/" });
  res.json({ authenticated: false });
});

const toIso = (s) => {
  const [d, t] = s.split(" ");
  const [dd, mm, yyyy] = d.split("/");
  return `${yyyy}-${mm}-${dd}T${t}:00`;
};

app.get("/meters", requireLogin, async (req, res, next) => {
  try {
    const q = req.query.q ?? "";
    const page = Number(req.query.page ?? 1);
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({ error: "bad_request", message: "page must be a whole number >= 1" });
    }
    const r = await portalGet(`/portal/meters/search?q=${encodeURIComponent(q)}&page=${page}`, req.portalCookie);
    res.json({
      data: r.data,
      page: r.page,
      pageSize: r.pageSize,
      total: r.total,
      totalPages: Math.ceil(r.total / r.pageSize),
    });
  } catch (e) { next(e); }
});

app.get("/meters/:id", requireLogin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const found = await portalGet(`/portal/meters/search?q=${encodeURIComponent(id)}&page=1`, req.portalCookie);
    const meter = found.data.find((m) => m.meterId === id);
    if (!meter) return res.status(404).json({ error: "not_found", message: `No meter ${id}` });
    const geo = await portalGet(`/portal/meters/${encodeURIComponent(id)}/geo`, req.portalCookie);
    res.json({
      ...meter,
      location: { latitude: Number(geo.data.latitude), longitude: Number(geo.data.longitude) },
    });
  } catch (e) { next(e); }
});

app.get("/meters/:id/consumption", requireLogin, async (req, res, next) => {
  try {
    const id = req.params.id;
    const r = await portalGet(`/portal/meters/${encodeURIComponent(id)}/energy`, req.portalCookie);
    const data = r.data.map((x) => ({
      timestamp: toIso(x.timestamp),
      kwh: Number(x.kwh),
      kvah: Number(x.kvah),
      voltageR: Number(x.voltR),
    }));
    res.json({ meterId: id, count: data.length, data });
  } catch (e) { next(e); }
});

app.use((err, req, res, next) => {
  if (err.status === 401) {
    return res.status(401).json({ error: "unauthorized", message: "Please log in again" });
  }
  if (err.status === 404) return res.status(404).json({ error: "not_found", message: "Not found in portal" });
  res.status(502).json({ error: "upstream_error", message: "The portal request failed" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on port ${port}`));