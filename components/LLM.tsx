"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type AssistantLink = {
  label: string;
  href: string;
};

type AssistantResponse = {
  answer: string;
  suggestions: string[];
  links: AssistantLink[];
};

const starterPrompts = [
  "Recommend a mattress for back support",
  "Show cooling pillow options",
  "What is your delivery and payment flow?",
  "Find accessories for office comfort"
];

function SendIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M4 12h13" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

export default function LLM() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<
    Array<{ role: "assistant" | "user"; text: string; links?: AssistantLink[] }>
  >([
    {
      role: "assistant",
      text: "Ask about products, pricing, firmness, categories, blog guides, delivery, or the latest items added from admin."
    }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendPrompt(prompt: string) {
    const trimmed = prompt.trim();

    if (!trimmed || loading) {
      return;
    }

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: trimmed,
          pathname
        })
      });

      const payload = (await response.json()) as AssistantResponse;
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: payload.answer,
          links: payload.links
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I could not load live store data right now. Please try again in a moment."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="w-[calc(100vw-24px)] max-w-[380px] overflow-hidden rounded-[1.5rem] border border-ink/10 bg-white shadow-[0_30px_90px_rgba(47,42,40,0.18)]">
          <div className="flex items-center justify-between border-b border-ink/8 bg-[#faf8f3] px-4 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-bronze">Corebed Assistant</p>
              <p className="mt-1 text-sm text-slate">Live catalog and guide answers</p>
            </div>
            <button
              className="rounded-full border border-ink/10 px-3 py-2 text-sm text-navy"
              onClick={() => setOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          <div ref={scrollRef} className="max-h-[420px] space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((entry, index) => (
              <div
                key={`${entry.role}-${index}`}
                className={`max-w-[92%] rounded-[1.25rem] px-4 py-3 text-sm leading-7 ${
                  entry.role === "assistant" ? "bg-[#f8f4ec] text-slate" : "ml-auto bg-navy text-white"
                }`}
              >
                <p>{entry.text}</p>
                {entry.links?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.links.map((link) => (
                      <Link
                        key={link.href + link.label}
                        href={link.href}
                        className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-navy"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {loading ? (
              <div className="max-w-[92%] rounded-[1.25rem] bg-[#f8f4ec] px-4 py-3 text-sm text-slate">
                Thinking with live store data...
              </div>
            ) : null}
          </div>

          <div className="border-t border-ink/8 px-4 py-3">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  className="rounded-full border border-ink/10 bg-[#faf8f3] px-3 py-2 text-xs text-navy"
                  onClick={() => void sendPrompt(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                void sendPrompt(message);
              }}
            >
              <input
                className="min-w-0 flex-1 rounded-xl border border-ink/10 px-4 py-3 text-sm outline-none"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about products, guides, support..."
              />
              <button className="rounded-xl bg-navy px-4 py-3 text-white" type="submit">
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      ) : null}

      <button
        className="mt-3 flex items-center gap-2 rounded-full bg-navy px-5 py-4 text-sm font-semibold text-white shadow-[0_20px_45px_rgba(13,76,143,0.22)]"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <span className="text-base">+</span>
        <span>Ask Corebed</span>
      </button>
    </div>
  );
}
