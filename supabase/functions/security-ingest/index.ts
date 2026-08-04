import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_DOMAINS = ["ckmhospital.org", "www.ckmhospital.org"];
const ALLOWED_EVENT_TYPES = [
  "LOGIN_FAILED",
  "LOGIN_SUCCESS",
  "LOGOUT",
  "CSRF_VIOLATION",
  "RATE_LIMIT_EXCEEDED",
  "SUSPICIOUS_REQUEST",
  "SQL_INJECTION_ATTEMPT",
  "XSS_ATTEMPT",
  "PATH_TRAVERSAL_ATTEMPT",
  "UNAUTHORIZED_ACCESS",
  "FORBIDDEN_ACCESS",
  "INVALID_INPUT",
  "FILE_UPLOAD_REJECTED",
  "PASSWORD_RESET_REQUESTED",
  "ACCOUNT_LOCKED",
  "SUSPICIOUS_USER_AGENT",
  "PORT_SCAN",
  "BRUTE_FORCE",
  "DDOS_ATTEMPT",
  "CRAWLER_ABUSE",
  "BOT_TRAFFIC",
  "RATE_LIMIT_BURST",
];

const ALLOWED_SEVERITIES = ["low", "medium", "high", "critical"];

interface IngestPayload {
  event_type: string;
  severity?: string;
  source_domain?: string;
  ip_address?: string;
  user_agent?: string;
  path?: string;
  method?: string;
  attack_vector?: string;
  payload_snippet?: string;
  metadata?: Record<string, unknown>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    let body: IngestPayload;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate required fields
    if (!body.event_type || typeof body.event_type !== "string") {
      return new Response(
        JSON.stringify({ error: "event_type is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate event_type is in allowlist
    if (!ALLOWED_EVENT_TYPES.includes(body.event_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid event_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate severity
    const severity = body.severity || "low";
    if (!ALLOWED_SEVERITIES.includes(severity)) {
      return new Response(
        JSON.stringify({ error: "Invalid severity" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine source domain: from payload, or from Origin/Referer header
    let sourceDomain = body.source_domain || "ckmhospital.org";
    const origin = req.headers.get("Origin") || req.headers.get("Referer") || "";
    if (origin) {
      try {
        const originHost = new URL(origin).hostname;
        if (ALLOWED_DOMAINS.includes(originHost)) {
          sourceDomain = originHost;
        }
      } catch {
        // ignore parse errors
      }
    }

    // Extract IP from headers (Supabase passes client IP via various headers)
    const ipAddress =
      body.ip_address ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      req.headers.get("cf-connecting-ip") ||
      null;

    const userAgent =
      body.user_agent ||
      req.headers.get("user-agent") ||
      null;

    // Truncate payload snippet to prevent oversized logs
    const payloadSnippet = body.payload_snippet
      ? body.payload_snippet.substring(0, 500)
      : null;

    // Insert into soc_events
    const { error } = await supabase.from("soc_events").insert({
      event_type: body.event_type,
      severity,
      source_domain: sourceDomain,
      ip_address: ipAddress,
      user_agent: userAgent,
      path: body.path?.substring(0, 500) || null,
      method: body.method || null,
      attack_vector: body.attack_vector || null,
      payload_snippet: payloadSnippet,
      metadata: body.metadata || {},
    });

    if (error) {
      console.error("Error inserting SOC event:", error);
      return new Response(
        JSON.stringify({ error: "Failed to log event" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Security ingest error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
