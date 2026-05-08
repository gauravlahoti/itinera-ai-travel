import Link from "next/link";

export default function NotFound() {
  return (
    <main
      role="main"
      className="flex h-screen flex-col items-center justify-center bg-background text-center px-6 space-y-5"
    >
      <h1 className="font-serif text-5xl text-primary">404</h1>
      <p className="text-muted-foreground">This page doesn&apos;t exist or your trip has expired.</p>
      <Link
        href="/"
        className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Plan a new trip
      </Link>
    </main>
  );
}
