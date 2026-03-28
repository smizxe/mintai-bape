import { NextRequest, NextResponse } from "next/server";
import { buildAbsoluteUrl, getPayOSClient, getPayOSErrorMessage } from "@/lib/payos";
import { decodeSession, SESSION_COOKIE } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? decodeSession(token) : null;

  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const payOS = getPayOSClient();
    const webhookUrl = buildAbsoluteUrl(req.nextUrl.origin, "/api/payos/webhook");
    const result = await payOS.webhooks.confirm(webhookUrl);

    return NextResponse.json({ ok: true, webhookUrl: result.webhookUrl });
  } catch (error) {
    return NextResponse.json({ error: getPayOSErrorMessage(error) }, { status: 500 });
  }
}
