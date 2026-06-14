// src/app/auth/signup/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/client";
import { User, Mail, Lock, Sparkles, ShieldCheck } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        role: "patient",
        createdAt: new Date().toISOString(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email address is already in use.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#06040b] text-white overflow-hidden relative">
      {/* Background ambient glow behind form */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[20%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Left Column: Ambient Medical Loop Video */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 flex-col justify-between p-12 bg-slate-950 border-r border-white/5 overflow-hidden">
        {/* Loop Background Video (Local Respiratory Animation) */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        >
          <source
            src="/lab.mp4"
            type="video/mp4"
          />
        </video>

        {/* Ambient Overlay to blend video into deep fuchsia/violet background */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#06040b] via-[#06040b]/70 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#06040b]/20 to-[#06040b] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-500/10 via-transparent to-emerald-500/10 pointer-events-none" />

        {/* Logo area */}
        <div className="relative z-10 flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-amber-400 p-[1.5px]">
            <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#06040b]">
              <span className="text-emerald-400 font-bold text-xs">A</span>
            </div>
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
            AuraCare
          </span>
        </div>

        {/* Branding Slogan */}
        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3.5 py-1.5 text-xs font-semibold text-fuchsia-300">
            <Sparkles className="h-3 w-3 text-fuchsia-300" />
            <span>Digital-First Clinical Operations</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-[2.65rem] font-black tracking-tight leading-[1.15] text-white">
            Connect With <br />
            <span className="bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent whitespace-nowrap">
              Premium Specialists
            </span> <br />
            Instantly
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Register your secure patient profile to access expert diagnostics, consult calendars, and instant Stripe payment clearances.
          </p>
        </div>

        {/* Info badges */}
        <div className="relative z-10 flex gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-slate-400 font-semibold">HIPAA Compliant</span>
          </div>
          <span>&bull;</span>
          <span className="text-slate-400 font-semibold">End-to-End Encrypted Data</span>
        </div>
      </div>

      {/* Right Column: Glassmorphic Sign Up Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 relative z-10">
        <div className="w-full max-w-md space-y-8 bg-white/[0.02] border border-fuchsia-500/30 backdrop-blur-xl rounded-3xl p-8 shadow-[0_0_50px_-10px_rgba(168,85,247,0.25),_0_0_50px_-10px_rgba(6,182,212,0.15)]">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white whitespace-nowrap">
              Create Your Account
            </h1>
            <p className="text-slate-400 text-sm mt-2">
              Join AuraCare Clinic to schedule consultations and view medical plans.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 p-4 border border-rose-500/20 text-sm text-rose-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all text-sm"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all text-sm"
                    placeholder="johndoe@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl bg-slate-900/60 border border-slate-800 pl-11 pr-4 py-3.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-amber-500 py-3.5 px-4 text-sm font-semibold text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-fuchsia-500/25 hover:shadow-fuchsia-500/40"
              >
                {loading ? (
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                href="/auth/signin"
                className="font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
