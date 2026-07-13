"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseClient";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [status, setStatus] = useState<"working" | "done">("working");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        if (supabase) {
          await supabase.auth.signOut();
        }
      } finally {
        if (cancelled) return;
        setStatus("done");
        router.replace("/login");
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 flex items-center justify-center px-6">
      <div className="w-full max-w-md p-10 rounded-3xl bg-[#151419] border border-[#C6A062]/40 shadow-[0_0_100px_rgba(198,160,98,0.25)] text-center">
        <h1 className="text-3xl font-extrabold tracking-wide text-[#C6A062]">
          LOGOUT
        </h1>
        <p className="mt-3 text-sm text-gray-400">
          {status === "working" ? "Signing you out…" : "Signed out. Redirecting…"}
        </p>

        <a
          href="/login"
          className="inline-block mt-8 text-sm text-gray-300 hover:text-white"
        >
          Go to login
        </a>
      </div>
    </div>
  );
}
