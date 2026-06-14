// src/app/booking/success/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/client";
import { CheckCircle2, Calendar, Clock, User, Heart, ArrowRight } from "lucide-react";
import { Suspense } from "react";

function BookingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState("");
  const savedRef = useRef(false); // Ref to prevent double-saving in development StrictMode

  // Query parameters
  const sessionId = searchParams.get("session_id");
  const userId = searchParams.get("userId");
  const serviceId = searchParams.get("serviceId");
  const serviceName = searchParams.get("serviceName");
  const doctorId = searchParams.get("doctorId");
  const doctorName = searchParams.get("doctorName");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const price = searchParams.get("price");

  useEffect(() => {
    async function saveAppointment() {
      if (!sessionId || !userId || !serviceId || !doctorId || !date || !time) {
        setError("Missing reservation parameters.");
        setSaving(false);
        return;
      }

      if (savedRef.current) return;
      savedRef.current = true;

      try {
        // Create appointment in Firestore using Stripe sessionId as docId to ensure idempotency
        await setDoc(doc(db, "appointments", sessionId), {
          id: sessionId,
          userId,
          serviceId,
          serviceName: decodeURIComponent(serviceName || ""),
          doctorId,
          doctorName: decodeURIComponent(doctorName || ""),
          date,
          time,
          price: Number(price) || 0,
          status: "confirmed",
          createdAt: new Date().toISOString(),
        });
      } catch (err: any) {
        console.error("Error saving appointment to Firestore:", err);
        setError("Payment was successful, but we failed to record the appointment. Please contact support.");
      } finally {
        setSaving(false);
      }
    }

    saveAppointment();
  }, [sessionId, userId, serviceId, serviceName, doctorId, doctorName, date, time, price]);

  if (saving) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-400 font-medium">Verifying transaction and booking appointment...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white/5 p-8 backdrop-blur-md border border-white/10 shadow-2xl text-center">
        {error ? (
          <div className="space-y-4">
            <div className="text-rose-500 text-6xl">⚠️</div>
            <h2 className="text-2xl font-bold text-white">Booking Interrupted</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="mt-6 w-full rounded-full bg-slate-800 hover:bg-slate-700 py-3 text-sm font-semibold text-white transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-400 animate-bounce" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight text-white">Booking Confirmed!</h2>
              <p className="text-sm text-slate-400">Your consultation is successfully scheduled and paid.</p>
            </div>

            {/* Appointment Details Box */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5 text-left space-y-4">
              <div className="border-b border-slate-800/80 pb-3 flex justify-between items-center">
                <span className="text-sm font-bold text-white">{decodeURIComponent(serviceName || "")}</span>
                <span className="text-xs font-semibold rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 px-2.5 py-0.5">Paid</span>
              </div>

              <div className="space-y-2.5 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  <span>{decodeURIComponent(doctorName || "")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span>
                    {date &&
                      new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span>{time}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 py-3.5 text-base font-semibold text-white transition-all shadow-lg shadow-teal-500/20"
            >
              <span>Go to Patient Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BookingSuccess() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#06040b] text-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-fuchsia-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-400 font-medium">Loading session info...</span>
        </div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
