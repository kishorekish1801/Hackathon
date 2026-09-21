"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    phone?: string;
    password?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const nextErrors: {
      phone?: string;
      password?: string;
    } = {};

    // Phone validation
    if (!/^\d{10}$/.test(phone.trim())) {
      nextErrors.phone = "Enter a valid 10-digit phone number.";
    }

    // Password validation
    if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    // Stop if validation failed
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // Temporary UI login
    setSubmitting(true);

    // Later this will be replaced with:
    // POST /api/auth/login

    window.setTimeout(() => {
      router.push("/");
    }, 600);
  }

  return (
    <main className="min-h-screen bg-[#f3f8fc] px-4 py-7 sm:px-6 lg:px-8">

      {/* ================= HEADER ================= */}

      <header className="mx-auto flex h-16 max-w-[1240px] items-center justify-between">

        {/* Brand */}
        <Link
          href="/"
          className="text-[21px] font-bold tracking-[-0.035em] text-[#073b63] sm:text-[23px]"
        >
          AquaWatch AI
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-9 text-[14px] font-medium text-[#60788b] sm:flex">

          <Link
            href="/"
            className="transition-colors hover:text-[#075985]"
          >
            Home
          </Link>

          <Link
            href="/report"
            className="transition-colors hover:text-[#075985]"
          >
            Report Issue
          </Link>

          <Link
            href="/map"
            className="transition-colors hover:text-[#075985]"
          >
            Water Map
          </Link>

        </nav>
      </header>

      {/* ================= MAIN ================= */}

      <section className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[1240px] items-center justify-center py-7 sm:py-10">

        <div className="grid w-full overflow-hidden rounded-[24px] border border-[#d5e4ed] bg-white shadow-[0_18px_55px_rgba(12,74,110,0.10)] lg:grid-cols-2">

          {/* ================================================== */}
          {/* LEFT BLUE PANEL */}
          {/* ================================================== */}

          <div className="relative flex min-h-[590px] flex-col justify-between overflow-hidden bg-[#075985] px-8 py-12 text-white sm:px-12 sm:py-14 lg:px-16 lg:py-16">

            {/* Brand */}

            <div className="relative z-10">

              <p className="text-[14px] font-bold uppercase tracking-[0.28em] text-[#d8f3ff]">
                AQUAWATCH AI
              </p>

              {/* Main statement */}

              <div className="mt-24">

                <h1 className="max-w-[520px] text-[43px] font-bold leading-[1.08] tracking-[-0.045em] sm:text-[52px] lg:text-[57px]">

                  Smarter water
                  <br />

                  management
                  <br />

                  starts with
                  <br />

                  better reporting.

                </h1>

                <p className="mt-8 max-w-[480px] text-[16px] leading-7 text-[#d4edf7]">
                  Report water problems, understand their priority,
                  and track progress from one simple platform.
                </p>

              </div>

            </div>

            {/* Bottom statement */}

            <div className="relative z-10 mt-12">

              <div className="mb-4 h-[2px] w-14 bg-[#8dddf7]" />

              <p className="text-[14px] font-semibold tracking-[0.08em] text-[#c5e9f5]">
                REPORT. TRACK. IMPROVE.
              </p>

            </div>

          </div>

          {/* ================================================== */}
          {/* RIGHT LOGIN PANEL */}
          {/* ================================================== */}

          <div className="flex min-h-[590px] items-center bg-white px-8 py-12 sm:px-12 lg:px-16">

            <div className="mx-auto w-full max-w-[460px]">

              {/* Small brand */}

              <p className="text-[13px] font-bold uppercase tracking-[0.25em] text-[#1681b7]">
                AQUAWATCH AI
              </p>

              {/* Heading */}

              <h2 className="mt-5 text-[40px] font-bold tracking-[-0.045em] text-[#073b63] sm:text-[47px]">
                Welcome Back
              </h2>

              <p className="mt-3 text-[15px] text-[#70899a]">
                Sign in to continue to AquaWatch AI
              </p>

              {/* Divider */}

              <div className="my-8 h-px bg-[#e0ebf1]" />

              {/* ================================================== */}
              {/* LOGIN FORM */}
              {/* ================================================== */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-6"
              >

                {/* PHONE NUMBER */}

                <div>

                  <label
                    htmlFor="phone"
                    className="mb-2.5 block text-[14px] font-semibold text-[#164766]"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);

                      if (errors.phone) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: undefined,
                        }));
                      }
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    aria-invalid={!!errors.phone}
                    className={`h-[55px] w-full rounded-[11px] border bg-[#f8fbfd] px-4 text-[15px] text-[#123b55] outline-none transition-all placeholder:text-[#98aeba] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/10 ${
                      errors.phone
                        ? "border-red-400 focus:border-red-400"
                        : "border-[#d5e4ec] focus:border-[#1681b7]"
                    }`}
                  />

                  {errors.phone && (
                    <p
                      className="mt-1.5 text-xs text-red-600"
                      role="alert"
                    >
                      {errors.phone}
                    </p>
                  )}

                </div>

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2.5 block text-[14px] font-semibold text-[#164766]"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);

                        if (errors.password) {
                          setErrors((prev) => ({
                            ...prev,
                            password: undefined,
                          }));
                        }
                      }}
                      placeholder="Enter your password"
                      aria-invalid={!!errors.password}
                      className={`h-[55px] w-full rounded-[11px] border bg-[#f8fbfd] px-4 pr-12 text-[15px] text-[#123b55] outline-none transition-all placeholder:text-[#98aeba] focus:bg-white focus:ring-2 focus:ring-[#0ea5e9]/10 ${
                        errors.password
                          ? "border-red-400 focus:border-red-400"
                          : "border-[#d5e4ec] focus:border-[#1681b7]"
                      }`}
                    />

                    {/* Show / Hide password */}

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((value) => !value)
                      }
                      className="absolute right-0 top-0 flex h-[55px] w-12 items-center justify-center text-[#7993a3] transition-colors hover:text-[#075985]"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-[18px] w-[18px]" />
                      ) : (
                        <Eye className="h-[18px] w-[18px]" />
                      )}
                    </button>

                  </div>

                  {errors.password && (
                    <p
                      className="mt-1.5 text-xs text-red-600"
                      role="alert"
                    >
                      {errors.password}
                    </p>
                  )}

                </div>

                {/* SIGN IN BUTTON */}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-[55px] w-full rounded-[11px] bg-[#075985] px-4 text-[15px] font-bold text-white shadow-[0_7px_18px_rgba(7,89,133,0.20)] transition-all hover:bg-[#064b70] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Signing In..." : "Sign In"}
                </button>

              </form>

              {/* REGISTER */}

              <div className="mt-8 flex items-center justify-between gap-4 text-[14px]">

                <span className="text-[#8ba0ad]">
                  Don&apos;t have an account?
                </span>

                <Link
                  href="/register"
                  className="font-bold text-[#0879b1] underline decoration-[#a8cbd9] underline-offset-4 transition-colors hover:text-[#075985]"
                >
                  Create Account
                </Link>

              </div>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}