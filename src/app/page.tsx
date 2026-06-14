// src/app/page.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Activity, ShieldCheck, HeartHandshake, CheckCircle2, Phone, Calendar, Stethoscope, User, Mail, MessageSquare, Send, HelpCircle } from "lucide-react";
import { db } from "@/firebase/client";
import { collection, addDoc } from "firebase/firestore";

export default function Home() {
  // Contact Form State
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setSubmitError("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      await addDoc(collection(db, "inquiries"), {
        name: contactName.trim(),
        email: contactEmail.trim(),
        subject: contactSubject.trim() || "General Inquiry",
        message: contactMessage.trim(),
        createdAt: new Date().toISOString(),
      });
      setSubmitSuccess(true);
      setContactName("");
      setContactEmail("");
      setContactSubject("");
      setContactMessage("");
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
      setSubmitError("Failed to send your inquiry. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const specialties = [
    {
      title: "Cardiology",
      desc: "Advanced heart care, detailed diagnostics, and customized cardiovascular treatments.",
      icon: "❤️",
      glow: "from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/10 hover:border-rose-500/30",
    },
    {
      title: "Neurology",
      desc: "Expert diagnosis and care for complex brain and nervous system disorders.",
      icon: "🧠",
      glow: "from-violet-500/20 to-fuchsia-500/20 text-violet-400 border-violet-500/10 hover:border-violet-500/30",
    },
    {
      title: "Pediatrics",
      desc: "Comprehensive and compassionate healthcare for infants, kids, and teens.",
      icon: "👶",
      glow: "from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/10 hover:border-amber-500/30",
    },
    {
      title: "Dermatology",
      desc: "Advanced skincare, clinical dermatological treatments, and diagnostics.",
      icon: "✨",
      glow: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10 hover:border-emerald-500/30",
    },
    {
      title: "Orthopedics",
      desc: "Specialized care for bones, joints, ligaments, and sports injury recovery.",
      icon: "🦴",
      glow: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/10 hover:border-cyan-500/30",
    },
    {
      title: "General Medicine",
      desc: "Routine wellness exams, diagnostic screenings, and general care services.",
      icon: "🩺",
      glow: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/10 hover:border-teal-500/30",
    },
  ];

  const features = [
    {
      title: "Verified Doctors",
      desc: "Consult with certified, board-selected medical specialists.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Instant Scheduling",
      desc: "Select a date, pick your preferred doctor, and confirm instantly.",
      color: "from-violet-500 to-fuchsia-500",
    },
    {
      title: "Secure Payments",
      desc: "Hassle-free online transactions with integrated Stripe security.",
      color: "from-amber-500 to-rose-500",
    },
    {
      title: "All-in-One Dashboard",
      desc: "Track records, upcoming consultations, and prescriptions in one place.",
      color: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#06040b] text-white font-sans antialiased overflow-x-hidden selection:bg-fuchsia-500/30 selection:text-fuchsia-200">
      
      {/* Ambient Animated Mesh Glow Gradients for Dynamic Lighting (Super Vibrant multi-color layout) */}
      <div className="absolute top-[-10%] left-[5%] w-[600px] h-[600px] bg-gradient-to-tr from-fuchsia-500/20 via-violet-600/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-[pulse_8s_infinite]" />
      <div className="absolute top-[15%] right-[-5%] w-[650px] h-[650px] bg-gradient-to-bl from-emerald-500/15 via-teal-600/10 to-transparent rounded-full blur-[160px] pointer-events-none animate-[pulse_10s_infinite_1s]" />
      <div className="absolute top-[40%] left-[20%] w-[500px] h-[500px] bg-gradient-to-r from-amber-500/10 to-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[15%] w-[550px] h-[550px] bg-gradient-to-tr from-violet-600/10 via-rose-500/5 to-transparent rounded-full blur-[130px] pointer-events-none" />



      {/* Elegant Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#06040b]/75 backdrop-blur-md px-6 py-4 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-amber-400 p-[1.5px] shadow-lg shadow-fuchsia-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#06040b]">
                <Activity className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent tracking-tight">
              AuraCare
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#services" className="hover:text-fuchsia-400 transition-colors">Specialties</a>
            <a href="#why-us" className="hover:text-fuchsia-400 transition-colors">Why AuraCare</a>
            <a href="#contact" className="hover:text-fuchsia-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/signin"
              className="text-sm font-bold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-600 to-amber-500 hover:brightness-110 text-sm font-bold text-white px-6 py-3 transition-all duration-300 shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40"
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center py-20 px-6 lg:py-32">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-10">
          
          {/* Hero Left: Rich Multi-color Branding & Copy */}
          <div className="lg:col-span-7 space-y-8 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-4 py-1.5 text-xs font-bold text-fuchsia-300 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-300 animate-pulse" />
              <span>Premium Healthcare Reimagined</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05] text-white">
              Your Health. <br />
              Our Expertise. <br />
              <span className="bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">
                Completely Simplified.
              </span>
            </h1>

            <p className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Experience premium medical care with board-certified specialists. Book slots, pay securely, and manage consultations online in a click.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link
                href="/auth/signup"
                className="w-full sm:w-auto text-center rounded-full bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 hover:brightness-110 text-base font-bold text-white px-8 py-4 transition-all duration-300 shadow-xl shadow-fuchsia-500/25 hover:shadow-rose-500/40"
              >
                Book Appointment
              </Link>
              <a
                href="#services"
                className="w-full sm:w-auto text-center rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-base font-bold text-slate-200 px-8 py-4 transition-all duration-300"
              >
                View Specialties
              </a>
            </div>
          </div>

          {/* Hero Right: Modern Medical Video Player / Visualizer Mockup */}
          <div className="lg:col-span-5 relative w-full flex justify-center">
            {/* Mesh background glow behind the video */}
            <div className="absolute inset-0 -m-6 bg-gradient-to-tr from-emerald-500/10 via-fuchsia-500/20 to-amber-500/10 rounded-3xl blur-2xl opacity-80" />
            
            {/* The Glassmorphic Video Widget Frame */}
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/35 bg-[#140e28]/60 p-3.5 backdrop-blur-xl shadow-[0_0_50px_-5px_rgba(6,182,212,0.3),_0_0_50px_-5px_rgba(168,85,247,0.2)]">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-white/5">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                >
                  <source
                    src="/doctors.mp4"
                    type="video/mp4"
                  />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                
                {/* Custom ECG Waveform Overlay */}
                <svg className="absolute inset-x-0 bottom-0 h-16 w-full text-emerald-400/50 pointer-events-none" viewBox="0 0 120 20" preserveAspectRatio="none">
                  <path 
                    d="M0 10 L40 10 L44 4 L48 16 L52 10 L56 10 L60 0 L64 20 L68 10 L72 10 L76 7 L80 13 L84 10 L120 10" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="1.2" 
                    className="animate-ecg" 
                  />
                </svg>

                {/* Looping video "LIVE" telemetry indicator badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-md bg-fuchsia-600/90 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-white backdrop-blur-sm border border-fuchsia-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  <span>Telemetry Loop</span>
                </div>

                {/* Patient Vitals Overlay (Multi-colored, premium look) */}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1 font-mono text-[9px] text-emerald-400 bg-slate-950/60 p-1.5 rounded border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                    <span>HR: 74 bpm</span>
                  </div>
                  <span className="text-fuchsia-400">SPO2: 99%</span>
                  <span className="text-amber-400">BP: 120/80</span>
                </div>
              </div>
              
              {/* Doctor Details overlay block below the video */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-fuchsia-400">AuraCare Smart Diagnostics</span>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white">Full-Spectrum Diagnostics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Combining clinical excellence with real-time biological feedback to assist specialists in cardiac screening and neural diagnostics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Showcase */}
      <section id="services" className="py-24 px-6 border-t border-white/5 bg-[#05030b]/80 relative">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Specialized Medical Care
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Get access to leading experts across diverse departments, all from the comfort of your home.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {specialties.map((spec, i) => (
              <div
                key={i}
                className={`group relative rounded-2xl border bg-[#090614]/70 p-8 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg ${spec.glow}`}
              >
                {/* Backlight glow on card hover */}
                <div className="absolute -inset-px bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                
                <div className="space-y-4 relative z-10">
                  <div className="text-4xl">{spec.icon}</div>
                  <h3 className="text-xl font-bold text-white transition-colors duration-300">
                    {spec.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {spec.desc}
                  </p>
                </div>
                <div className="pt-6 relative z-10">
                  <Link
                    href="/auth/signup"
                    className="text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Schedule Consult</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">&rarr;</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="why-us" className="py-24 px-6 border-t border-white/5 bg-[#07050e] relative">
        <div className="max-w-7xl mx-auto space-y-16 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Modern Patient Experience
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Built on state-of-the-art tech. AuraCare clinic offers digital-first booking and secure payments.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feat, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-white/5 bg-[#0e0a1f]/30 p-6 backdrop-blur-sm space-y-4 hover:border-slate-800 transition-all duration-300 group"
              >
                <div className={`h-1.5 w-12 rounded bg-gradient-to-r ${feat.color} group-hover:w-20 transition-all duration-300`} />
                <h3 className="text-lg font-bold text-white">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-6 border-t border-white/5 bg-[#080613]/60 relative">
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="text-center max-w-xl mx-auto space-y-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Connect With Us
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Have questions, feedback, or need assistance? Reach out to our team, and we will get back to you shortly.
            </p>
          </div>

          {/* Contact Card */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#0e0a1f]/40 p-8 md:p-10 backdrop-blur-xl shadow-2xl">
            {/* Glowing backgrounds */}
            <div className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] bg-gradient-to-tr from-fuchsia-500/10 via-violet-600/5 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[300px] h-[300px] bg-gradient-to-bl from-emerald-500/10 via-teal-600/5 to-transparent rounded-full blur-[80px] pointer-events-none" />

            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 animate-fadeIn">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Inquiry Received Successfully</h3>
                <p className="text-slate-400 text-sm max-w-sm">
                  Thank you for reaching out to AuraCare Clinic. An admin team member will review your request and contact you at your email.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-4 px-6 py-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                {submitError && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-400">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">Full Name <span className="text-fuchsia-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-500" />
                      </span>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full rounded-xl bg-slate-950/70 border border-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 block">Email Address <span className="text-fuchsia-500">*</span></label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-slate-500" />
                      </span>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full rounded-xl bg-slate-950/70 border border-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent text-sm transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Subject field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Subject</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <HelpCircle className="h-4 w-4 text-slate-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="Feedback, general question, or appointment query"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/70 border border-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Message field */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 block">Your Message <span className="text-fuchsia-500">*</span></label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 pointer-events-none">
                      <MessageSquare className="h-4 w-4 text-slate-500" />
                    </span>
                    <textarea
                      placeholder="Tell us details about your inquiry..."
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/70 border border-white/5 pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent text-sm resize-none transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-rose-500 to-amber-500 hover:brightness-110 py-3.5 text-sm font-bold text-white transition-all shadow-lg shadow-fuchsia-500/10 hover:shadow-fuchsia-500/25 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="footer" className="py-16 px-6 border-t border-white/5 bg-[#05030b]/90 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-sm text-slate-400 relative z-10">
          <div className="space-y-4">
            <span className="text-2xl font-black bg-gradient-to-r from-emerald-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
              AuraCare
            </span>
            <p className="max-w-xs text-xs leading-relaxed">
              Providing premium medical care, online booking integrations, and reliable diagnostics to secure a healthier tomorrow.
            </p>
            <div className="flex gap-4 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Encrypted Payments</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Hours & Location</h4>
            <p>100 Healthcare Blvd, Suite 200</p>
            <p>Mon - Fri: 8:00 AM - 6:00 PM</p>
            <p>Emergency Line: +1 (800) 555-0199</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">Quick Actions</h4>
            <Link href="/auth/signup" className="block hover:text-white transition-colors">Book Online</Link>
            <Link href="/auth/signin" className="block hover:text-white transition-colors">Patient Login</Link>
            <a href="mailto:info@auracare.com" className="block hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 text-center text-xs text-slate-600 relative z-10">
          &copy; {new Date().getFullYear()} AuraCare Clinic. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
