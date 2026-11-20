import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async request => {
  if (request.method !== "POST") return new Response(null, { status: 405 });
  const secret = Deno.env.get("CONTRACT_EMAIL_WORKER_SECRET");
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response(null, { status: 401 });
  }
  const key = Deno.env.get("BREVO_API_KEY");
  const sender = Deno.env.get("BREVO_SENDER_EMAIL");
  if (!key || !sender) return new Response("Brevo sender configuration missing", { status: 503 });
  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await db.rpc("claim_contract_email");
  if (error) return new Response("Queue unavailable", { status: 503 });
  const job = data?.[0];
  if (!job) return new Response(null, { status: 204 });

  let result: Record<string, unknown> = { status: "needs_review", last_error: "Brevo acceptance unknown" };
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      signal: AbortSignal.timeout(15000),
      headers: { "content-type": "application/json", "api-key": key },
      body: JSON.stringify({
        sender: { email: sender, name: "RE IMAGE Business Solutions" },
        to: [{ email: job.recipient }],
        subject: job.subject,
        textContent: job.body,
        headers: { idempotencyKey: job.id }
      })
    });
    if (response.ok) {
      const { messageId } = await response.json();
      if (typeof messageId === "string" && messageId) {
        result = { status: "accepted", provider_message_id: messageId, last_error: null };
      }
    } else if (response.status === 429 && job.attempts < 6) {
      const retryAfter = Number(response.headers.get("retry-after"));
      const delay = Math.max(60 * job.attempts, Number.isFinite(retryAfter) ? retryAfter : 0);
      result = { status: "pending", available_at: new Date(Date.now() + delay * 1000).toISOString(), last_error: "Brevo rate limit" };
    } else if (response.status >= 400 && response.status < 500) {
      result = { status: "failed", last_error: `Brevo HTTP ${response.status}` };
    }
  } catch {
    // Ambiguous provider outcome: keep the job for reconciliation.
  }
  const saved = await db.from("contract_email_queue").update(result)
    .eq("id", job.id).eq("status", "sending").eq("attempts", job.attempts).select("id").single();
  if (saved.error) return new Response("Delivery status requires reconciliation", { status: 503 });
  return Response.json({ status: result.status });
});
