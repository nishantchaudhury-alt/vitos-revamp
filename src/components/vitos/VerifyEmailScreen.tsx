import { useEffect, useRef, useState } from "react";
import { AuthCardShell } from "./AuthCardShell";

interface Props {
  email: string;
  onVerified: () => void;
  onBack: () => void;
}

const CORRECT_CODE = "123456"; // prototype

export function VerifyEmailScreen({ email, onVerified, onBack }: Props) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);
  const [resentMsg, setResentMsg] = useState(false);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const submit = (code: string) => {
    if (code === CORRECT_CODE) {
      setStatus("success");
      setTimeout(() => onVerified(), 500);
    } else {
      setStatus("error");
      setError("Incorrect code, try again.");
      setTimeout(() => {
        setDigits(Array(6).fill(""));
        setStatus("idle");
        refs.current[0]?.focus();
      }, 600);
    }
  };

  const handleChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (error) setError(null);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === 6) submit(next.join(""));
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    text.split("").forEach((c, i) => (next[i] = c));
    setDigits(next);
    if (text.length === 6) submit(text);
    else refs.current[text.length]?.focus();
  };

  const resend = () => {
    if (resendIn > 0) return;
    setResendIn(30);
    setResentMsg(true);
    setTimeout(() => setResentMsg(false), 2000);
  };

  return (
    <AuthCardShell>
      <div className="animate-fade-up space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            Check your inbox
          </h2>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>.
            Enter it below.
          </p>
          <p className="text-xs text-muted-foreground/80">
            (Prototype hint: code is <span className="font-mono">123456</span>)
          </p>
        </div>

        <div
          className={`flex justify-between gap-2 ${status === "error" ? "animate-shake" : ""}`}
          onPaste={handlePaste}
        >
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              inputMode="numeric"
              aria-label={`Verification code digit ${i + 1}`}
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`h-12 w-11 rounded-lg border bg-card text-center text-lg font-semibold outline-none transition focus:ring-2 ${
                status === "success"
                  ? "border-[color:var(--success)] text-[color:var(--success)] ring-[color:var(--success)]/30"
                  : status === "error"
                    ? "border-destructive text-destructive"
                    : "border-input text-foreground focus:border-primary focus:ring-primary/20"
              }`}
            />
          ))}
        </div>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground"
          >
            Wrong email? Go back
          </button>
          <button
            type="button"
            onClick={resend}
            disabled={resendIn > 0}
            className={`font-medium ${
              resendIn > 0
                ? "cursor-not-allowed text-muted-foreground"
                : "text-primary hover:underline"
            }`}
          >
            {resentMsg ? "Code resent!" : resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
          </button>
        </div>
      </div>
    </AuthCardShell>
  );
}
