type StartRequestRecord = {
  id?: string | number;
  created_at?: string;
  submission_type?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  business_name?: string;
  service_choice?: string;
  message?: string;
  status?: string;
};

type WebhookPayload = {
  type?: string;
  table?: string;
  schema?: string;
  record?: StartRequestRecord;
  old_record?: StartRequestRecord;
};

const RESEND_API_URL = "https://api.resend.com/emails";
const DEFAULT_ADMIN_EMAIL = "reimagebs@gmail.com";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-reimage-webhook-secret",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function fullName(record: StartRequestRecord): string {
  return [record.first_name, record.last_name].filter(Boolean).join(" ").trim() || "there";
}

function plainLeadSummary(record: StartRequestRecord): string {
  return [
    "New RE IMAGE request",
    "",
    `Name: ${fullName(record)}`,
    `Email: ${record.email || "Not provided"}`,
    `Phone: ${record.phone || "Not provided"}`,
    `Business: ${record.business_name || "Not provided"}`,
    `Service: ${record.service_choice || "General Question"}`,
    `Submitted: ${record.created_at || "Just now"}`,
    "",
    "Message:",
    record.message || "No message provided."
  ].join("\n");
}

function customerHtml(record: StartRequestRecord): string {
  const name = escapeHtml(fullName(record));
  const service = escapeHtml(record.service_choice || "your request");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10202d">
      <h2 style="margin:0 0 14px;color:#0c1f2e">We received your request</h2>
      <p>Hi ${name},</p>
      <p>Thanks for reaching out to <strong>RE IMAGE Business Solutions</strong>. We received your request for <strong>${service}</strong>.</p>
      <p>Someone from RE IMAGE will review the details and follow up with the next best step.</p>
      <p style="margin-top:22px">You can also use the client portal to keep communication organized:</p>
      <p><a href="https://login.reimagebs.com" style="color:#1a7a8a;font-weight:700">Open the RE IMAGE client portal</a></p>
      <p style="margin-top:28px">Best,<br>RE IMAGE Business Solutions</p>
    </div>
  `.trim();
}

function adminHtml(record: StartRequestRecord): string {
  const message = escapeHtml(record.message || "No message provided.").replace(/\n/g, "<br>");

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#10202d">
      <h2 style="margin:0 0 14px;color:#0c1f2e">New RE IMAGE request</h2>
      <p><strong>Name:</strong> ${escapeHtml(fullName(record))}</p>
      <p><strong>Email:</strong> ${escapeHtml(record.email || "Not provided")}</p>
      <p><strong>Phone:</strong> ${escapeHtml(record.phone || "Not provided")}</p>
      <p><strong>Business:</strong> ${escapeHtml(record.business_name || "Not provided")}</p>
      <p><strong>Service:</strong> ${escapeHtml(record.service_choice || "General Question")}</p>
      <p><strong>Submitted:</strong> ${escapeHtml(record.created_at || "Just now")}</p>
      <hr style="border:0;border-top:1px solid #d9e5ec;margin:22px 0">
      <p><strong>Lead details:</strong></p>
      <div style="background:#f4f8fa;border:1px solid #d9e5ec;border-radius:10px;padding:14px">${message}</div>
    </div>
  `.trim();
}

async function sendEmail(input: {
  apiKey: string;
  from: string;
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: input.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      reply_to: input.replyTo
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend failed ${response.status}: ${detail}`);
  }

  return response.json();
}

Deno.serve(async (request) => {
  console.info("send-start-request-email invoked", { method: request.method });

  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const expectedSecret = Deno.env.get("EMAIL_WEBHOOK_SECRET");
  if (expectedSecret) {
    const providedSecret = request.headers.get("x-reimage-webhook-secret");
    if (providedSecret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing RESEND_API_KEY" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const payload = await request.json() as WebhookPayload | { record?: StartRequestRecord };
  const record = payload.record;

  console.info("send-start-request-email payload received", {
    type: "type" in payload ? payload.type : undefined,
    table: "table" in payload ? payload.table : undefined,
    recordId: record?.id
  });

  if (!record) {
    return new Response(JSON.stringify({ error: "Missing start_requests record" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!from) {
    console.error("Missing RESEND_FROM_EMAIL. Set this to an address on your verified Resend domain.");
    return new Response(JSON.stringify({ error: "Missing RESEND_FROM_EMAIL" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const adminEmail = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || DEFAULT_ADMIN_EMAIL;
  const customerEmail = record.email?.trim();

  const results: Record<string, unknown> = {};
  const errors: Record<string, string> = {};

  console.info("send-start-request-email sending", {
    from,
    adminEmail,
    hasCustomerEmail: Boolean(customerEmail)
  });

  if (customerEmail) {
    try {
      results.customer = await sendEmail({
        apiKey,
        from,
        to: customerEmail,
        subject: "We received your RE IMAGE request",
        html: customerHtml(record),
        text: `Hi ${fullName(record)},\n\nThanks for reaching out to RE IMAGE Business Solutions. We received your request for ${record.service_choice || "your request"}.\n\nSomeone from RE IMAGE will review the details and follow up with the next best step.\n\nClient portal: https://login.reimagebs.com\n\nBest,\nRE IMAGE Business Solutions`
      });
    } catch (error) {
      errors.customer = error instanceof Error ? error.message : String(error);
      console.error("Customer email failed", { to: customerEmail, error: errors.customer });
    }
  }

  try {
    results.admin = await sendEmail({
      apiKey,
      from,
      to: adminEmail,
      subject: `New RE IMAGE request: ${record.service_choice || "General Question"}`,
      html: adminHtml(record),
      text: plainLeadSummary(record),
      replyTo: customerEmail || undefined
    });
  } catch (error) {
    errors.admin = error instanceof Error ? error.message : String(error);
    console.error("Admin email failed", { to: adminEmail, error: errors.admin });
  }

  if (Object.keys(errors).length > 0) {
    return new Response(JSON.stringify({ ok: false, results, errors }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
