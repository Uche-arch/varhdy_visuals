import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
} from "@/lib/session";
import { clearRateLimit, hitRateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
});

// A valid bcrypt hash that matches nothing, so a wrong email costs the same
// time as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

function safeEqual(a: string, b: string) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: "Bad origin" }, { status: 403 });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const hashB64 = process.env.ADMIN_PASSWORD_HASH_B64;
  if (!adminEmail || !hashB64) {
    return NextResponse.json(
      { error: "Admin login is not configured." },
      { status: 500 }
    );
  }
  const adminHash = Buffer.from(hashB64, "base64").toString("utf8");

  const ip = clientIp(req);
  const limitKey = `login:${ip}`;
  const limit = await hitRateLimit(limitKey, 5, 15 * 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(limit.retryAfterSeconds) },
      }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const { email, password } = parsed.data;
  const emailOk = safeEqual(email.toLowerCase(), adminEmail.toLowerCase());
  const passwordOk = await bcrypt.compare(
    password,
    emailOk ? adminHash : DUMMY_HASH
  );

  if (!emailOk || !passwordOk) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  await clearRateLimit(limitKey);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
