import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type DynamicQrCode = {
  id: string;
  slug: string;
  destination_url: string;
  is_active: boolean;
  scan_count: number;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS"
};

function notFound(message = "QR code not found") {
  return new Response(message, {
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}

function extractSlug(request: Request) {
  const url = new URL(request.url);
  const querySlug = url.searchParams.get("slug");

  if (querySlug) {
    return querySlug.toLowerCase().trim();
  }

  const parts = url.pathname.split("/").filter(Boolean);
  return (parts[parts.length - 1] || "").toLowerCase().trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders
    });
  }

  const slug = extractSlug(request);

  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return notFound();
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response("Redirect service is not configured", {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/plain; charset=utf-8"
      }
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await supabase
    .from("dynamic_qr_codes")
    .select("id, slug, destination_url, is_active, scan_count")
    .eq("slug", slug)
    .single();

  const record = data as DynamicQrCode | null;

  if (error || !record || !record.is_active) {
    return notFound();
  }

  await supabase
    .from("dynamic_qr_codes")
    .update({
      scan_count: Number(record.scan_count || 0) + 1,
      last_scanned_at: new Date().toISOString()
    })
    .eq("id", record.id);

  return Response.redirect(record.destination_url, 302);
});
