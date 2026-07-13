"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 flex items-center justify-center px-6">
      <div className="w-full max-w-md p-10 rounded-3xl bg-[#151419] border border-[#C6A062]/40 shadow-[0_0_100px_rgba(198,160,98,0.25)]">
        <h1 className="text-3xl font-extrabold tracking-wide text-[#C6A062]">
          SIGN IN
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Login with your Supabase account.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Email</label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-[#C6A062]/60"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-[#C6A062]/60"
              placeholder="••••••••"
              required
            />
          </div>

          {error ? (
            <div className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl p-3">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold transition enabled:hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <a
            href="/logout"
            className="block text-center text-sm text-gray-400 hover:text-gray-200"
          >
            Having trouble? Logout
          </a>
        </form>

        <div className="mt-8 text-xs text-gray-500">
          Supabase Auth uses your Supabase Postgres behind the scenes.
        </div>
      </div>
    </div>
  );
}
