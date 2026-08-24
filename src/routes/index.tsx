import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { SignUpScreen } from "@/components/vitos/SignUpScreen";
import { LoginScreen } from "@/components/vitos/LoginScreen";
import { VerifyEmailScreen } from "@/components/vitos/VerifyEmailScreen";
import { NameWorkspaceScreen } from "@/components/vitos/NameWorkspaceScreen";
import { BuildSelectScreen } from "@/components/vitos/BuildSelectScreen";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vitos — AI Agent Platform by Kapture CX" },
      {
        name: "description",
        content:
          "Sign up for Vitos and start building AI agents in seconds. No forms, no friction.",
      },
    ],
  }),
});

type Step = "login" | "signup" | "verify" | "name" | "build";

const SESSION_STORAGE_KEY = "vitos-onboarding-session";

type SavedSession = {
  step?: Step;
  email?: string;
  workspaceName?: string;
};

const STEPS: Step[] = ["login", "signup", "verify", "name", "build"];

function getSavedSession(): SavedSession {
  if (typeof window === "undefined") return {};

  try {
    const saved = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved) as SavedSession;
    if (!parsed || typeof parsed !== "object") return {};

    return {
      step: parsed.step && STEPS.includes(parsed.step) ? parsed.step : undefined,
      email: typeof parsed.email === "string" ? parsed.email : undefined,
      workspaceName: typeof parsed.workspaceName === "string" ? parsed.workspaceName : undefined,
    };
  } catch {
    return {};
  }
}

function saveSession(session: SavedSession) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Ignore storage failures so the UI never gets stuck during preview rebuilds.
  }
}

function clearSavedSession() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore storage failures so logout still returns to the login screen.
  }
}

function Index() {
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [step, setStep] = useState<Step>("login");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");

  const goTo = (next: Step) => {
    setStep(next);
  };

  const handleLogout = () => {
    clearSavedSession();
    setEmail("");
    setWorkspaceName("");
    goTo("login");
  };

  const handleCreate = () => {
    goTo("build");
  };

  useEffect(() => {
    try {
      const saved = getSavedSession();
      setStep(saved.step ?? "login");
      setEmail(saved.email ?? "");
      setWorkspaceName(saved.workspaceName ?? "");
    } finally {
      setHasRestoredSession(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredSession) return;

    saveSession({ step, email, workspaceName });
  }, [email, hasRestoredSession, step, workspaceName]);

  if (!hasRestoredSession) {
    return (
      <div className="flex min-h-dvh w-full items-center justify-center bg-background text-primary">
        <Loader2 className="h-6 w-6 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh w-full bg-background">
      {step === "login" && (
        <div key="login" className="animate-slide-in">
          <LoginScreen
            onLoggedIn={(em) => {
              setEmail(em);
              goTo("name");
            }}
            onGoogle={() => {
              setEmail("you@google.com");
              goTo("name");
            }}
            onSwitchToSignUp={() => goTo("signup")}
          />
        </div>
      )}

      {step === "signup" && (
        <div key="signup" className="animate-slide-in">
          <SignUpScreen
            onContinue={(em) => {
              setEmail(em);
              goTo("verify");
            }}
            onGoogle={() => {
              setEmail("you@google.com");
              goTo("name");
            }}
            onSwitchToLogin={() => goTo("login")}
          />
        </div>
      )}

      {step === "verify" && (
        <div key="verify" className="animate-slide-in">
          <VerifyEmailScreen
            email={email}
            onVerified={() => goTo("name")}
            onBack={() => goTo("signup")}
          />
        </div>
      )}

      {step === "name" && (
        <div key="name" className="animate-slide-in">
          <NameWorkspaceScreen
            value={workspaceName}
            onChange={setWorkspaceName}
            onCreate={handleCreate}
            creating={false}
            onLogout={handleLogout}
          />
        </div>
      )}

      {step === "build" && (
        <div key="build" className="animate-slide-in">
          <BuildSelectScreen workspaceName={workspaceName} onLogout={handleLogout} />
        </div>
      )}
    </div>
  );
}
