// @ts-nocheck

declare module "react" {
  export const useEffect: any;
  export const useState: any;
  const React: any;
  export default React;
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module "framer-motion" {
  export const motion: any;
  export const AnimatePresence: any;
}

declare module "lucide-react" {
  export const Mail: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

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
  const [activeAiTab, setActiveAiTab] = useState<string | null>(null);
  const [panelSizes, setPanelSizes] = useState([28, 42, 30]);
  const [replyDraft, setReplyDraft] = useState("");
  const [replyStatus, setReplyStatus] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [resizeState, setResizeState] = useState<null | {
    gutter: number;
    startX: number;
    startSizes: number[];
  }>(null);
  const mainPanelRef = React.useRef<any>(null);
  const [inboxEmails, setInboxEmails] = useState<Array<{
    name: string;
    email: string;
    subject: string;
    preview: string;
    time: string;
    tag: string[];
    summary: string;
    action: string;
    threadId: string;
    messageId: string;
  }>>([]);

  const fallbackEmails = [
    {
      name: "GitHub",
      email: "notifications@github.com",
      subject: "New Issue Assigned",
      preview: "You have been assigned a new issue...",
      time: "2 min ago",
      tag: ["important"],
      summary: "A new GitHub issue requires your attention.",
      action: "Review immediately",
      threadId: "thread-github-001",
      messageId: "<github-message-001@spambox.local>",
    },
    {
      name: "LinkedIn",
      email: "messages-noreply@linkedin.com",
      subject: "New Connection Request",
      preview: "You have a new connection request...",
      time: "10 min ago",
      tag: ["social"],
      summary: "Someone wants to connect with you.",
      action: "Accept or ignore",
      threadId: "thread-linkedin-001",
      messageId: "<linkedin-message-001@spambox.local>",
    },
    {
      name: "Unknown Sender",
      email: "unknown.sender@example.com",
      subject: "Win ₹1,00,000 now!!!",
      preview: "Click this link to claim reward...",
      time: "30 min ago",
      tag: ["spam"],
      summary: "Highly suspicious spam detected.",
      action: "Mark as spam",
      threadId: "thread-spam-001",
      messageId: "<spam-message-001@spambox.local>",
    },
  ];

  useEffect(() => {
    let cancelled = false;

    const loadInbox = async () => {
      try {
        const response = await fetch("/api/gmail/inbox?limit=15");
        const payload = await response.json().catch(() => null);

        if (!response.ok || !Array.isArray(payload?.emails) || cancelled) {
          return;
        }

        const mappedEmails = payload.emails.map((item: any) => ({
          name: item.sender || item.senderEmail || "Unknown Sender",
          email: item.replyToEmail || item.senderEmail || "",
          subject: item.subject || "(no subject)",
          preview: item.preview || "",
          time: item.time || "",
          tag: [item.senderEmail ? "inbox" : "message"],
          summary: item.preview || item.subject || "No preview available.",
          action: "Generate AI response",
          threadId: item.threadId || "",
          messageId: item.messageId || item.id || "",
        }));

        if (mappedEmails.length && !cancelled) {
          setInboxEmails(mappedEmails);
        }
      } catch {
        // Keep the fallback cards if inbox loading fails.
      }
    };

    loadInbox();

    return () => {
      cancelled = true;
    };
  }, []);

  const emails = inboxEmails.length > 0 ? inboxEmails : fallbackEmails;
  const email = emails[selected];
  const replySubject = email.subject.toLowerCase().startsWith("re:") ? email.subject : `Re: ${email.subject}`;

  const clampSizes = (sizes: number[]) => {
    const clamped = sizes.map((size) => Math.max(18, Math.min(60, size)));
    const total = clamped.reduce((sum, size) => sum + size, 0);
    return clamped.map((size) => (size / total) * 100);
  };

  const startResize = (gutter: number, event: React.MouseEvent) => {
    if (!mainPanelRef.current) {
      return;
    }

    setResizeState({
      gutter,
      startX: event.clientX,
      startSizes: panelSizes,
    });

    event.preventDefault();
  };

  useEffect(() => {
    if (!resizeState) {
      return;
    }

    const onMove = (event: MouseEvent) => {
      const container = mainPanelRef.current;
      if (!container) {
        return;
      }

      const containerWidth = container.getBoundingClientRect().width;
      if (!containerWidth) {
        return;
      }

      const deltaPercent = ((event.clientX - resizeState.startX) / containerWidth) * 100;
      const nextSizes = [...resizeState.startSizes];

      if (resizeState.gutter === 0) {
        nextSizes[0] = resizeState.startSizes[0] + deltaPercent;
        nextSizes[1] = resizeState.startSizes[1] - deltaPercent;
      } else {
        nextSizes[1] = resizeState.startSizes[1] + deltaPercent;
        nextSizes[2] = resizeState.startSizes[2] - deltaPercent;
      }

      setPanelSizes(clampSizes(nextSizes));
    };

    const onUp = () => setResizeState(null);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [resizeState]);

  const whySpamReasons =
    email.tag.includes("spam")
      ? [
          "Sender looks unfamiliar or spoofed.",
          "Message style is urgent and pushes a click.",
          "Subject contains reward bait and pressure language.",
        ]
      : [
          "The current message does not match the spam pattern score.",
          "No obvious phishing language or suspicious links were detected in the preview.",
          "You can switch to another mail to inspect its spam signals.",
        ];

  const aiTabs = [
    { id: "reply", label: "AI Reply" },
    { id: "summary", label: "AI Summary" },
    { id: "spam", label: "Why Spam" },
  ];

  const renderAiContent = () => {
    if (!activeAiTab) {
      return (
        <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-gray-700 bg-black/30 p-6 text-center text-sm text-gray-500">
          Pick a mode below to render the AI panel.
        </div>
      );
    }

    if (activeAiTab === "reply") {
      return (
        <div className="space-y-4">
          <textarea
            className="min-h-[220px] w-full rounded-2xl border border-gray-800 bg-black p-4 text-sm text-gray-200 outline-none focus:border-[#C6A062]"
            placeholder="Draft a reply or generate one from the current email..."
            value={replyDraft}
            onChange={(event) => setReplyDraft(event.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
              onClick={generateReply}
              disabled={isGeneratingReply}
            >
              {isGeneratingReply ? "Generating..." : "Generate AI Response"}
            </button>
            <button
              className="rounded-full border border-[#C6A062] px-4 py-2 text-sm font-semibold text-[#C6A062] disabled:opacity-60"
              onClick={sendReply}
              disabled={isSendingReply || !replyDraft.trim()}
            >
              {isSendingReply ? "Sending..." : "Send AI Response"}
            </button>
          </div>
          {replyStatus && <p className="text-xs leading-5 text-gray-400">{replyStatus}</p>}
        </div>
      );
    }

    if (activeAiTab === "summary") {
      return (
        <div className="space-y-3">
          <div className="rounded-2xl border border-gray-800 bg-black p-4 text-sm text-gray-300">
            {email.summary}
          </div>
          <div className="rounded-2xl border border-gray-800 bg-black/50 p-4 text-xs leading-6 text-gray-500">
            Subject: {email.subject}
            <br />
            Preview: {email.preview || "No preview available."}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {whySpamReasons.map((reason, index) => (
          <div key={index} className="rounded-2xl border border-gray-800 bg-black p-4 text-sm text-gray-300">
            {reason}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    setReplyDraft("");
    setReplyStatus(null);
    setActiveAiTab(null);
  }, [selected]);

  const generateReply = async () => {
    setIsGeneratingReply(true);
    setReplyStatus(null);

    try {
      const response = await fetch("/api/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `${email.subject}\n\n${email.preview}`,
          message: `${email.subject}\n\n${email.preview}`,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setReplyStatus(payload?.error || "Failed to generate AI response.");
        return;
      }

      const generatedReply = String(payload?.text ?? payload?.ai_response ?? payload?.reply ?? "").trim();
      setReplyDraft(generatedReply);
      setReplyStatus(generatedReply ? "AI response generated." : "The API returned an empty response.");
    } catch (error) {
      setReplyStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const sendReply = async () => {
    const replyBody = replyDraft.trim();
    if (!replyBody) {
      setReplyStatus("Generate or type a reply before sending.");
      return;
    }

    setIsSendingReply(true);
    setReplyStatus(null);

    try {
      const response = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: email.email,
          subject: replySubject,
          body: replyBody,
          threadId: email.threadId,
          inReplyTo: email.messageId,
          references: email.messageId,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setReplyStatus(payload?.error || "Failed to send the reply.");
        return;
      }

      setReplyStatus("Reply sent successfully.");
    } catch (error) {
      setReplyStatus(error instanceof Error ? error.message : String(error));
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0b0b0b] text-gray-200 font-sans overflow-hidden">

      {/* LEFT SIDEBAR */}
      <div className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4">
        <div data-testid="sidebar-brand" className="font-semibold text-[#C6A062]">
          SPAMBOX
        </div>

        <div className="space-y-2 text-sm">
          <div className="bg-white/10 p-2 rounded">Inbox</div>
          <div className="p-2">Drafts</div>
          <div className="p-2">Sent</div>
          <div className="p-2">Junk</div>
          <div className="p-2">Trash</div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-800 text-xs text-gray-500 space-y-2">
          <div className="font-semibold text-gray-300">Legal</div>
          <div className="flex flex-col gap-2">
            <a className="text-[#C6A062] hover:text-[#f3d7a2]" href="/privacy" target="_blank" rel="noreferrer">
              Privacy Policy
            </a>
            <a className="text-[#C6A062] hover:text-[#f3d7a2]" href="/terms" target="_blank" rel="noreferrer">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>

      <div ref={mainPanelRef} className="flex min-w-0 flex-1">
        {/* MAIL LIST */}
        <div
          className="min-w-[260px] border-r border-gray-800 p-4"
          style={{ flexBasis: `${panelSizes[0]}%` }}
        >
          <h2 className="text-lg mb-4 text-[#C6A062]">Inbox</h2>

          <input placeholder="Search" className="w-full mb-4 p-2 bg-black border border-gray-800 rounded" />

          <div className="h-[calc(100vh-120px)] overflow-y-auto pr-1">
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
        </div>

        <div
          className="group hidden w-2 cursor-col-resize items-stretch justify-center bg-transparent md:flex"
          onMouseDown={(event) => startResize(0, event)}
        >
          <div className="w-px bg-gray-800 transition group-hover:bg-[#C6A062]" />
        </div>

        {/* MAIL VIEW */}
        <div
          className="min-w-[320px] border-r border-gray-800 p-6 flex flex-col"
          style={{ flexBasis: `${panelSizes[1]}%` }}
        >
          <div className="border-b border-gray-800 pb-4 mb-4">
            <h3 className="text-lg">{email.subject}</h3>
            <p className="text-sm text-gray-400">{email.name}</p>
          </div>

          <div className="flex-1 rounded-2xl border border-gray-800 bg-black/20 p-5 text-sm text-gray-300">
            {email.summary}
          </div>

          <div className="mt-4 rounded-2xl border border-gray-800 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Quick reply</p>
            <div className="mt-3 flex gap-2">
              <input
                className="flex-1 rounded-xl border border-gray-800 bg-black p-3 text-sm outline-none focus:border-[#C6A062]"
                placeholder="Reply..."
                value={replyDraft}
                onChange={(event) => setReplyDraft(event.target.value)}
              />
              <button
                className="rounded-xl bg-white px-4 text-black"
                onClick={sendReply}
                disabled={isSendingReply}
              >
                {isSendingReply ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>

        <div
          className="group hidden w-2 cursor-col-resize items-stretch justify-center bg-transparent md:flex"
          onMouseDown={(event) => startResize(1, event)}
        >
          <div className="w-px bg-gray-800 transition group-hover:bg-[#C6A062]" />
        </div>

        {/* AI PANEL (YOUR FEATURE) */}
        <div
          className="min-w-[360px] p-4"
          style={{ flexBasis: `${panelSizes[2]}%` }}
        >
          <div className="flex h-full flex-col rounded-3xl border border-gray-800 bg-black/40 p-4 shadow-[0_0_40px_rgba(0,0,0,0.35)]">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[#C6A062]">AI Assistant</h3>
                <p className="text-xs text-gray-500">Click a mode to render its content.</p>
              </div>
              <div className="rounded-full border border-gray-800 px-3 py-1 text-xs text-gray-500">
                {email.tag[0] || "inbox"}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {aiTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAiTab(tab.id)}
                  className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${activeAiTab === tab.id ? "border-[#C6A062] bg-[#C6A062] text-black" : "border-gray-800 bg-black text-gray-300 hover:border-[#C6A062]/60"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {renderAiContent()}
            </div>
          </div>
        </div>
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

