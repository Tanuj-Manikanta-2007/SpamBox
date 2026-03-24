"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";

// 🎬 INTRO
function MailIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40">
      <motion.div
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 70, damping: 12 }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div whileHover={{ scale: 1.1 }} className="p-8 rounded-full bg-[#C6A062] shadow-[0_0_80px_rgba(198,160,98,0.7)]">
          <Mail size={70} className="text-black" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-6xl md:text-7xl font-extrabold tracking-[0.25em]"
          style={{
            background: "linear-gradient(180deg, #F5E6C8, #C6A062, #8B6B2E)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontFamily: "Impact, Haettenschweiler, 'Arial Black', sans-serif",
          }}
        >
          SPAMBOX
        </motion.h1>
      </motion.div>
    </div>
  );
}

// 📦 FEATURE CARD
function FeatureBox({ title, desc, i }: { title: string; desc: string; i: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: i * 0.2 }}
      whileHover={{ scale: 1.04, y: -4 }}
      className="p-6 rounded-2xl border border-[#C6A062]/20 bg-black/60 backdrop-blur-lg shadow-[0_0_30px_rgba(198,160,98,0.15)]"
    >
      <h3 className="text-[#C6A062] font-bold mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{desc}</p>
    </motion.div>
  );
}

// ✨ Scroll Hint
function ScrollHint() {
  return (
    <motion.div
      animate={{ y: [0, 10, 0], opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.2 }}
      className="text-gray-400 text-sm mt-4"
    >
      scroll down
    </motion.div>
  );
}

// 💥 Bubble burst
function BubbleBurst() {
  return (
    <>
      {[...Array(8)].map((_, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1.5, opacity: 0, x: (Math.random() - 0.5) * 200, y: (Math.random() - 0.5) * 200 }}
          transition={{ duration: 0.6 }}
          className="absolute w-3 h-3 bg-[#C6A062] rounded-full"
        />
      ))}
    </>
  );
}

// 🔐 Gmail OAuth Card
function GmailCard({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 flex items-center justify-center bg-black/90 backdrop-blur-md z-50">
      <motion.div initial={{ scale: 0.6, y: 50 }} animate={{ scale: 1, y: 0 }} className="w-[420px] md:w-[520px] p-12 rounded-3xl bg-[#151419] border border-[#C6A062]/40 shadow-[0_0_100px_rgba(198,160,98,0.4)] text-center">
        <h2 className="text-3xl font-bold text-[#C6A062] mb-6">CONNECT GMAIL</h2>
        <button onClick={onSuccess} className="w-full py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition">
          Continue with Google
        </button>
        <p onClick={onClose} className="mt-6 text-gray-400 cursor-pointer">Cancel</p>
      </motion.div>
    </motion.div>
  );
}

// 📊 PIXEL-PERFECT DASHBOARD (MATCHING REFERENCE)
function Dashboard() {
  const [selected, setSelected] = useState(0);

  const emails = [
    { name: "GitHub", subject: "New Issue Assigned", preview: "You have been assigned a new issue...", time: "2 min ago", tag: ["important"], summary: "A new GitHub issue requires your attention.", action: "Review immediately" },
    { name: "LinkedIn", subject: "New Connection Request", preview: "You have a new connection request...", time: "10 min ago", tag: ["social"], summary: "Someone wants to connect with you.", action: "Accept or ignore" },
    { name: "Unknown Sender", subject: "Win ₹1,00,000 now!!!", preview: "Click this link to claim reward...", time: "30 min ago", tag: ["spam"], summary: "Highly suspicious spam detected.", action: "Mark as spam" },
  ];

  const email = emails[selected];

  return (
    <div className="h-screen flex bg-[#0b0b0b] text-gray-200 font-sans">

      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-4">
        <div className="mb-6 font-semibold text-[#C6A062]">SPAMBOX</div>

        <div className="space-y-2 text-sm">
          <div className="bg-white/10 p-2 rounded">Inbox</div>
          <div className="p-2">Drafts</div>
          <div className="p-2">Sent</div>
          <div className="p-2">Junk</div>
          <div className="p-2">Trash</div>
        </div>

        
      </div>

      {/* MAIL LIST */}
      <div className="w-[420px] border-r border-gray-800 p-4">
        <h2 className="text-lg mb-4 text-[#C6A062]">Inbox</h2>

        <input placeholder="Search" className="w-full mb-4 p-2 bg-black border border-gray-800 rounded" />

        {emails.map((e, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            className={`p-4 mb-3 rounded-lg cursor-pointer border ${selected===i?"bg-white/10 border-gray-700":"border-gray-800"}`}
          >
            <div className="flex justify-between text-sm">
              <span className="font-semibold">{e.name}</span>
              <span className="text-gray-500">{e.time}</span>
            </div>
            <div className="text-sm mt-1">{e.subject}</div>
            <div className="text-xs text-gray-500 mt-1">{e.preview}</div>

            <div className="flex gap-2 mt-2">
              {e.tag.map((t,i)=>(
                <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded">{t}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MAIL VIEW */}
      <div className="flex-1 p-6 flex flex-col">
        <div className="border-b border-gray-800 pb-4 mb-4">
          <h3 className="text-lg">{email.subject}</h3>
          <p className="text-sm text-gray-400">{email.name}</p>
        </div>

        <div className="flex-1 text-sm text-gray-300">
          {email.summary}
        </div>

        <div className="mt-4 flex gap-2">
          <input className="flex-1 p-3 bg-black border border-gray-800 rounded" placeholder="Reply..." />
          <button className="px-4 bg-white text-black rounded">Send</button>
        </div>
      </div>

      {/* AI PANEL (YOUR FEATURE) */}
      <div className="w-80 border-l border-gray-800 p-4">
        <h3 className="mb-4 text-[#C6A062]">AI Assistant</h3>

        <div className="space-y-3 text-sm">
          <div className="p-3 bg-black border border-gray-800 rounded">
            <p className="text-gray-500">Summary</p>
            <p>{email.summary}</p>
          </div>

          <div className="p-3 bg-black border border-gray-800 rounded">
            <p className="text-gray-500">Action</p>
            <p>{email.action}</p>
          </div>

          <div className="p-3 bg-black border border-gray-800 rounded">
            <p className="text-gray-500">Priority</p>
            <p>{email.tag[0]}</p>
          </div>
        </div>

        <button className="mt-6 w-full bg-white text-black py-2 rounded">Generate Reply</button>
      </div>
    </div>
  );
}

export default function App() {
  const [done, setDone] = useState(false);
  const [showOAuth, setShowOAuth] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [burst, setBurst] = useState(false);

  const handleClick = () => {
    setBurst(true);
    setTimeout(() => {
      setBurst(false);
      setShowOAuth(true);
    }, 500);
  };

  if (loggedIn) return <Dashboard />;

  return (
    <div className="relative min-h-screen bg-[#0A0A0A] text-[#F5E6C8]">
      {!done && <MailIntro onDone={() => setDone(true)} />}

      {done && (
        <>
          <div className="h-screen flex flex-col items-center justify-center text-center">
            <motion.p className="text-[#C6A062] text-xl tracking-widest cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
              EXPLORE
            </motion.p>
            <ScrollHint />
          </div>

          <div className="min-h-screen flex flex-col items-center justify-center px-6 gap-12">
            <div className="grid md:grid-cols-3 gap-10 max-w-5xl">
              <FeatureBox i={0} title="SPAM DETECTION" desc="Detects and filters unwanted emails." />
              <FeatureBox i={1} title="AI SUMMARY" desc="Summarizes emails instantly." />
              <FeatureBox i={2} title="AUTOMATION" desc="Automates workflow." />
            </div>

            {burst && <BubbleBurst />}

            <motion.button whileTap={{ scale: 0.9 }} whileHover={{ scale: 1.05 }} onClick={handleClick} className="mt-10 px-10 py-4 rounded-full border border-[#C6A062] hover:bg-[#C6A062] hover:text-black">
              GET STARTED
            </motion.button>
          </div>
        </>
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

