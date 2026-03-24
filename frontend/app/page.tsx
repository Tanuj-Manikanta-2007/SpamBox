"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";

/* ---------------- INTRO ---------------- */
function MailIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#0A0A0A]">
      <motion.div
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70 }}
        className="flex flex-col items-center gap-6"
      >
        <div className="p-8 rounded-full bg-[#C6A062] shadow-[0_0_80px_rgba(198,160,98,0.7)]">
          <Mail size={70} className="text-black" />
        </div>

        <h1 className="text-6xl font-extrabold tracking-[0.25em] bg-linear-to-b from-[#F5E6C8] to-[#C6A062] bg-clip-text text-transparent">
          SPAMBOX
        </h1>
      </motion.div>
    </div>
  );
}

/* ---------------- LOGIN ---------------- */
function GmailCard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <motion.div className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50">
      <motion.div className="w-96 p-12 rounded-3xl bg-[#151419] border border-[#C6A062]/40 text-center">
        <h2 className="text-3xl text-[#C6A062] mb-6">CONNECT GMAIL</h2>

        <button
          onClick={onSuccess}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            className="w-5 h-5"
          />
          Continue with Google
        </button>

        <p onClick={onClose} className="mt-6 text-gray-400 cursor-pointer">
          Cancel
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ---------------- SPAM CHECK ---------------- */
function SpamChecker({ onBack, onLimit }: { onBack: () => void; onLimit: () => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{ prediction: string; confidence: number } | null>(null);

  const handleCheck = () => {
    const used = localStorage.getItem("trial_used");

    if (used) {
      onLimit();
      return;
    }

    localStorage.setItem("trial_used", "true");

    setResult({
      prediction: "Spam",
      confidence: 0.72,
    });
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 p-10">
      <button onClick={onBack} className="mb-6 text-gray-400">← Back</button>

      <h1 className="text-3xl text-[#C6A062] mb-6">Spam Mail Checker</h1>

      <textarea
        className="w-full h-40 p-4 bg-black border border-gray-800 rounded-lg"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste email..."
      />

      <button
        onClick={handleCheck}
        className="mt-4 px-6 py-3 bg-[#C6A062] text-black rounded-lg"
      >
        Check
      </button>

      {result && (
        <div className="mt-6 p-4 border border-gray-800 rounded bg-black">
          <p>Prediction: {result.prediction}</p>
          <p>Confidence: {result.confidence}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- AI SUMMARY ---------------- */
function SummaryPage({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");

  const handleGenerate = () => {
    if (!text) return;
    const short = text.split(" ").slice(0, 20).join(" ") + "...";
    setSummary(short);
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 p-10">
      <button onClick={onBack} className="mb-6 text-gray-400">← Back</button>

      <h1 className="text-3xl text-[#C6A062] mb-6">AI Email Summarizer</h1>

      <textarea
        className="w-full h-40 p-4 bg-black border border-gray-800 rounded-lg"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste email content..."
      />

      <button
        onClick={handleGenerate}
        className="mt-4 px-6 py-3 bg-[#C6A062] text-black rounded-lg"
      >
        Generate Summary
      </button>

      {summary && (
        <div className="mt-6 p-4 border border-gray-800 rounded bg-black">
          <h3 className="text-[#C6A062] mb-2">Summary:</h3>
          <p className="text-gray-300">{summary}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard() {
  const [selectedEmail, setSelectedEmail] = useState<{ sender: string; subject: string; preview: string; time: string } | null>(null);

  const emails = [
    { sender: "Google", subject: "Security alert", preview: "New device login...", time: "17:43" },
    { sender: "GitHub", subject: "New sign-in", preview: "We noticed a login...", time: "16:25" },
    { sender: "Vercel", subject: "Deploy success", preview: "Your app is live...", time: "14:08" },
  ];

  return (
    <div className="h-screen flex bg-[#0b0b0b] text-gray-200">

      <div className="w-64 border-r border-gray-800 p-4">
        <div className="p-3 rounded-xl shadow-[0_0_20px_rgba(198,160,98,0.3)]">
          <span className="font-extrabold tracking-[0.25em] text-[#C6A062]">
            INBOX
          </span>
        </div>
      </div>

      <div className="flex-1 border-r border-gray-800">
        <div className="p-4 border-b border-gray-800 text-[#C6A062]">INBOX</div>

        {emails.map((email, i) => (
          <div
            key={i}
            onClick={() => setSelectedEmail(email)}
            className="p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5"
          >
            <div className="flex justify-between">
              <span>{email.sender}</span>
              <span className="text-xs text-gray-500">{email.time}</span>
            </div>
            <div className="text-sm">{email.subject}</div>
            <div className="text-xs text-gray-500">{email.preview}</div>
          </div>
        ))}
      </div>

      <div className="w-90 p-4">
        {!selectedEmail ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            Select an email
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
              <h3 className="text-[#C6A062] font-bold mb-2">SPAM TOKEN</h3>
              <p className="text-sm text-gray-400">Spam probability: 0.72</p>
            </div>

            <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
              <h3 className="text-[#C6A062] font-bold mb-2">AI SUMMARY</h3>
              <p className="text-sm text-gray-400">Summary will appear here</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ---------------- MAIN ---------------- */
export default function App() {
  const [done, setDone] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [page, setPage] = useState("home");

  if (loggedIn) return <Dashboard />;

  if (page === "spam") {
    return <SpamChecker onBack={() => setPage("home")} onLimit={() => setShowOAuth(true)} />;
  }

  if (page === "summary") {
    return <SummaryPage onBack={() => setPage("home")} />;
  }

  return (
    <div className="bg-[#0A0A0A] text-white">

      {!done && <MailIntro onDone={() => setDone(true)} />}

      {done && (
        <div className="h-screen flex flex-col items-center justify-center gap-12">

          <h1 className="text-7xl font-extrabold text-[#C6A062]">
            SPAMBOX
          </h1>

          <div className="grid md:grid-cols-2 gap-10 max-w-5xl">

            {/* GLOW BUTTONS */}
            {[
              { name: "SPAM DETECTION", action: () => setPage("spam") },
              { name: "AI SUMMARY", action: () => setPage("summary") }
            ].map((item, i) => (
              <div
                key={i}
                onClick={item.action}
                className="px-10 py-6 rounded-2xl border border-[#C6A062]/30 bg-black/60 text-center cursor-pointer
                shadow-[0_0_15px_rgba(198,160,98,0.2)]
                hover:shadow-[0_0_35px_rgba(198,160,98,0.6)]
                hover:scale-105 transition"
              >
                <h3
                  className="font-extrabold tracking-[0.25em]"
                  style={{
                    background: "linear-gradient(180deg,#F5E6C8,#C6A062)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {item.name}
                </h3>
              </div>
            ))}

          </div>

          <button
            onClick={() => setShowOAuth(true)}
            className="px-10 py-4 rounded-full border border-[#C6A062] hover:bg-[#C6A062] hover:text-black transition"
          >
            GET STARTED
          </button>

        </div>
      )}

      <AnimatePresence>
        {showOAuth && (
          <GmailCard
            onClose={() => setShowOAuth(false)}
            onSuccess={() => {
              setShowOAuth(false);
              setLoggedIn(true);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}