import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { AuthCardShell } from "./AuthCardShell";

interface Props {
  onLoggedIn: (email: string) => void;
  onGoogle: () => void;
  onSwitchToSignUp: () => void;
}

export function LoginScreen({ onLoggedIn, onGoogle, onSwitchToSignUp }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    setLoading(true);
    onLoggedIn(email.trim());
  };

  return (
    <AuthCardShell>
      <div className="animate-fade-up space-y-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Login</h2>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-sm text-foreground/80">
              Email <span className="text-primary">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@yourcompany.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-input bg-card px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-sm text-foreground/80">
                Password <span className="text-primary">*</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setRecoveryMessage(
                    "Password recovery will be available when authentication is connected.",
                  )
                }
                className="text-xs font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-input bg-card px-4 py-3 pr-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/15"
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
          </div>

          <button
            type="submit"
            disabled={!valid || loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Login
          </button>
          {recoveryMessage && (
            <p role="status" className="text-xs leading-relaxed text-muted-foreground">
              {recoveryMessage}
            </p>
          )}
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
          Continue with Google
        </button>

        <p className="pt-2 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignUp}
            className="font-semibold text-primary hover:underline"
          >
            Sign up
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
