"use client";

import { useState } from "react";
import Link from "next/link";
import { Droplets, Eye, EyeOff, ShieldCheck, MapPinned, BellRing } from "lucide-react";

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

const SIDE_POINTS = [
  { icon: MapPinned, text: "Reports go straight to the right local authority." },
  { icon: ShieldCheck, text: "Your details are only used to keep you updated." },
  { icon: BellRing, text: "Get notified as your report moves toward resolution." },
];

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof FormState>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (form.fullName.trim().length < 2) {
      nextErrors.fullName = "Enter your full name.";
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number.";
    }
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    // UI skeleton only — no real account is created yet.
    setSubmitting(true);
    window.setTimeout(() => setSubmitting(false), 600);
  }

  return (
    <main className="hydro-lines flex min-h-screen items-center justify-center px-4 py-12">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-surface-line bg-surface-raised shadow-raised lg:grid-cols-[1fr_1.1fr]">
        <div className="hidden flex-col justify-between bg-ink-900 p-10 text-white lg:flex">
          <div>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-teal-300">
              <Droplets className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <h2 className="mt-6 font-display text-2xl font-semibold leading-snug">
              Join citizens keeping their neighbourhood&apos;s water flowing.
            </h2>
          </div>
          <ul className="space-y-4">
            {SIDE_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm text-white/80">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" strokeWidth={2} />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 sm:p-10">
          <h1 className="font-display text-xl font-semibold text-ink-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-ink-700/60">
            It only takes a minute.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-ink-800">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                placeholder="Ananya Sharma"
                aria-invalid={!!errors.fullName}
                className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/35 focus:border-teal-500 ${
                  errors.fullName ? "border-status-critical" : "border-surface-line"
                }`}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-status-critical" role="alert">{errors.fullName}</p>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="98765 43210"
                  aria-invalid={!!errors.phone}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/35 focus:border-teal-500 ${
                    errors.phone ? "border-status-critical" : "border-surface-line"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs text-status-critical" role="alert">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink-800">
                  Email <span className="font-normal text-ink-700/45">(Optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-700/35 focus:border-teal-500 ${
                    errors.email ? "border-status-critical" : "border-surface-line"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-status-critical" role="alert">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-ink-800">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-sm text-ink-900 placeholder:text-ink-700/35 focus:border-teal-500 ${
                    errors.password ? "border-status-critical" : "border-surface-line"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-ink-700/50 hover:text-ink-900"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-status-critical" role="alert">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-ink-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-70"
            >
              {submitting ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-700/70">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink-900 underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
