const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

const eventTypes = new Set(["featured_impression", "profile_view", "outbound_click"]);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function respond(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  const origin = request.headers.get("origin") || "";
  if (origin && !/^https:\/\/(?:www\.)?reimagebs\.com$/i.test(origin) && !/^http:\/\/localhost(?::\d+)?$/i.test(origin) && !/^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin)) {
    return respond({ error: "Origin not allowed" }, 403);
  }

  const body = await request.json().catch(() => ({})) as { business?: string; category?: string; event?: string };
  if (!body.business || !slugPattern.test(body.business) || !body.event || !eventTypes.has(body.event) || (body.category && !slugPattern.test(body.category))) {
    return respond({ error: "Invalid marketplace event" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return respond({ error: "Metrics service is not configured" }, 500);

  const result = await fetch(`${supabaseUrl}/rest/v1/rpc/increment_marketplace_metric`, {
    method: "POST",
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ metric_business_slug: body.business, metric_category_slug: body.category || null, metric_event_type: body.event })
  });
  if (!result.ok) return respond({ error: "Metric could not be recorded" }, 502);
  return respond({ ok: true });
});
