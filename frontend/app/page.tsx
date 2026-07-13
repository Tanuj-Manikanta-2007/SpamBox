"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";

/* ---------------- INTRO ---------------- */
function MailIntro({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), 2200);
    return () => clearTimeout(t);
  }, [onDone]);

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
          onClick={() => {
            // Hand off to Django allauth Google login
            window.location.href = "/accounts/google/login/?process=login";
          }}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black rounded-xl font-semibold hover:scale-105 transition"
        >
             <span className="w-5 h-5 grid place-items-center rounded bg-gray-600 text-white text-xs font-bold">
               G
             </span>
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
function SpamChecker({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<{
    prediction: string;
    confidence: number;
    spam_probability?: number;
    ham_probability?: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    const input = text.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const resp = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to check spam");
        return;
      }

      setResult({
        prediction: data?.prediction ?? "",
        confidence: Number(data?.confidence ?? 0),
        spam_probability: data?.spam_probability,
        ham_probability: data?.ham_probability,
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
        className="mt-4 px-6 py-3 bg-[#C6A062] text-black rounded-lg disabled:opacity-60"
      >
        {loading ? "Checking..." : "Check"}
      </button>

      {error && (
        <div className="mt-4 p-4 border border-red-500/40 rounded bg-black text-red-200">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 border border-gray-800 rounded bg-black">
          <p>Prediction: {result.prediction}</p>
          <p>Confidence: {result.confidence}</p>
          {typeof result.spam_probability === "number" && (
            <p>Spam probability: {result.spam_probability}</p>
          )}
          {typeof result.ham_probability === "number" && (
            <p>Ham probability: {result.ham_probability}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- AI SUMMARY ---------------- */
function SummaryPage({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const input = text.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setSummary("");

    try {
      const resp = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to generate summary");
        return;
      }

      setSummary(String(data?.text ?? data?.summary ?? ""));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
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
        disabled={loading}
        className="mt-4 px-6 py-3 bg-[#C6A062] text-black rounded-lg disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Summary"}
      </button>

      {error && (
        <div className="mt-4 p-4 border border-red-500/40 rounded bg-black text-red-200">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-6 p-4 border border-gray-800 rounded bg-black">
          <h3 className="text-[#C6A062] mb-2">Summary:</h3>
          <p className="text-gray-300 whitespace-pre-wrap min-h-40">{summary}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- AI RESPONSE ---------------- */
function ResponsePage({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    const input = text.trim();
    if (!input) return;

    setLoading(true);
    setError(null);
    setReply("");

    try {
      const resp = await fetch("/api/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to generate response");
        return;
      }

      setReply(String(data?.text ?? data?.ai_response ?? data?.reply ?? ""));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 p-10">
      <button onClick={onBack} className="mb-6 text-gray-400">← Back</button>

      <h1 className="text-3xl text-[#C6A062] mb-6">AI Email Response</h1>

      <textarea
        className="w-full h-40 p-4 bg-black border border-gray-800 rounded-lg"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste email content..."
      />

      <button
        onClick={handleGenerate}
        disabled={loading}
        className="mt-4 px-6 py-3 bg-[#C6A062] text-black rounded-lg disabled:opacity-60"
      >
        {loading ? "Generating..." : "Generate Response"}
      </button>

      {error && (
        <div className="mt-4 p-4 border border-red-500/40 rounded bg-black text-red-200">
          {error}
        </div>
      )}

      {reply && (
        <div className="mt-6 p-4 border border-gray-800 rounded bg-black">
          <h3 className="text-[#C6A062] mb-2">Response:</h3>
          <p className="text-gray-300 whitespace-pre-wrap min-h-40">{reply}</p>
        </div>
      )}
    </div>
  );
}

/* ---------------- DASHBOARD ---------------- */
function Dashboard({ onBack, onLogout }: { onBack: () => void; onLogout: () => void }) {
  const [selectedEmail, setSelectedEmail] = useState<{ id?: string; sender: string; subject: string; preview: string; time: string } | null>(null);
  const [emails, setEmails] = useState<{ id?: string; sender: string; subject: string; preview: string; time: string }[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<{ id?: string; sender: string; subject: string; preview: string; time: string }[]>([]);
  const [spamById, setSpamById] = useState<Record<string, { prediction: string; confidence: number }>>({});
  const [spamData, setSpamData] = useState<{
    prediction: string;
    confidence: number;
    spam_probability?: number;
    ham_probability?: number;
  } | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [whySpam, setWhySpam] = useState<string>("");
  const [reply, setReply] = useState<string>("");
  const [replyTone, setReplyTone] = useState<"formal" | "casual" | "professional">( "professional");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [whyLoading, setWhyLoading] = useState(false);
  const [replyLoading, setReplyLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [editableReply, setEditableReply] = useState("");
  const [pageOffset, setPageOffset] = useState(0);

  const SPAM_THRESHOLD = 0.75;

  const isHighSpam = Boolean(
    spamData &&
      (
        (typeof spamData.spam_probability === "number" && spamData.spam_probability >= SPAM_THRESHOLD) ||
        String(spamData.prediction || "").toLowerCase().includes("spam")
      )
  );

  // Filter emails based on search query
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredEmails(emails);
    } else {
      setFilteredEmails(
        emails.filter(
          (email) =>
            email.sender.toLowerCase().includes(query) ||
            email.subject.toLowerCase().includes(query) ||
            email.preview.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, emails]);

  const loadInbox = async (offset = 0) => {
    try {
      const resp = await fetch(`/api/gmail/inbox?limit=15&offset=${offset}`);
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to load inbox");
        return;
      }
      const list = Array.isArray(data?.emails) ? data.emails : [];
      
      if (offset === 0) {
        setEmails(list);
      } else {
        setEmails((prev) => [...prev, ...list]);
      }

      // Kick off spam classification for each email
      const updates: Record<string, { prediction: string; confidence: number }> = {};
      await Promise.all(
        list.map(async (email: any) => {
          const emailId = String(email?.id || "");
          if (!emailId || spamById[emailId]) return; // Skip if already analyzed
          try {
            const text = `${email?.subject ?? ""}\n\n${email?.preview ?? ""}`.trim();
            if (!text) return;
            const predictResp = await fetch("/api/predict", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            const predictData = await predictResp.json().catch(() => null);
            if (!predictResp.ok) return;
            updates[emailId] = {
              prediction: String(predictData?.prediction ?? ""),
              confidence: Number(predictData?.confidence ?? 0),
            };
          } catch {
            // ignore per-email failures
          }
        })
      );

      setSpamById((prev) => ({ ...prev, ...updates }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  useEffect(() => {
    loadInbox(pageOffset);
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedEmail) return;

      const input = `${selectedEmail.subject}\n\n${selectedEmail.preview}`;
      setLoading(true);
      setError(null);
      setSpamData(null);
      setSummary("");
      setWhySpam("");
      setReply("");
      setEditableReply("");
      setIsComposing(false);

      try {
        const predictResp = await fetch("/api/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: input }),
        });

        const predictData = await predictResp.json().catch(() => null);

        if (!predictResp.ok) {
          setError(predictData?.error || "Failed to analyze spam");
          return;
        }

        setSpamData({
          prediction: predictData?.prediction ?? "",
          confidence: Number(predictData?.confidence ?? 0),
          spam_probability: predictData?.spam_probability,
          ham_probability: predictData?.ham_probability,
        });

        const highSpam =
          (typeof predictData?.spam_probability === "number" && predictData.spam_probability >= SPAM_THRESHOLD) ||
          String(predictData?.prediction ?? "").toLowerCase().includes("spam");

        if (highSpam) {
          try {
            const resp = await fetch("/api/summary", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: input }),
            });
            const data = await resp.json().catch(() => null);
            if (resp.ok) {
              setSummary(String(data?.text ?? data?.summary ?? ""));
            }
          } catch {
            // ignore summary failures
          }
        }

        const emailId = String((selectedEmail as any).id || "");
        if (emailId) {
          setSpamById((prev) => ({
            ...prev,
            [emailId]: { prediction: String(predictData?.prediction ?? ""), confidence: Number(predictData?.confidence ?? 0) },
          }));
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedEmail]);

  const generateWhySpam = async () => {
    if (!selectedEmail || !spamData) return;
    if (!isHighSpam) return;

    const emailText = `${selectedEmail.subject}\n\n${selectedEmail.preview}`.trim();
    if (!emailText) return;

    setWhyLoading(true);
    setError(null);
    setWhySpam("");

    const spamProb = typeof spamData.spam_probability === "number" ? spamData.spam_probability : null;
    const conf = typeof spamData.confidence === "number" ? spamData.confidence : null;

    const prompt =
      "You are helping explain a spam classifier result to a user. " +
      "Explain briefly WHY the email is likely spam, using only evidence from the email content. " +
      "Return 4-6 short bullet points. Mention red flags like asking for money, urgency, suspicious links, impersonation, prizes, or sensitive info requests when applicable.\n\n" +
      `Model output: prediction=${spamData.prediction}${conf !== null ? `, confidence=${conf}` : ""}${spamProb !== null ? `, spam_probability=${spamProb}` : ""}.\n\n` +
      `EMAIL:\n${emailText}`;

    try {
      const resp = await fetch("/api/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to generate spam explanation");
        return;
      }
      setWhySpam(String(data?.text ?? data?.ai_response ?? data?.reply ?? ""));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setWhyLoading(false);
    }
  };

  const generateReply = async () => {
    if (!selectedEmail) return;

    const emailText = `${selectedEmail.subject}\n\n${selectedEmail.preview}`.trim();
    if (!emailText) return;

    setReplyLoading(true);
    setError(null);
    setReply("");

    const tonePrompt = {
      formal: "Write a formal professional reply.",
      casual: "Write a casual friendly reply.",
      professional: "Write a professional reply.",
    }[replyTone];

    const prompt = `${tonePrompt} Keep it concise (2-3 sentences). Reply to:\n\nSUBJECT: ${selectedEmail.subject}\n\nEMAIL:\n${emailText}`;

    try {
      const resp = await fetch("/api/ai-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        setError(data?.error || "Failed to generate reply");
        return;
      }
      const generatedReply = String(data?.text ?? data?.ai_response ?? data?.reply ?? "");
      setReply(generatedReply);
      setEditableReply(generatedReply);
      setIsComposing(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setReplyLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!selectedEmail || !editableReply.trim()) return;

    setSendLoading(true);
    setError(null);

    try {
      const resp = await fetch("/api/gmail/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: selectedEmail.sender.match(/[^\s<>]+@[^\s<>]+/)?.[0] || selectedEmail.sender,
          subject: `Re: ${selectedEmail.subject}`,
          body: editableReply,
        }),
      });

      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setError(data?.message || "Failed to send email");
        return;
      }

      // Success!
      setSummary("");
      setWhySpam("");
      setReply("");
      setEditableReply("");
      setIsComposing(false);
      setError(null);
      // Show success message (optional)
      setTimeout(() => {
        setSelectedEmail(null);
        loadInbox(0); // Reload inbox
      }, 1500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0b0b0b] text-gray-200 overflow-hidden">

      <div className="w-64 border-r border-gray-800 p-4 flex flex-col gap-4">
        {/* Clean header with Back and Logout */}
        <div className="flex items-center justify-between gap-2 p-3 rounded-xl border border-[#C6A062]/20 bg-black/40">
          <button
            onClick={onBack}
            className="px-3 py-1 rounded-lg border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 text-sm"
          >
            ← Back
          </button>
          <button
            onClick={onLogout}
            className="px-3 py-1 rounded-lg border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 text-sm"
          >
            Logout
          </button>
        </div>

        {/* Search field */}
        <input
          type="text"
          placeholder="Search emails..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-black border border-gray-800 text-gray-200 text-sm placeholder-gray-600 focus:outline-none focus:border-[#C6A062]/50"
        />

        {selectedEmail && isHighSpam && (
          <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[#C6A062] font-bold text-sm">WHY THIS LOOKS LIKE SPAM</h3>
              <button
                onClick={generateWhySpam}
                disabled={whyLoading}
                className="px-2 py-1 rounded text-xs border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 disabled:opacity-60"
              >
                {whyLoading ? "..." : "Why?"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 text-[#C6A062] font-bold">
          INBOX ({filteredEmails.length})
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredEmails.map((email, i) => (
            <div
              key={i}
              onClick={() => setSelectedEmail(email)}
              className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-white/5 transition ${
                selectedEmail?.sender === email.sender && selectedEmail?.subject === email.subject
                  ? "bg-white/10"
                  : ""
              }`}
            >
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  {email.id && spamById[email.id] ? (
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded border text-xs font-bold ${
                        String(spamById[email.id]?.prediction || "").toLowerCase().includes("spam")
                          ? "border-red-500/60 text-red-300"
                          : "border-green-500/60 text-green-300"
                      }`}
                      title={`Prediction: ${spamById[email.id]?.prediction}`}
                    >
                      {String(spamById[email.id]?.prediction || "").toLowerCase().includes("spam") ? "✗" : "✓"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded border border-gray-700 text-gray-500 text-xs">
                      …
                    </span>
                  )}
                  <span className="text-sm truncate">{email.sender}</span>
                </div>
                <span className="text-xs text-gray-500">{email.time}</span>
              </div>
              <div className="text-sm truncate">{email.subject}</div>
              <div className="text-xs text-gray-500 truncate">{email.preview}</div>
            </div>
          ))}
        </div>

        {/* Load More button for pagination */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => {
              setPageOffset((prev) => prev + 15);
              loadInbox(pageOffset + 15);
            }}
            className="w-full px-4 py-2 rounded-lg border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 text-sm transition"
          >
            Load More Emails
          </button>
        </div>
      </div>

      <div className="w-96 p-4 h-full overflow-y-auto">
        {!selectedEmail ? (
          <div className="h-full flex items-center justify-center text-gray-600">
            Select an email
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              {isHighSpam && (
                <button
                  onClick={async () => {
                    const input = `${selectedEmail.subject}\n\n${selectedEmail.preview}`.trim();
                    if (!input) return;
                    setLoading(true);
                    setError(null);
                    setSummary("");
                    try {
                      const resp = await fetch("/api/summary", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: input }),
                      });
                      const data = await resp.json().catch(() => null);
                      if (!resp.ok) {
                        setError(data?.error || "Failed to summarize");
                        return;
                      }
                      setSummary(String(data?.text ?? data?.summary ?? ""));
                    } catch (e: unknown) {
                      setError(e instanceof Error ? e.message : String(e));
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-3 py-2 rounded text-sm border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5"
                >
                  Summary
                </button>
              )}

              <button
                onClick={generateReply}
                disabled={replyLoading}
                className="px-3 py-2 rounded text-sm border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 disabled:opacity-60"
              >
                {replyLoading ? "Generating..." : "AI Reply"}
              </button>

              {isHighSpam && (
                <button
                  onClick={generateWhySpam}
                  disabled={whyLoading}
                  className="px-3 py-2 rounded text-sm border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 disabled:opacity-60"
                >
                  {whyLoading ? "..." : "Why Spam?"}
                </button>
              )}
            </div>

            {loading && (
              <div className="p-4 rounded-xl border border-gray-800 bg-black/60 text-gray-400 text-sm">
                Loading analysis...
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl border border-red-500/40 bg-black/60 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
              <h3 className="text-[#C6A062] font-bold mb-2 text-sm">SPAM ANALYSIS</h3>
              {!spamData ? (
                <p className="text-xs text-gray-400">—</p>
              ) : (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Prediction: {spamData.prediction}</p>
                  <p>Confidence: {(spamData.confidence * 100).toFixed(0)}%</p>
                  {typeof spamData.spam_probability === "number" && (
                    <p>Spam prob: {(spamData.spam_probability * 100).toFixed(0)}%</p>
                  )}
                </div>
              )}
            </div>

            {isHighSpam && summary && (
              <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
                <h3 className="text-[#C6A062] font-bold mb-2 text-sm">SUMMARY</h3>
                <p className="text-xs text-gray-400 whitespace-pre-wrap">{summary}</p>
              </div>
            )}

            {isHighSpam && whySpam && (
              <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
                <h3 className="text-[#C6A062] font-bold mb-2 text-sm">RED FLAGS</h3>
                <p className="text-xs text-gray-400 whitespace-pre-wrap">{whySpam}</p>
              </div>
            )}

            {isComposing ? (
              <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60 space-y-3">
                <h3 className="text-[#C6A062] font-bold text-sm">COMPOSE REPLY</h3>
                
                <div className="flex gap-2">
                  {(["formal", "casual", "professional"] as const).map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setReplyTone(tone)}
                      className={`px-2 py-1 rounded text-xs border transition ${
                        replyTone === tone
                          ? "border-[#C6A062] bg-[#C6A062]/20 text-[#C6A062]"
                          : "border-gray-700 text-gray-400 hover:border-[#C6A062]/50"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>

                <textarea
                  value={editableReply}
                  onChange={(e) => setEditableReply(e.target.value)}
                  className="w-full p-3 rounded bg-black border border-gray-700 text-gray-200 text-xs focus:outline-none focus:border-[#C6A062]/50 min-h-24"
                />

                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await generateReply();
                    }}
                    disabled={replyLoading}
                    className="flex-1 px-3 py-2 rounded text-xs border border-[#C6A062]/40 text-[#C6A062] hover:bg-white/5 disabled:opacity-60"
                  >
                    {replyLoading ? "..." : "Regenerate"}
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={sendLoading || !editableReply.trim()}
                    className="flex-1 px-3 py-2 rounded text-xs bg-[#C6A062] text-black font-semibold hover:opacity-90 disabled:opacity-60"
                  >
                    {sendLoading ? "Sending..." : "Send"}
                  </button>
                  <button
                    onClick={() => setIsComposing(false)}
                    className="flex-1 px-3 py-2 rounded text-xs border border-gray-700 text-gray-400 hover:border-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : reply ? (
              <div className="p-4 rounded-xl border border-[#C6A062]/30 bg-black/60">
                <h3 className="text-[#C6A062] font-bold mb-2 text-sm">AI REPLY</h3>
                <p className="text-xs text-gray-400 whitespace-pre-wrap mb-3">{reply}</p>
                <button
                  onClick={() => {
                    setEditableReply(reply);
                    setIsComposing(true);
                  }}
                  className="w-full px-3 py-2 rounded text-xs bg-[#C6A062] text-black font-semibold hover:opacity-90"
                >
                  Compose & Send
                </button>
              </div>
            ) : null}
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

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setLoggedIn(false);
      setShowOAuth(false);
      setDone(true);
      setPage("home");
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const resp = await fetch("/api/me");
        const data = await resp.json().catch(() => null);
        const authed = Boolean(data?.authenticated);
        setLoggedIn(authed);
        if (authed) {
          setDone(true);
          setPage("inbox");
        }
      } catch {
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  if (page === "inbox") {
    return <Dashboard onBack={() => setPage("home")} onLogout={handleLogout} />;
  }

  if (page === "spam") {
    return <SpamChecker onBack={() => setPage("home")} />;
  }

  if (page === "summary") {
    return <SummaryPage onBack={() => setPage("home")} />;
  }

  if (page === "response") {
    return <ResponsePage onBack={() => setPage("home")} />;
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
            {(
              loggedIn
                ? [
                    { name: "INBOX", action: () => setPage("inbox") },
                    { name: "SPAM DETECTION", action: () => setPage("spam") },
                    { name: "AI SUMMARY", action: () => setPage("summary") },
                    { name: "AI RESPONSE", action: () => setPage("response") },
                  ]
                : [
                    { name: "SPAM DETECTION", action: () => setPage("spam") },
                    { name: "AI SUMMARY", action: () => setPage("summary") },
                    { name: "AI RESPONSE", action: () => setPage("response") },
                  ]
            ).map((item, i) => (
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

          {!loggedIn ? (
            <button
              onClick={() => setShowOAuth(true)}
              className="px-10 py-4 rounded-full border border-[#C6A062] hover:bg-[#C6A062] hover:text-black transition"
            >
              GET STARTED
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-10 py-4 rounded-full border border-[#C6A062] hover:bg-[#C6A062] hover:text-black transition"
            >
              LOGOUT
            </button>
          )}

        </div>
      )}

      <AnimatePresence>
        {showOAuth && (
          <GmailCard
            onClose={() => setShowOAuth(false)}
            onSuccess={() => {
              setShowOAuth(false);
              setLoggedIn(true);
              setDone(true);
              setPage("inbox");
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}