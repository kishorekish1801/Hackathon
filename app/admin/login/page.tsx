"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    setLoading(true);

    /*
      TEMPORARY ADMIN LOGIN

      Replace this later with the real backend
      admin authentication endpoint.
    */

    if (username === "admin" && password === "admin123") {
      localStorage.setItem("adminAuthenticated", "true");

      router.push("/admin");
      return;
    }

    setError("Invalid admin username or password.");
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#f5f9fc] text-[#092f50]">

      {/* HEADER */}

      <header className="border-b border-[#dce7ef] bg-white">
        <div className="mx-auto flex h-[76px] max-w-[1180px] items-center px-6 lg:px-8">

          <div>
            <p className="text-[20px] font-bold tracking-[-0.03em] text-[#082f50]">
              AquaWatch AI
            </p>

            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0879b1]">
              ADMINISTRATION PORTAL
            </p>
          </div>

        </div>
      </header>


      {/* LOGIN */}

      <section className="flex min-h-[calc(100vh-76px)] items-center justify-center px-6 py-12">

        <div className="w-full max-w-[430px]">

          {/* TITLE */}

          <div className="mb-8 text-center">

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0879b1]">
              ADMIN ACCESS
            </p>

            <h1 className="mt-3 text-[34px] font-bold tracking-[-0.04em] text-[#092f50]">
              Admin Sign In
            </h1>

            <p className="mx-auto mt-3 max-w-[350px] text-[14px] leading-6 text-[#6b8294]">
              Sign in to access the AquaWatch administration portal
              and manage reported water problems.
            </p>

          </div>


          {/* FORM */}

          <div className="border border-[#d5e2eb] bg-white p-7 shadow-[0_12px_35px_rgba(9,47,80,0.07)] sm:p-8">

            <form onSubmit={handleLogin} className="space-y-5">

              {/* USERNAME */}

              <div>

                <label
                  htmlFor="username"
                  className="mb-2 block text-[13px] font-semibold text-[#244b67]"
                >
                  Admin Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter admin username"
                  autoComplete="username"
                  className="
                    h-[48px]
                    w-full
                    rounded-md
                    border
                    border-[#cbdce7]
                    bg-white
                    px-4
                    text-[14px]
                    text-[#092f50]
                    outline-none
                    transition
                    placeholder:text-[#9aabba]
                    focus:border-[#0879b1]
                    focus:ring-2
                    focus:ring-[#0879b1]/10
                  "
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-[13px] font-semibold text-[#244b67]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="
                    h-[48px]
                    w-full
                    rounded-md
                    border
                    border-[#cbdce7]
                    bg-white
                    px-4
                    text-[14px]
                    text-[#092f50]
                    outline-none
                    transition
                    placeholder:text-[#9aabba]
                    focus:border-[#0879b1]
                    focus:ring-2
                    focus:ring-[#0879b1]/10
                  "
                />

              </div>


              {/* ERROR */}

              {error && (
                <div className="border border-[#efcaca] bg-[#fff6f6] px-4 py-3 text-[13px] text-[#a33a3a]">
                  {error}
                </div>
              )}


              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  h-[50px]
                  w-full
                  rounded-md
                  bg-[#075985]
                  text-[14px]
                  font-bold
                  text-white
                  shadow-[0_8px_20px_rgba(7,89,133,0.18)]
                  transition
                  hover:bg-[#064d73]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? "Signing In..." : "Sign In to Admin Portal"}
              </button>

            </form>

          </div>


          {/* FOOTER */}

          <p className="mt-6 text-center text-[12px] text-[#8194a3]">
            AquaWatch AI · Smart Water Management
          </p>

        </div>

      </section>

    </main>
  );
}