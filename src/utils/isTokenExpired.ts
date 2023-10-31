import { Session } from "@supabase/supabase-js";

export function isTokenExpired(session: Session) {
  const token = session.access_token;
  try {
    const [headerEnc, payloadEnc] = token.split(".");

    // Decode the payload
    const payloadDec = Buffer.from(payloadEnc, "base64").toString("utf8");

    const payload = JSON.parse(payloadDec);

    const now = Math.floor(Date.now() / 1000);

    return now > payload.exp;
  } catch (e) {
    return true;
  }
}
