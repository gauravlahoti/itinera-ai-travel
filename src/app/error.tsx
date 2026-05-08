"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  const router = useRouter();

  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex h-screen flex-col items-center justify-center bg-background text-center px-6 space-y-5"
    >
      <h1 className="font-serif text-3xl text-primary">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Try again
        </button>
        <button
          onClick={() => router.push("/")}
          className="px-5 py-2.5 border rounded-xl text-sm font-medium hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Back to home
        </button>
      </div>
    </div>
  );
}
