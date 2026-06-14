// src/app/admin/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection, getDocs, query, orderBy, updateDoc, doc, onSnapshot
} from "firebase/firestore";
import { db } from "@/firebase/client";
import {
  Activity, Calendar, CreditCard, Users, MessageSquare,
  TrendingUp, CheckCircle2, XCircle, Clock, Star,
  ChevronLeft, RefreshCw, Stethoscope, ShieldAlert,
  BarChart3, Mail, User, Eye, Filter, Sparkles
} from "lucide-react";

interface Appointment {
  id: string;
  userId: string;
  serviceName: string;
  doctorName: string;
  date: string;
  time: string;
  price: number;
  status: string;
  userEmail?: string;
  createdAt: string;
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  avatar: string;
  experience: string;
}

const ADMIN_PASS = "auracare2024";

export default function AdminPanel() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [passError, setPassError] = useState("");

  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "inquiries" | "doctors">("overview");

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled" | "pending">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Load data once authenticated
  useEffect(() => {
    if (!authed) return;

    async function loadData() {
      setLoading(true);
      try {
        // Appointments
        const apptSnap = await getDocs(collection(db, "appointments"));
        const apptList = apptSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Appointment[];
        apptList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAppointments(apptList);

        // Inquiries
        const inqSnap = await getDocs(collection(db, "inquiries"));
        const inqList = inqSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Inquiry[];
        inqList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInquiries(inqList);

        // Doctors
        const docSnap = await getDocs(collection(db, "doctors"));
        const docList = docSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Doctor[];
        docList.sort((a, b) => b.rating - a.rating);
        setDoctors(docList);
      } catch (err) {
        console.error("Admin load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput === ADMIN_PASS) {
      setAuthed(true);
    } else {
      setPassError("Incorrect admin passphrase. Try again.");
    }
  };

  const handleUpdateStatus = async (apptId: string, newStatus: string) => {
    setUpdatingId(apptId);
    try {
      await updateDoc(doc(db, "appointments", apptId), { status: newStatus });
      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: newStatus } : a));
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ── Computed Stats ────────────────────────────
  const totalRevenue = appointments.reduce((s, a) => s + (a.price || 0), 0);
  const confirmedAppts = appointments.filter(a => a.status === "confirmed").length;
  const cancelledAppts = appointments.filter(a => a.status === "cancelled").length;
  const filteredAppts = statusFilter === "all" ? appointments : appointments.filter(a => a.status === statusFilter);
  const topDoctors = [...doctors].sort((a, b) => b.rating - a.rating).slice(0, 8);

  // Revenue by service
  const revenueByService: Record<string, number> = {};
  appointments.forEach(a => {
    if (!revenueByService[a.serviceName]) revenueByService[a.serviceName] = 0;
    revenueByService[a.serviceName] += a.price || 0;
  });

  // ── Login Gate ────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#06040b] text-white flex items-center justify-center p-6">
        <div className="absolute top-[-10%] left-[5%] w-[500px] h-[500px] bg-fuchsia-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative w-full max-w-sm">
          <div className="rounded-3xl border border-white/10 bg-[#0e0a1f]/80 backdrop-blur-xl p-8 space-y-6 shadow-2xl shadow-fuchsia-500/5">
            <div className="text-center space-y-3">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-amber-400 p-[1.5px] mx-auto shadow-lg shadow-fuchsia-500/20">
                <div className="h-full w-full rounded-[14px] bg-[#0e0a1f] flex items-center justify-center">
                  <ShieldAlert className="h-7 w-7 text-fuchsia-400" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-white">Admin Portal</h1>
                <p className="text-xs text-slate-500 mt-1">AuraCare Clinic Management System</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {passError && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-400 text-center">
                  {passError}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Admin Passphrase</label>
                <input
                  type="password"
                  placeholder="Enter admin passphrase..."
                  value={passInput}
                  onChange={(e) => { setPassInput(e.target.value); setPassError(""); }}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm transition-all"
                  autoFocus
                />
              </div>
              <button type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 via-violet-600 to-teal-500 hover:brightness-110 text-sm font-bold text-white transition-all shadow-lg shadow-fuchsia-500/20">
                Access Admin Panel
              </button>
              <button type="button" onClick={() => router.push("/")}
                className="w-full py-2.5 rounded-xl border border-white/10 text-xs font-semibold text-slate-500 hover:text-white transition-colors">
                ← Back to Homepage
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin Dashboard ──────────────────────────
  return (
    <div className="min-h-screen bg-[#06040b] text-white">
      {/* Ambient glows */}
      <div className="fixed top-0 left-[20%] w-[600px] h-[400px] bg-fuchsia-500/6 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-[10%] w-[500px] h-[400px] bg-teal-500/6 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#06040b]/85 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push("/dashboard")} className="flex items-center gap-1.5 text-slate-500 hover:text-white transition-colors text-xs font-semibold">
              <ChevronLeft className="h-4 w-4" />
              Dashboard
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-amber-400 p-[1px] shadow-md">
                <div className="h-full w-full rounded-[6px] bg-[#0a0715] flex items-center justify-center">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" />
                </div>
              </div>
              <div>
                <span className="font-black text-white text-sm">AuraCare</span>
                <span className="text-[10px] text-fuchsia-400 font-bold ml-2 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full px-2 py-0.5">ADMIN</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
            </span>
            <button onClick={() => setAuthed(false)} className="text-xs font-semibold text-slate-500 hover:text-rose-400 transition-colors border border-white/10 rounded-lg px-3 py-1.5">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/5 rounded-2xl p-1.5">
          {[
            { id: "overview", label: "Overview", icon: BarChart3 },
            { id: "appointments", label: "Appointments", icon: Calendar },
            { id: "inquiries", label: "Inquiries", icon: MessageSquare },
            { id: "doctors", label: "Doctors", icon: Stethoscope },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex-1 justify-center ${
                activeTab === id
                  ? "bg-gradient-to-r from-fuchsia-500/20 to-teal-500/10 text-white border border-fuchsia-500/20 shadow-sm"
                  : "text-slate-500 hover:text-white"
              }`}>
              <Icon className={`h-3.5 w-3.5 ${activeTab === id ? "text-fuchsia-400" : ""}`} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                <div className="absolute inset-3 rounded-full border-2 border-teal-500/20 border-b-teal-500 animate-spin" style={{ animationDirection: "reverse" }} />
              </div>
              <span className="text-slate-500 text-sm font-semibold">Loading admin data…</span>
            </div>
          </div>
        ) : (
          <>
            {/* ── OVERVIEW ────────────────────────────── */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Stat cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Appointments", value: appointments.length, icon: Calendar, color: "from-fuchsia-500 to-violet-600", sub: `${confirmedAppts} confirmed` },
                    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: CreditCard, color: "from-emerald-500 to-teal-500", sub: "via Stripe" },
                    { label: "Contact Inquiries", value: inquiries.length, icon: MessageSquare, color: "from-amber-500 to-rose-500", sub: "awaiting review" },
                    { label: "Active Doctors", value: doctors.length, icon: Stethoscope, color: "from-violet-500 to-fuchsia-500", sub: "across 6 specialties" },
                  ].map((s, i) => (
                    <div key={i} className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 hover:border-white/10 transition-all">
                      <div className={`absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl ${s.color} opacity-10 rounded-full blur-xl`} />
                      <div className="relative z-10">
                        <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-md`}>
                          <s.icon className="h-4 w-4 text-white" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{s.label}</p>
                        <p className="text-2xl font-black text-white mt-1">{s.value}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5 font-semibold">{s.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Revenue by service */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Revenue by Service
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(revenueByService)
                        .sort(([, a], [, b]) => b - a)
                        .map(([svc, rev]) => {
                          const pct = totalRevenue > 0 ? Math.round((rev / totalRevenue) * 100) : 0;
                          return (
                            <div key={svc} className="space-y-1.5">
                              <div className="flex justify-between text-xs">
                                <span className="font-semibold text-slate-300 truncate">{svc}</span>
                                <span className="font-black text-emerald-400 ml-2">${rev}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Appointment status breakdown */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-fuchsia-400" />
                      Appointment Status Breakdown
                    </h3>
                    {[
                      { label: "Confirmed", count: confirmedAppts, color: "from-emerald-500 to-teal-400", bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
                      { label: "Cancelled", count: cancelledAppts, color: "from-rose-500 to-red-500", bg: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
                      { label: "Other / Pending", count: appointments.length - confirmedAppts - cancelledAppts, color: "from-amber-500 to-yellow-400", bg: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
                    ].map((s, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className={`font-bold rounded-full border px-2.5 py-0.5 text-[9px] uppercase ${s.bg}`}>{s.label}</span>
                          <span className="font-black text-white">{s.count}</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r ${s.color} rounded-full transition-all duration-700`}
                            style={{ width: appointments.length > 0 ? `${(s.count / appointments.length) * 100}%` : "0%" }}
                          />
                        </div>
                      </div>
                    ))}

                    <div className="border-t border-white/5 pt-4 grid grid-cols-3 text-center gap-3">
                      {[
                        { label: "Total", val: appointments.length, color: "text-white" },
                        { label: "Revenue", val: `$${totalRevenue}`, color: "text-emerald-400" },
                        { label: "Inquiries", val: inquiries.length, color: "text-fuchsia-400" },
                      ].map((s, i) => (
                        <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 py-3">
                          <p className={`text-base font-black ${s.color}`}>{s.val}</p>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-600 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Recent Inquiries preview */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-amber-400" />
                      Latest Contact Inquiries
                    </h3>
                    <button onClick={() => setActiveTab("inquiries")} className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300">
                      View all →
                    </button>
                  </div>
                  {inquiries.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-6">No inquiries yet.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {inquiries.slice(0, 4).map(inq => (
                        <div key={inq.id} className="flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/10 transition-all">
                          <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{inq.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{inq.subject || "General Inquiry"}</p>
                          </div>
                          <p className="text-[10px] text-slate-600 flex-shrink-0">{new Date(inq.createdAt).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── APPOINTMENTS ─────────────────────────── */}
            {activeTab === "appointments" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-white">All Appointments</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{appointments.length} total across all patients</p>
                  </div>
                  {/* Filter */}
                  <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/5 rounded-xl p-1">
                    {(["all", "confirmed", "cancelled"] as const).map(f => (
                      <button key={f} onClick={() => setStatusFilter(f)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === f ? "bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/20" : "text-slate-500 hover:text-white"}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {filteredAppts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-slate-500 text-sm">
                      No appointments match this filter.
                    </div>
                  ) : (
                    filteredAppts.map(appt => (
                      <div key={appt.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4.5 w-4.5 text-fuchsia-400" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-white">{appt.serviceName}</h4>
                              <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${
                                appt.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : appt.status === "cancelled" ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                              }`}>
                                {appt.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[10px] text-slate-500">
                              <span>👨‍⚕️ {appt.doctorName}</span>
                              <span>📅 {appt.date}</span>
                              <span>⏰ {appt.time}</span>
                              <span className="text-emerald-400 font-bold">${appt.price}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status actions */}
                        <div className="flex items-center gap-2 flex-shrink-0 sm:border-l sm:border-white/5 sm:pl-4">
                          {appt.status !== "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "confirmed")}
                              disabled={updatingId === appt.id}
                              className="flex items-center gap-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 px-3.5 py-2 text-xs font-bold text-emerald-400 transition-all disabled:opacity-50">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirm
                            </button>
                          )}
                          {appt.status !== "cancelled" && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "cancelled")}
                              disabled={updatingId === appt.id}
                              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 px-3.5 py-2 text-xs font-bold text-rose-400 transition-all disabled:opacity-50">
                              <XCircle className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}
                          {updatingId === appt.id && (
                            <div className="h-4 w-4 border-2 border-fuchsia-500/30 border-t-fuchsia-500 rounded-full animate-spin" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── INQUIRIES ────────────────────────────── */}
            {activeTab === "inquiries" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white">Contact Inquiries</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{inquiries.length} messages submitted via the landing page.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* List */}
                  <div className="space-y-2.5">
                    {inquiries.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center text-slate-500 text-sm">
                        <MessageSquare className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                        No inquiries received yet.
                      </div>
                    ) : (
                      inquiries.map(inq => (
                        <button key={inq.id} onClick={() => setSelectedInquiry(inq)}
                          className={`w-full rounded-2xl border p-4 text-left transition-all hover:border-white/15 ${selectedInquiry?.id === inq.id ? "border-fuchsia-500/30 bg-fuchsia-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <User className="h-4 w-4 text-amber-400" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-white truncate">{inq.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{inq.email}</p>
                                <p className="text-xs text-slate-400 mt-1 font-semibold truncate">{inq.subject || "General Inquiry"}</p>
                              </div>
                            </div>
                            <p className="text-[9px] text-slate-600 flex-shrink-0 font-semibold whitespace-nowrap">
                              {new Date(inq.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Detail panel */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4 h-fit sticky top-24">
                    {!selectedInquiry ? (
                      <div className="py-16 text-center space-y-2">
                        <Eye className="h-10 w-10 text-slate-700 mx-auto" />
                        <p className="text-slate-500 text-sm font-semibold">Select an inquiry to read</p>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-white">{selectedInquiry.name}</h3>
                            <p className="text-xs text-fuchsia-400 font-semibold">{selectedInquiry.email}</p>
                            <p className="text-[10px] text-slate-600 mt-0.5">
                              {new Date(selectedInquiry.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                            </p>
                          </div>
                        </div>
                        {selectedInquiry.subject && (
                          <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-3">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Subject</p>
                            <p className="text-xs font-bold text-slate-200">{selectedInquiry.subject}</p>
                          </div>
                        )}
                        <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-4">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-2">Message</p>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
                        </div>
                        <a href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject || "Your Inquiry")}`}
                          className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110 py-2.5 text-xs font-bold text-white transition-all shadow-md shadow-fuchsia-500/15">
                          <Mail className="h-3.5 w-3.5" />
                          Reply via Email
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── DOCTORS ──────────────────────────────── */}
            {activeTab === "doctors" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white">Doctor & Specialist Roster</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{doctors.length} active specialists across all departments</p>
                </div>

                {/* Specialty filters */}
                <div className="flex flex-wrap gap-2">
                  {["All", "General Medicine", "Cardiology", "Neurology", "Pediatrics", "Dermatology", "Orthopedics"].map(sp => (
                    <button key={sp}
                      className="rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-3.5 py-1.5 text-xs font-semibold text-slate-400 transition-all">
                      {sp}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topDoctors.map((dr, i) => (
                    <div key={dr.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="relative flex-shrink-0">
                          <img src={dr.avatar} alt={dr.name}
                            className="h-12 w-12 rounded-xl object-cover border border-white/10"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(dr.name) + "&background=7c3aed&color=fff"; }}
                          />
                          {i < 3 && (
                            <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-[9px] font-black text-white border border-[#06040b]">
                              {i + 1}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-white truncate">{dr.name}</h4>
                          <p className="text-[10px] text-fuchsia-400 font-semibold truncate">{dr.specialty}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-black text-white">{dr.rating.toFixed(1)}</span>
                          <div className="flex gap-0.5 ml-1">
                            {[1, 2, 3, 4, 5].map(s => (
                              <div key={s} className={`h-1.5 w-3 rounded-full ${s <= Math.round(dr.rating) ? "bg-amber-400" : "bg-white/10"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-slate-500 font-semibold">{dr.experience}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
