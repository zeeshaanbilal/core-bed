"use client";

import { useId, useState } from "react";

type PasswordInputProps = {
  name: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
  autoComplete?: string;
};

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="2.8" />
      {!visible ? <path d="M4 4l16 16" /> : null}
    </svg>
  );
}

export function PasswordInput({
  name,
  placeholder,
  required,
  defaultValue,
  className = "rounded-2xl border border-ink/10 bg-ivory px-4 py-3",
  autoComplete
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="relative">
      <input
        id={inputId}
        name={name}
        type={visible ? "text" : "password"}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        className={`${className} w-full pr-12`}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate transition hover:text-ink"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-controls={inputId}
      >
        <EyeIcon visible={visible} />
      </button>
    </div>
  );
}
