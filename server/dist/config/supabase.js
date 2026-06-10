"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClient = createClient;
const ssr_1 = require("@supabase/ssr");
function createClient(request) {
    const headers = new Headers();
    const supabase = (0, ssr_1.createServerClient)(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
        cookies: {
            getAll() {
                return (0, ssr_1.parseCookieHeader)(request.headers.get("Cookie") ?? "");
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => headers.append("Set-Cookie", (0, ssr_1.serializeCookieHeader)(name, value, options)));
            },
        },
    });
    return { supabase, headers };
}
