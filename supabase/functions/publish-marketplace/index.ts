const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const adminEmails = new Set(["reimagbs@gmail.com", "reimagebs@gmail.com"]);

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
}

function jwtEmail(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return "";
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, "=")));
    return String(decoded.email || "").toLowerCase();
  } catch {
    return "";
  }
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const email = jwtEmail(request);
  if (!adminEmails.has(email)) return json({ error: "Admin access required" }, 403);

  const owner = Deno.env.get("GITHUB_OWNER");
  const repo = Deno.env.get("GITHUB_REPO");
  const token = Deno.env.get("GITHUB_DISPATCH_TOKEN");
  if (!owner || !repo || !token) return json({ error: "GitHub publishing secrets are not configured" }, 500);

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "reimage-marketplace-publisher"
    },
    body: JSON.stringify({
      event_type: "marketplace_publish",
      client_payload: { requested_by: email, requested_at: new Date().toISOString() }
    })
  });

  if (!response.ok) return json({ error: `GitHub dispatch failed (${response.status})`, detail: await response.text() }, 502);
  return json({ ok: true, message: "Marketplace build started. The live site will update after validation passes." });
});
