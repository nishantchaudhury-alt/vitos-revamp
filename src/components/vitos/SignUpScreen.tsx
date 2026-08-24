import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthCardShell } from "./AuthCardShell";

interface Props {
  onContinue: (email: string) => void;
  onGoogle: () => void;
  onSwitchToLogin?: () => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "rocketmail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "pm.me",
  "gmx.com",
  "gmx.net",
  "zoho.com",
  "yandex.com",
  "yandex.ru",
  "mail.com",
  "mail.ru",
  "tutanota.com",
  "fastmail.com",
  "rediffmail.com",
]);

function validateWorkEmail(email: string): string | null {
  if (!emailRegex.test(email)) return "Please enter a valid email address";
  const domain = email.split("@")[1]?.toLowerCase().trim();
  if (!domain) return "Please enter a valid email address";
  if (FREE_EMAIL_DOMAINS.has(domain))
    return "Please use your work email — personal addresses aren't supported";
  return null;
}

export function SignUpScreen({ onContinue, onGoogle, onSwitchToLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const valid = validateWorkEmail(email) === null && password.length >= 8;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    setTimeout(() => onContinue(email), 300);
  };

  return (
    <AuthCardShell>
      <div className="animate-fade-up space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Sign up</h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-sm text-foreground/80">
              Email <span className="text-primary">*</span>
            </label>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailErr) setEmailErr(null);
              }}
              onBlur={() => {
                if (email) setEmailErr(validateWorkEmail(email));
              }}
              placeholder="name@yourcompany.com"
              autoComplete="email"
              required
              className={`w-full rounded-lg border bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                emailErr ? "border-destructive" : "border-input"
              }`}
            />
            {emailErr && <p className="text-xs text-destructive">{emailErr}</p>}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="signup-password" className="text-sm text-foreground/80">
              Password <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (pwErr) setPwErr(null);
                }}
                onBlur={() => {
                  if (password && password.length < 8)
                    setPwErr("Password must be at least 8 characters");
                }}
                placeholder="Enter password"
                autoComplete="new-password"
                required
                className={`w-full rounded-lg border bg-card px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15 ${
                  pwErr ? "border-destructive" : "border-input"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
            {pwErr && <p className="text-xs text-destructive">{pwErr}</p>}
          </div>

          <button
            type="submit"
            disabled={!valid || loading}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition active:scale-[0.99] ${
              valid && !loading ? "hover:opacity-90" : "cursor-not-allowed opacity-40"
            }`}
            style={{ cursor: valid && !loading ? "pointer" : "not-allowed" }}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">Or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <button
          onClick={onGoogle}
          type="button"
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-card px-4 py-3 text-sm font-medium text-foreground transition hover:bg-hover active:scale-[0.99]"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="pt-2 text-sm text-muted-foreground">
          Have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-semibold text-primary hover:underline"
          >
            Login
          </button>
        </p>
      </div>
    </AuthCardShell>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.5-5.9 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.1l6.6 4.8C14.6 15.3 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.1z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3C29.5 34.8 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.3C41.2 36 44 30.5 44 24c0-1.3-.1-2.3-.4-3.5z"
      />
    </svg>
  );
}
