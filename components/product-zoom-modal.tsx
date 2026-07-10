"use client";

import { useEffect, useState } from "react";

type ProductZoomModalProps = {
  image: string | null;
  title: string;
  tag: string;
  description: string;
  onClose: () => void;
};

export function ProductZoomModal({
  image,
  title,
  tag,
  description,
  onClose
}: ProductZoomModalProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!image) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [image, onClose]);

  if (!image) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-[#2f2a28e8] p-3 sm:p-5" onClick={onClose}>
      <div
        className="mx-auto flex h-full w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.26)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3 sm:px-6">
          <button
            className="inline-flex items-center rounded-full border border-ink/10 px-4 py-2 text-sm font-semibold text-navy transition hover:bg-[#f7f4ee]"
            onClick={onClose}
            type="button"
          >
            Back
          </button>
          <p className="max-w-[55%] truncate text-center text-sm font-medium text-slate sm:text-base">{title}</p>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-lg text-white"
            onClick={onClose}
            type="button"
          >
            x
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[1.12fr_0.88fr]">
          <div
            className="relative min-h-[42vh] bg-[#f3efe8] sm:min-h-[50vh] lg:min-h-0"
            onMouseMove={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              const x = ((event.clientX - rect.left) / rect.width) * 100;
              const y = ((event.clientY - rect.top) / rect.height) * 100;
              setPosition({ x, y });
            }}
          >
            <div
              className="absolute inset-0 transition-transform duration-75"
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: `${position.x}% ${position.y}%`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "170%"
              }}
            />
            <div className="absolute left-4 top-4 rounded-full bg-[#2f2a28cc] px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white sm:left-6 sm:top-6">
              Hover to zoom
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5 sm:p-8 lg:p-10">
            <p className="text-xs uppercase tracking-[0.3em] text-bronze">{tag}</p>
            <h3 className="mt-4 text-[2rem] font-semibold leading-[0.95] tracking-[-0.06em] text-navy sm:text-[2.6rem] lg:text-5xl">
              {title}
            </h3>
            <p className="mt-5 text-sm leading-7 text-slate sm:text-base sm:leading-8">{description}</p>

          </div>
        </div>
      </div>
    </div>
  );
}
