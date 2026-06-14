// src/app/dashboard/page.tsx
"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc, addDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { seedDatabaseIfNeeded } from "@/lib/seed";
import {
  Calendar, Clock, User, LogOut, PlusCircle, CreditCard, FolderHeart,
  UserCog, HeartPulse, FileText, Plus, Trash2, Save, Check, Video,
  VideoOff, Mic, MicOff, PhoneOff, MessageSquare, Send, ScreenShare,
  Star, Volume2, ChevronLeft, Activity, LayoutDashboard, Stethoscope,
  ShieldCheck, TrendingUp, Bell, ChevronRight, Sparkles, X,
  Download, AlertTriangle, BellRing, LineChart as LineChartIcon
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

interface Appointment {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  price: number;
  status: string;
  createdAt: string;
}

interface MedicalRecord {
  id: string;
  userId: string;
  type: "clinical" | "patient_log";
  doctorName?: string;
  serviceName?: string;
  notes: string;
  prescriptions?: string[];
  date: string;
  createdAt: string;
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  // Tab State
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "profile" | "records">("overview");

  // Appointments State
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [fetchingAppts, setFetchingAppts] = useState(true);

  // Profile Fields State
  const [profile, setProfile] = useState({
    dob: "",
    gender: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  // Medical Records State
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [fetchingRecords, setFetchingRecords] = useState(true);

  // Patient Log Creation State
  const [newLog, setNewLog] = useState("");
  const [addingLog, setAddingLog] = useState(false);

  // Telehealth Consultation Room State
  const [activeTelehealthAppt, setActiveTelehealthAppt] = useState<Appointment | null>(null);
  const [chatMessages, setChatMessages] = useState<{ id: string; senderId: string; senderName: string; text: string; createdAt: string }[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [isDoctorTyping, setIsDoctorTyping] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Doctor Ratings & Reviews State
  const [reviewModalAppt, setReviewModalAppt] = useState<Appointment | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewedAppts, setReviewedAppts] = useState<Record<string, boolean>>({});

  // Sidebar mobile toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Appointment Cancellation State
  const [cancelModalAppt, setCancelModalAppt] = useState<Appointment | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Notification permission
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notifBannerDismissed, setNotifBannerDismissed] = useState(false);

  // PDF print ref
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/signin");
    }
  }, [user, loading, router]);

  // Browser Push Notification setup
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotifPermission("unsupported");
      return;
    }
    setNotifPermission(Notification.permission);
  }, []);

  // Check for upcoming appointments and notify
  useEffect(() => {
    if (notifPermission !== "granted" || appointments.length === 0) return;
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    appointments.forEach(appt => {
      if (appt.status !== "confirmed") return;
      try {
        const apptDate = new Date(`${appt.date} ${appt.time.split(" - ")[0] || appt.time}`);
        if (apptDate > now && apptDate <= in24h) {
          new Notification("AuraCare Appointment Reminder 🏥", {
            body: `Your ${appt.serviceName} with ${appt.doctorName} is tomorrow at ${appt.time}.`,
            icon: "/favicon.ico",
            tag: appt.id,
          });
        }
      } catch {}
    });
  }, [notifPermission, appointments]);

  const requestNotifPermission = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
    if (perm === "granted") {
      new Notification("AuraCare Notifications Enabled ✅", {
        body: "You will receive reminders for upcoming appointments.",
        icon: "/favicon.ico",
      });
    }
  };

  useEffect(() => {
    if (user) {
      seedDatabaseIfNeeded();

      async function fetchAppointments() {
        if (!user) return [];
        try {
          const q = query(collection(db, "appointments"), where("userId", "==", user.uid));
          const snap = await getDocs(q);
          const list = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<Appointment, "id">),
          }));
          const sorted = list.sort((a, b) => {
            const dateA = new Date(`${a.date} ${a.time.split(" - ")[0] || a.time}`);
            const dateB = new Date(`${b.date} ${b.time.split(" - ")[0] || b.time}`);
            return dateA.getTime() - dateB.getTime();
          });
          setAppointments(sorted);
          return sorted;
        } catch (err) {
          console.error("Error fetching appointments:", err);
          return [];
        } finally {
          setFetchingAppts(false);
        }
      }

      async function fetchProfile() {
        if (!user) return;
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfile({
              dob: data.dob || "",
              gender: data.gender || "",
              bloodGroup: data.bloodGroup || "",
              allergies: data.allergies || "",
              emergencyContact: data.emergencyContact || "",
            });
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
        }
      }

      async function fetchMedicalRecords(apptsList: Appointment[]) {
        if (!user) return;
        setFetchingRecords(true);
        try {
          const q = query(collection(db, "medical_records"), where("userId", "==", user.uid));
          const snap = await getDocs(q);
          const list = snap.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<MedicalRecord, "id">),
          }));
          const sorted = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRecords(sorted);
          await autoSeedClinicalNotes(apptsList, sorted);
        } catch (err) {
          console.error("Error fetching medical records:", err);
        } finally {
          setFetchingRecords(false);
        }
      }

      async function autoSeedClinicalNotes(apptsList: Appointment[], existingRecords: MedicalRecord[]) {
        if (!user) return;
        const missingAppts = apptsList.filter(appt =>
          appt.status === "confirmed" &&
          !existingRecords.some(rec => rec.id === appt.id)
        );
        if (missingAppts.length === 0) return;
        const seededRecords: MedicalRecord[] = [];
        for (const appt of missingAppts) {
          let notes = "Routine clinical review and general consultation checkup.";
          let prescriptions: string[] = ["General wellness multivitamin - 1 daily"];
          const service = appt.serviceName.toLowerCase();
          if (service.includes("cardio")) {
            notes = "Patient shows mild tachycardia. Recommended low sodium diet and stress management. Scheduled follow-up ECG in 3 months.";
            prescriptions = ["Lisinopril 10mg - 1 tablet daily in morning", "Aspirin 81mg - 1 tablet daily after food"];
          } else if (service.includes("neuro")) {
            notes = "Evaluated patient for persistent tension headaches. Advised consistent sleep cycle and hydration. MRI scan recommended if symptoms persist.";
            prescriptions = ["Sumatriptan 50mg - 1 tablet at onset of headache", "Magnesium Oxide 400mg - daily before sleep"];
          } else if (service.includes("pediat")) {
            notes = "Routine developmental checkup. Growth charts are in the 85th percentile. Vaccinations are up to date.";
            prescriptions = ["Children's Vitamin D3 Drops - 400 IU daily"];
          } else if (service.includes("dermat")) {
            notes = "Patient presented with mild localized dry eczema. Advised unscented moisturizers, short lukewarm showers, and avoiding harsh soaps.";
            prescriptions = ["Hydrocortisone Cream 2.5% - apply thin layer twice daily", "Cetirizine 10mg - daily at night for itching"];
          } else if (service.includes("ortho")) {
            notes = "Evaluated patient for mild knee strain. Recommended physical therapy exercises (quad strengthening) and ice packing for swelling.";
            prescriptions = ["Ibuprofen 400mg - every 6-8 hours as needed for pain"];
          } else if (service.includes("general")) {
            notes = "Reviewed basic vitals and lab panels. Blood pressure and lipids are within normal limits. General health status is excellent.";
            prescriptions = ["Vitamin D3 2000 IU - 1 softgel daily"];
          }
          const newRecord: Omit<MedicalRecord, "id"> = {
            userId: user.uid,
            type: "clinical",
            doctorName: appt.doctorName,
            serviceName: appt.serviceName,
            notes,
            prescriptions,
            date: appt.date,
            createdAt: new Date().toISOString(),
          };
          try {
            await setDoc(doc(db, "medical_records", appt.id), newRecord);
            seededRecords.push({ id: appt.id, ...newRecord });
          } catch (err) {
            console.error("Error auto-seeding medical record:", err);
          }
        }
        if (seededRecords.length > 0) {
          setRecords(prev => {
            const combined = [...prev, ...seededRecords];
            return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          });
        }
      }

      async function fetchUserReviews() {
        if (!user) return;
        try {
          const q = query(collection(db, "reviews"), where("userId", "==", user.uid));
          const snap = await getDocs(q);
          const mapping: Record<string, boolean> = {};
          snap.docs.forEach((doc) => {
            const data = doc.data();
            if (data.appointmentId) mapping[data.appointmentId] = true;
          });
          setReviewedAppts(mapping);
        } catch (err) {
          console.error("Error fetching reviews mapping:", err);
        }
      }

      async function initDashboardData() {
        const apptsList = await fetchAppointments();
        await fetchProfile();
        await fetchMedicalRecords(apptsList);
        await fetchUserReviews();
      }

      initDashboardData();
    }
  }, [user]);

  const handleSignOut = async () => {
    try {
      await logout();
      router.push("/auth/signin");
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    setProfileSuccessMsg("");
    try {
      await updateDoc(doc(db, "users", user.uid), {
        dob: profile.dob,
        gender: profile.gender,
        bloodGroup: profile.bloodGroup,
        allergies: profile.allergies,
        emergencyContact: profile.emergencyContact,
      });
      setProfileSuccessMsg("Profile details saved successfully!");
      setTimeout(() => setProfileSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newLog.trim()) return;
    setAddingLog(true);
    try {
      const recordData = {
        userId: user.uid,
        type: "patient_log" as const,
        notes: newLog.trim(),
        date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, "medical_records"), recordData);
      setRecords(prev => [{ id: docRef.id, ...recordData }, ...prev]);
      setNewLog("");
    } catch (err) {
      console.error("Error saving patient health log:", err);
    } finally {
      setAddingLog(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this custom health log?")) return;
    try {
      await deleteDoc(doc(db, "medical_records", id));
      setRecords(prev => prev.filter(rec => rec.id !== id));
    } catch (err) {
      console.error("Error deleting medical record:", err);
    }
  };

  // Cancel appointment
  const handleCancelAppointment = async () => {
    if (!cancelModalAppt) return;
    setIsCancelling(true);
    try {
      await updateDoc(doc(db, "appointments", cancelModalAppt.id), { status: "cancelled" });
      setAppointments(prev => prev.map(a => a.id === cancelModalAppt.id ? { ...a, status: "cancelled" } : a));
      setCancelModalAppt(null);
    } catch (err) {
      console.error("Error cancelling appointment:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  // PDF download for a clinical record
  const handleDownloadPDF = (rec: MedicalRecord) => {
    const content = `
AURACARE CLINIC — CLINICAL RECORD
===================================
Date: ${rec.date}
Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "long" })}

SERVICE: ${rec.serviceName || "—"}
ATTENDING SPECIALIST: ${rec.doctorName || "—"}

DIAGNOSTIC NOTES:
${rec.notes}

${rec.prescriptions && rec.prescriptions.length > 0 ? `PRESCRIPTIONS:\n${rec.prescriptions.map((p, i) => `  ${i + 1}. ${p}`).join("\n")}` : ""}

---
This document is confidential and intended for the named patient only.
AuraCare Clinic | Encrypted Patient Records System
    `.trim();

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AuraCare_Record_${rec.serviceName?.replace(/\s+/g, "_") || "Clinical"}_${rec.date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      if (activeTelehealthAppt) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
        } catch (err) {
          console.warn("Could not acquire media devices:", err);
        }
      } else {
        if (localStream) {
          localStream.getTracks().forEach((track) => track.stop());
          setLocalStream(null);
        }
      }
    }
    startCamera();
    return () => { if (stream) stream.getTracks().forEach((track) => track.stop()); };
  }, [activeTelehealthAppt]);

  useEffect(() => {
    if (videoRef.current && localStream) {
      videoRef.current.srcObject = localStream;
    }
  }, [localStream, activeTelehealthAppt]);

  useEffect(() => {
    if (!activeTelehealthAppt) { setChatMessages([]); return; }
    const q = query(collection(db, "messages"), where("appointmentId", "==", activeTelehealthAppt.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as { id: string; senderId: string; senderName: string; text: string; createdAt: string }[];
      setChatMessages(msgs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
    });
    return () => unsubscribe();
  }, [activeTelehealthAppt]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeTelehealthAppt || !typedMessage.trim()) return;
    const text = typedMessage.trim();
    setTypedMessage("");
    try {
      await addDoc(collection(db, "messages"), {
        appointmentId: activeTelehealthAppt.id,
        senderId: user.uid,
        senderName: user.displayName || "Patient",
        text,
        createdAt: new Date().toISOString(),
      });
      triggerDoctorAutoResponse(text);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const triggerDoctorAutoResponse = (patientText: string) => {
    if (!activeTelehealthAppt) return;
    setIsDoctorTyping(true);
    const docName = activeTelehealthAppt.doctorName;
    const lowerText = patientText.toLowerCase();
    let responseText = `Hello, I'm reviewing your latest clinical reports. Do you have any specific symptoms today?`;
    if (lowerText.includes("heart") || lowerText.includes("chest") || lowerText.includes("bp")) {
      responseText = `I am reviewing your real-time ECG waveform. Vitals appear stable, but please inform me immediately if you feel chest heaviness.`;
    } else if (lowerText.includes("headache") || lowerText.includes("pain") || lowerText.includes("migraine")) {
      responseText = `For persistent migraines, I recommend resting in a low-light environment and staying hydrated.`;
    } else if (lowerText.includes("allergy") || lowerText.includes("rash") || lowerText.includes("skin")) {
      responseText = `Try not to scratch the irritated skin. Apply the hydrocortisone ointment twice daily.`;
    } else if (lowerText.includes("hello") || lowerText.includes("hi") || lowerText.includes("hey")) {
      responseText = `Hello! Welcome to our secure digital clinic. What symptoms or updates are we reviewing today?`;
    } else if (lowerText.includes("thank")) {
      responseText = `Excellent. I will document this in your medical record. Feel free to contact us if you need further help.`;
    }
    setTimeout(async () => {
      if (!activeTelehealthAppt) return;
      try {
        await addDoc(collection(db, "messages"), {
          appointmentId: activeTelehealthAppt.id,
          senderId: "doctor",
          senderName: docName,
          text: responseText,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error("Error saving doctor auto-reply:", err);
      } finally {
        setIsDoctorTyping(false);
      }
    }, 1500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewModalAppt || ratingValue === 0) return;
    setIsSubmittingReview(true);
    try {
      const newReview = {
        appointmentId: reviewModalAppt.id,
        userId: user.uid,
        userName: user.displayName || "Patient",
        doctorId: reviewModalAppt.doctorId,
        doctorName: reviewModalAppt.doctorName,
        rating: ratingValue,
        reviewText: reviewText.trim(),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "reviews", reviewModalAppt.id), newReview);
      const q = query(collection(db, "reviews"), where("doctorId", "==", reviewModalAppt.doctorId));
      const snap = await getDocs(q);
      const allRatings = snap.docs.map((doc) => doc.data().rating as number);
      const docRef = doc(db, "doctors", reviewModalAppt.doctorId);
      const docSnap = await getDoc(docRef);
      let baselineRating = 4.8;
      if (docSnap.exists()) baselineRating = docSnap.data().rating || 4.8;
      const sumRatings = allRatings.reduce((sum, val) => sum + val, 0);
      const updatedRating = parseFloat(((baselineRating * 5 + sumRatings) / (5 + allRatings.length)).toFixed(2));
      await updateDoc(docRef, { rating: updatedRating });
      setReviewedAppts((prev) => ({ ...prev, [reviewModalAppt.id]: true }));
      setRatingValue(0);
      setReviewText("");
      setReviewModalAppt(null);
    } catch (err) {
      console.error("Error submitting doctor review:", err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // ── Computed stats ──────────────────────────────────
  const totalSpend = appointments.reduce((s, a) => s + (a.price || 0), 0);
  const confirmedCount = appointments.filter(a => a.status === "confirmed").length;
  const clinicalCount = records.filter(r => r.type === "clinical").length;

  // ── Sidebar nav items ───────────────────────────────
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "records", label: "Records", icon: FileText },
    { id: "profile", label: "My Profile", icon: UserCog },
  ] as const;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06040b] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
            <div className="absolute inset-3 rounded-full border-2 border-teal-500/20 border-b-teal-500 animate-spin" style={{ animationDirection: "reverse" }} />
          </div>
          <span className="text-slate-400 font-semibold tracking-wide text-sm">Loading your dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // ══════════════════════════════════════════════════════
  // TELEHEALTH ROOM — full-screen overlay
  // ══════════════════════════════════════════════════════
  if (activeTelehealthAppt) {
    return (
      <div className="min-h-screen bg-[#06040b] text-white flex flex-col">
        {/* Telehealth top bar */}
        <div className="flex items-center justify-between border-b border-white/5 bg-[#0e0a1f]/80 backdrop-blur-md px-6 py-3.5">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTelehealthAppt(null)} className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-xs font-semibold">
              <ChevronLeft className="h-4 w-4" />
              Exit Session
            </button>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Secure Telehealth</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Specialist:</span>
            <span className="font-bold text-white bg-white/5 border border-white/10 rounded-lg px-3 py-1">
              {activeTelehealthAppt.doctorName}
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-fuchsia-400 font-semibold">{activeTelehealthAppt.serviceName}</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Feeds */}
          <div className="lg:col-span-7 p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Patient cam */}
              <div className="relative aspect-video rounded-2xl border border-white/5 bg-slate-950 overflow-hidden shadow-2xl">
                {isVideoOff ? (
                  <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-600">
                    <VideoOff className="h-8 w-8" />
                    <span className="text-xs font-semibold">Camera Off</span>
                  </div>
                ) : localStream ? (
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 text-slate-600 text-xs text-center px-4">
                    <div className="h-6 w-6 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                    <span>Requesting camera access…</span>
                  </div>
                )}
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
                  You (Patient)
                </div>
              </div>

              {/* Doctor stream */}
              <div className="relative aspect-video rounded-2xl border border-fuchsia-500/20 bg-slate-950 overflow-hidden shadow-2xl">
                <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                  <source src="/doctors.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                <svg className="absolute inset-x-0 bottom-0 h-10 w-full text-teal-400/40 pointer-events-none" viewBox="0 0 120 20" preserveAspectRatio="none">
                  <path d="M0 10 L40 10 L44 4 L48 16 L52 10 L56 10 L60 0 L64 20 L68 10 L72 10 L76 7 L80 13 L84 10 L120 10" fill="none" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-fuchsia-600/90 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase border border-fuchsia-500/30">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Specialist Live
                </div>
                <div className="absolute top-3 right-3 font-mono text-[9px] text-teal-300 bg-slate-950/70 p-1.5 rounded-lg border border-white/5 backdrop-blur-sm space-y-0.5">
                  <div className="flex items-center gap-1"><span className="h-1 w-1 rounded-full bg-emerald-400 animate-pulse" /><span>HR: 76 bpm</span></div>
                  <div className="text-fuchsia-400">BP: 120/80</div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {activeTelehealthAppt.doctorName}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500 font-semibold">Status:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Encrypted E2E Uplink
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsMuted(!isMuted)} title={isMuted ? "Unmute" : "Mute"}
                  className={`p-2.5 rounded-xl border transition-all ${isMuted ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-white/10 bg-white/5 text-slate-300 hover:text-white"}`}>
                  {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </button>
                <button onClick={() => setIsVideoOff(!isVideoOff)} title={isVideoOff ? "Enable Camera" : "Disable Camera"}
                  className={`p-2.5 rounded-xl border transition-all ${isVideoOff ? "border-rose-500/30 bg-rose-500/10 text-rose-400" : "border-white/10 bg-white/5 text-slate-300 hover:text-white"}`}>
                  {isVideoOff ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
                </button>
                <button onClick={() => setIsScreenSharing(!isScreenSharing)} title="Share Screen"
                  className={`p-2.5 rounded-xl border transition-all ${isScreenSharing ? "border-teal-500/30 bg-teal-500/10 text-teal-400" : "border-white/10 bg-white/5 text-slate-300 hover:text-white"}`}>
                  <ScreenShare className="h-4 w-4" />
                </button>
                <button onClick={() => setActiveTelehealthAppt(null)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors">
                  <PhoneOff className="h-3.5 w-3.5" />
                  End Consult
                </button>
              </div>
            </div>

            {/* Context */}
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-400 leading-relaxed">
              <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px] block mb-1">Consultation Context</span>
              This room provides end-to-end encrypted audio, video, and text diagnostic feeds. After the session ends, details will be logged into your clinical history timeline.
            </div>
          </div>

          {/* Secure Chat */}
          <div className="lg:col-span-5 border-l border-white/5 flex flex-col bg-[#080613]/60">
            <div className="border-b border-white/5 p-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-fuchsia-400" />
                  Secure Chat
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">Direct line with {activeTelehealthAppt.doctorName}</p>
              </div>
              <Volume2 className="h-4 w-4 text-slate-600" />
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center p-6 text-slate-600 text-xs leading-relaxed">
                  Send a greeting to start your secure consultation.
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col max-w-[82%] ${msg.senderId === user.uid ? "ml-auto items-end" : "mr-auto items-start"}`}>
                    <span className="text-[9px] text-slate-600 font-semibold mb-0.5">{msg.senderName}</span>
                    <div className={`rounded-2xl px-4 py-2.5 text-xs font-medium leading-relaxed ${msg.senderId === user.uid ? "bg-gradient-to-br from-teal-600 to-emerald-600 text-white rounded-tr-none" : "bg-white/5 border border-white/10 text-slate-200 rounded-tl-none"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {isDoctorTyping && (
                <div className="flex flex-col items-start max-w-[82%] mr-auto">
                  <span className="text-[9px] text-slate-600 font-semibold mb-0.5">{activeTelehealthAppt.doctorName}</span>
                  <div className="rounded-2xl rounded-tl-none bg-white/5 border border-white/10 px-4 py-3 flex items-center gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleSendMessage} className="border-t border-white/5 p-3 flex gap-2">
              <input type="text" placeholder="Type a message…" value={typedMessage} onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-all" required />
              <button type="submit" className="rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 hover:brightness-110 p-2.5 text-white transition-all">
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // MAIN DASHBOARD LAYOUT
  // ══════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#06040b] text-white flex overflow-hidden">

      {/* Ambient Glows */}
      <div className="fixed top-[-10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-fuchsia-500/8 via-violet-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-[10%] right-[5%] w-[500px] h-[500px] bg-gradient-to-bl from-emerald-500/8 via-teal-600/5 to-transparent rounded-full blur-[140px] pointer-events-none" />

      {/* ─── Sidebar ─────────────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/5 bg-[#0a0715]/90 backdrop-blur-xl flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:flex`}>
        {/* Brand */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 via-fuchsia-500 to-amber-400 p-[1.5px] shadow-lg shadow-fuchsia-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0a0715]">
                <Activity className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black bg-gradient-to-r from-emerald-400 via-fuchsia-400 to-amber-400 bg-clip-text text-transparent">AuraCare</span>
              <p className="text-[10px] text-slate-500 font-semibold -mt-0.5">Patient Portal</p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 pb-2">Main Menu</p>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === id
                ? "bg-gradient-to-r from-fuchsia-500/15 to-teal-500/10 text-white border border-fuchsia-500/20 shadow-sm shadow-fuchsia-500/10"
                : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}>
              <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${activeTab === id ? "text-fuchsia-400" : "text-slate-500"}`} />
              <span>{label}</span>
              {id === "appointments" && appointments.length > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-400 rounded-full px-2 py-0.5 border border-fuchsia-500/20">
                  {appointments.length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 px-3 pb-2">Quick Actions</p>
            <button onClick={() => router.push("/booking")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:brightness-110 transition-all shadow-md shadow-fuchsia-500/15 mb-2">
              <PlusCircle className="h-4 w-4 flex-shrink-0" />
              Book Appointment
            </button>
            <button onClick={() => router.push("/admin")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-white hover:bg-white/5 border border-white/5 transition-all">
              <ShieldCheck className="h-3.5 w-3.5 flex-shrink-0" />
              Admin Panel
            </button>
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-fuchsia-500 to-violet-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
              {(user.displayName || user.email || "P")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.displayName || "Patient"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 py-2 text-xs font-semibold text-slate-400 transition-all">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Main Content ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="border-b border-white/5 bg-[#06040b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white transition-colors">
              <LayoutDashboard className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-bold text-white capitalize">
                {activeTab === "overview" ? "Dashboard Overview" : activeTab === "appointments" ? "My Appointments" : activeTab === "records" ? "Medical Records" : "My Profile"}
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold border border-emerald-500/20 bg-emerald-500/10 rounded-full px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">HIPAA Secured</span>
            </div>
            <button
              onClick={requestNotifPermission}
              title={notifPermission === "granted" ? "Notifications enabled" : "Enable appointment reminders"}
              className={`p-2 rounded-xl border transition-colors relative ${
                notifPermission === "granted"
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
              }`}>
              <Bell className="h-4 w-4" />
              {notifPermission === "default" && appointments.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-fuchsia-500 border border-[#06040b] animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Notification Permission Banner */}
          {notifPermission === "default" && !notifBannerDismissed && (
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-5 py-3.5">
              <div className="flex items-center gap-3">
                <BellRing className="h-4 w-4 text-amber-400 flex-shrink-0 animate-pulse" />
                <p className="text-xs font-semibold text-amber-200">
                  Enable browser notifications to receive appointment reminders
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={requestNotifPermission}
                  className="rounded-lg bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 px-3 py-1.5 text-xs font-bold text-amber-400 transition-all">
                  Enable
                </button>
                <button onClick={() => setNotifBannerDismissed(true)} className="text-slate-600 hover:text-slate-400 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#140e28] via-[#0e0a1f] to-[#06040b] p-8">
                <div className="absolute top-[-30%] right-[-10%] w-[350px] h-[350px] bg-gradient-to-bl from-fuchsia-500/20 via-violet-600/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[20%] w-[250px] h-[250px] bg-gradient-to-tr from-teal-500/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-bold text-fuchsia-300 uppercase tracking-widest">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      Patient Dashboard
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tight">
                      Welcome back,{" "}
                      <span className="bg-gradient-to-r from-fuchsia-400 to-teal-400 bg-clip-text text-transparent">
                        {user.displayName?.split(" ")[0] || "Patient"}
                      </span>
                    </h2>
                    <p className="text-slate-400 text-sm max-w-md">Your health metrics and appointments are all in one secure place.</p>
                  </div>
                  <button onClick={() => router.push("/booking")}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-600 to-teal-500 hover:brightness-110 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg shadow-fuchsia-500/20 whitespace-nowrap">
                    <PlusCircle className="h-4 w-4" />
                    Book New Appointment
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    label: "Total Appointments",
                    value: appointments.length,
                    icon: Calendar,
                    color: "from-fuchsia-500 to-violet-600",
                    glow: "shadow-fuchsia-500/20",
                    sub: `${confirmedCount} confirmed`,
                  },
                  {
                    label: "Total Spent",
                    value: `$${totalSpend}`,
                    icon: CreditCard,
                    color: "from-emerald-500 to-teal-500",
                    glow: "shadow-emerald-500/20",
                    sub: "via Stripe Payments",
                  },
                  {
                    label: "Clinical Records",
                    value: clinicalCount,
                    icon: FileText,
                    color: "from-amber-500 to-rose-500",
                    glow: "shadow-amber-500/20",
                    sub: `${records.filter(r => r.type === "patient_log").length} self-logged`,
                  },
                  {
                    label: "Doctors Rated",
                    value: Object.keys(reviewedAppts).length,
                    icon: Star,
                    color: "from-violet-500 to-fuchsia-500",
                    glow: "shadow-violet-500/20",
                    sub: "reviews submitted",
                  },
                ].map((stat, i) => (
                  <div key={i} className={`relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] p-5 backdrop-blur-sm hover:border-white/10 transition-all duration-300 shadow-lg ${stat.glow}`}>
                    <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${stat.color} opacity-10 rounded-full blur-2xl`} />
                    <div className="relative z-10">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                        <stat.icon className="h-4.5 w-4.5 text-white" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-black text-white mt-1">{fetchingAppts ? "…" : stat.value}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5 font-semibold">{stat.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick sections row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Latest Appointments */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-fuchsia-400" />
                      Recent Appointments
                    </h3>
                    <button onClick={() => setActiveTab("appointments")} className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300 flex items-center gap-1">
                      View all <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  {fetchingAppts ? (
                    <div className="flex justify-center py-6"><div className="h-5 w-5 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" /></div>
                  ) : appointments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-slate-500 text-xs">
                      No appointments yet. <button onClick={() => router.push("/booking")} className="text-fuchsia-400 hover:underline ml-1">Book one now →</button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {appointments.slice(0, 3).map((appt) => (
                        <div key={appt.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-teal-500/20 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="h-4 w-4 text-fuchsia-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{appt.serviceName}</p>
                              <p className="text-[10px] text-slate-500 truncate">{appt.doctorName} · {appt.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-teal-400">${appt.price}</span>
                            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 uppercase">
                              {appt.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feature Guide */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    What You Can Do
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { label: "Join Telehealth Consultation", desc: "Video call with your assigned specialist", icon: Video, color: "text-teal-400", bg: "bg-teal-500/10", tab: "appointments" as const },
                      { label: "View Clinical Notes", desc: "Doctor diagnoses and prescriptions", icon: FileText, color: "text-fuchsia-400", bg: "bg-fuchsia-500/10", tab: "records" as const },
                      { label: "Log Daily Vitals", desc: "Track symptoms and health entries", icon: HeartPulse, color: "text-rose-400", bg: "bg-rose-500/10", tab: "records" as const },
                      { label: "Update Health Profile", desc: "Blood group, allergies, emergency contacts", icon: UserCog, color: "text-amber-400", bg: "bg-amber-500/10", tab: "profile" as const },
                      { label: "Rate Your Doctor", desc: "Submit feedback after your consultation", icon: Star, color: "text-violet-400", bg: "bg-violet-500/10", tab: "appointments" as const },
                    ].map((feat, i) => (
                      <button key={i} onClick={() => setActiveTab(feat.tab)}
                        className="w-full flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-white/10 hover:bg-white/[0.04] transition-all text-left">
                        <div className={`h-7 w-7 rounded-lg ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                          <feat.icon className={`h-3.5 w-3.5 ${feat.color}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white">{feat.label}</p>
                          <p className="text-[10px] text-slate-500">{feat.desc}</p>
                        </div>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-600 ml-auto flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── APPOINTMENTS TAB ──────────────────────────── */}
          {activeTab === "appointments" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">My Appointments</h2>
                  <p className="text-xs text-slate-500 mt-0.5">All your booked consultations with AuraCare specialists.</p>
                </div>
                <button onClick={() => router.push("/booking")}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-fuchsia-500/15">
                  <PlusCircle className="h-3.5 w-3.5" />
                  New Booking
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main appointments list */}
                <div className="lg:col-span-2 space-y-3">
                  {fetchingAppts ? (
                    <div className="flex justify-center py-16"><div className="h-7 w-7 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" /></div>
                  ) : appointments.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 p-16 text-center space-y-3">
                      <Calendar className="h-10 w-10 text-slate-700 mx-auto" />
                      <p className="text-slate-500 text-sm font-semibold">No appointments scheduled</p>
                      <button onClick={() => router.push("/booking")} className="inline-flex items-center gap-2 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-xs font-bold px-5 py-2 hover:bg-fuchsia-500/20 transition-colors">
                        <PlusCircle className="h-3.5 w-3.5" />
                        Book your first appointment
                      </button>
                    </div>
                  ) : (
                    appointments.map((appt) => (
                      <div key={appt.id} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all backdrop-blur-sm space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 min-w-0">
                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-teal-500/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                              <Stethoscope className="h-5 w-5 text-fuchsia-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-sm font-bold text-white">{appt.serviceName}</h4>
                                <span className={`rounded-full text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wide border ${
                                  appt.status === "confirmed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                  : appt.status === "cancelled" ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                                  : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                }`}>
                                  {appt.status}
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><User className="h-3 w-3" />{appt.doctorName}</span>
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{appt.date}</span>
                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{appt.time}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <p className="text-[10px] text-slate-600 font-semibold">Paid</p>
                            <p className="text-lg font-black text-teal-400">${appt.price}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 border-t border-white/5 pt-3 flex-wrap">
                          {appt.status === "confirmed" && (
                            <button onClick={() => setActiveTelehealthAppt(appt)}
                              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 px-4 py-2 text-xs font-bold text-white transition-all shadow shadow-teal-500/15">
                              <Video className="h-3.5 w-3.5" />
                              Join Telehealth Consult
                            </button>
                          )}
                          {reviewedAppts[appt.id] ? (
                            <span className="inline-flex items-center gap-1.5 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400 text-xs font-bold px-3.5 py-2">
                              <Star className="h-3 w-3 fill-current" />
                              Reviewed
                            </span>
                          ) : (
                            <button onClick={() => setReviewModalAppt(appt)}
                              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-400 transition-all">
                              <Star className="h-3.5 w-3.5" />
                              Rate Doctor
                            </button>
                          )}
                          <button onClick={() => { setActiveTab("records"); }}
                            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white px-3.5 py-2 text-xs font-bold text-slate-400 transition-all">
                            <FileText className="h-3.5 w-3.5" />
                            View Record
                          </button>
                          {appt.status !== "cancelled" && (
                            <button onClick={() => setCancelModalAppt(appt)}
                              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/15 text-rose-400 px-3.5 py-2 text-xs font-bold transition-all ml-auto">
                              <X className="h-3.5 w-3.5" />
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Right panel */}
                <div className="space-y-4">
                  {/* Billing summary */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-emerald-400" />
                      Billing History
                    </h4>
                    {appointments.length === 0 ? (
                      <p className="text-xs text-slate-600 text-center py-4">No payments yet.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {appointments.slice(0, 4).map((appt) => (
                          <div key={appt.id} className="flex justify-between items-center text-xs border-b border-white/5 pb-2.5">
                            <div>
                              <p className="font-semibold text-slate-300">{appt.serviceName}</p>
                              <p className="text-slate-600">{appt.date}</p>
                            </div>
                            <span className="font-black text-emerald-400">${appt.price}</span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-1 text-xs font-black">
                          <span className="text-slate-400">Total Spent</span>
                          <span className="text-teal-400 text-sm">${totalSpend}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Clinical notes shortcut */}
                  <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/5 p-5 space-y-3">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <HeartPulse className="h-4 w-4 text-fuchsia-400" />
                      Clinical Notes Ready
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your specialist has released {clinicalCount} clinical note{clinicalCount !== 1 ? "s" : ""} and prescriptions.
                    </p>
                    <button onClick={() => setActiveTab("records")}
                      className="w-full text-center py-2.5 rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/10 text-xs font-bold text-fuchsia-400 hover:bg-fuchsia-500/20 transition-colors">
                      View All Clinical Records →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RECORDS TAB ───────────────────────────────── */}
          {activeTab === "records" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Medical Records & Health Logs</h2>
                <p className="text-xs text-slate-500 mt-0.5">Official clinical notes, prescriptions, and your personal health diary.</p>
              </div>

              {/* Log entry form */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm">
                <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                  <HeartPulse className="h-4 w-4 text-rose-400" />
                  Log Daily Vitals / Symptoms
                </h4>
                <form onSubmit={handleAddLog} className="flex gap-3 items-center">
                  <div className="flex-1 relative">
                    <input type="text" placeholder="e.g., Blood pressure: 118/75. Feeling great today."
                      value={newLog} onChange={(e) => setNewLog(e.target.value)}
                      className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-xs transition-all" required />
                  </div>
                  <button type="submit" disabled={addingLog}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-violet-600 hover:brightness-110 px-5 py-3 text-xs font-bold text-white transition-all disabled:opacity-50 whitespace-nowrap shadow-md shadow-fuchsia-500/15">
                    <Plus className="h-4 w-4" />
                    {addingLog ? "Saving…" : "Add Log"}
                  </button>
                </form>
              </div>

              {/* Health Trend Chart */}
              {(() => {
                const logEntries = records.filter(r => r.type === "patient_log");
                const chartData = logEntries.slice(0, 8).reverse().map((r, i) => {
                  // Try to extract systolic BP from notes like "118/75" or "bp: 120"
                  const bpMatch = r.notes.match(/(\d{2,3})\/(\d{2,3})/);
                  const singleBP = r.notes.match(/bp[:\s]*?(\d{2,3})/i);
                  const sys = bpMatch ? parseInt(bpMatch[1]) : (singleBP ? parseInt(singleBP[1]) : null);
                  return {
                    name: `Log ${i + 1}`,
                    date: r.date.split(", ").slice(-1)[0] || r.date,
                    bp: sys,
                  };
                }).filter(d => d.bp !== null);
                if (chartData.length < 2) return null;
                return (
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <LineChartIcon className="h-4 w-4 text-teal-400" />
                        Health Vitals Trend
                      </h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood Pressure (Systolic) — Last {chartData.length} Logs</span>
                    </div>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                          <defs>
                            <linearGradient id="bpGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="date" tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} tickLine={false} domain={["dataMin - 10", "dataMax + 10"]} />
                          <Tooltip
                            contentStyle={{ background: "#0a0715", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: "11px", color: "#e2e8f0" }}
                            labelStyle={{ color: "#94a3b8", fontWeight: 700 }}
                            formatter={(val: any) => [`${val} mmHg`, "Systolic BP"]}
                          />
                          <Area type="monotone" dataKey="bp" stroke="#14b8a6" strokeWidth={2} fill="url(#bpGrad)" dot={{ fill: "#14b8a6", r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: "#2dd4bf" }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-600 text-center">Tip: Log entries with blood pressure readings (e.g., "BP: 120/80") will auto-appear in this chart.</p>
                  </div>
                );
              })()}

              {/* Records timeline */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 text-fuchsia-400" />
                    Clinical Records & Prescriptions
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] font-semibold">
                    <span className="flex items-center gap-1 text-fuchsia-400"><span className="h-2 w-2 rounded-full bg-fuchsia-500" />Official</span>
                    <span className="flex items-center gap-1 text-emerald-400"><span className="h-2 w-2 rounded-full bg-emerald-500" />Self-Logged</span>
                  </div>
                </div>

                {fetchingRecords ? (
                  <div className="flex justify-center py-16"><div className="h-7 w-7 border-2 border-fuchsia-500/20 border-t-fuchsia-500 rounded-full animate-spin" /></div>
                ) : records.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 p-16 text-center space-y-2">
                    <FileText className="h-10 w-10 text-slate-700 mx-auto" />
                    <p className="text-slate-500 text-sm font-semibold">No records found</p>
                    <p className="text-xs text-slate-600">Book an appointment to generate your first clinical record.</p>
                  </div>
                ) : (
                  <div className="relative border-l-2 border-white/5 ml-4 pl-7 space-y-6">
                    {records.map((rec) => (
                      <div key={rec.id} className="relative">
                        <span className={`absolute -left-[39px] top-2 h-7 w-7 flex items-center justify-center rounded-full border-2 border-[#06040b] ${rec.type === "clinical" ? "bg-fuchsia-500 shadow-lg shadow-fuchsia-500/30" : "bg-emerald-500 shadow-lg shadow-emerald-500/30"}`}>
                          {rec.type === "clinical" ? <FileText className="h-3 w-3 text-white" /> : <HeartPulse className="h-3 w-3 text-white" />}
                        </span>
                        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 hover:border-white/10 transition-all space-y-3">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-bold text-white">
                                  {rec.type === "clinical" ? `Clinical Visit — ${rec.serviceName}` : "Personal Health Log"}
                                </h5>
                                <span className={`rounded-full text-[9px] font-bold px-2.5 py-0.5 uppercase tracking-wider border ${rec.type === "clinical" ? "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"}`}>
                                  {rec.type === "clinical" ? "Official Dx" : "Self-Logged"}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1">Logged: {rec.date}</p>
                            </div>
                            {rec.type === "patient_log" ? (
                              <button onClick={() => handleDeleteLog(rec.id)} className="text-slate-600 hover:text-rose-400 p-1 transition-colors flex-shrink-0" title="Delete">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button onClick={() => handleDownloadPDF(rec)} className="text-slate-600 hover:text-fuchsia-400 p-1.5 rounded-lg hover:bg-fuchsia-500/10 transition-all flex-shrink-0" title="Download Record">
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          {rec.type === "clinical" && <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">Diagnostic Notes</p>}
                          <p className="text-sm text-slate-300 leading-relaxed">{rec.notes}</p>
                          {rec.type === "clinical" && rec.prescriptions && rec.prescriptions.length > 0 && (
                            <div className="border-t border-white/5 pt-3 space-y-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Released Prescriptions</p>
                              <ul className="space-y-1.5">
                                {rec.prescriptions.map((med, idx) => (
                                  <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                                    <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 flex-shrink-0" />
                                    {med}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {rec.type === "clinical" && (
                            <p className="text-[10px] text-slate-600 border-t border-white/5 pt-2">
                              Attending: <span className="font-bold text-slate-500">{rec.doctorName}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PROFILE TAB ───────────────────────────────── */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white">Personal Health Profile</h2>
                <p className="text-xs text-slate-500 mt-0.5">Save your key medical details for clinic reference and emergency use.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profile form */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm space-y-5">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <UserCog className="h-4 w-4 text-fuchsia-400" />
                    Medical Information
                  </h4>

                  {profileSuccessMsg && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 flex items-center gap-2 text-xs text-emerald-400">
                      <Check className="h-4 w-4 flex-shrink-0" />
                      {profileSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    {[
                      { label: "Date of Birth", key: "dob", type: "date" },
                    ].map(field => (
                      <div key={field.key}>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{field.label}</label>
                        <input type={field.type} value={profile[field.key as keyof typeof profile]}
                          onChange={(e) => setProfile(prev => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500 focus:border-transparent text-sm transition-all" />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Gender</label>
                      <select value={profile.gender} onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm transition-all">
                        <option value="" className="bg-slate-900">Select Gender</option>
                        {["Male", "Female", "Other", "Prefer not to say"].map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Blood Group</label>
                      <select value={profile.bloodGroup} onChange={(e) => setProfile(prev => ({ ...prev, bloodGroup: e.target.value }))}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm transition-all">
                        <option value="" className="bg-slate-900">Select Blood Group</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(g => <option key={g} value={g} className="bg-slate-900">{g}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Known Allergies</label>
                      <textarea placeholder="e.g. Penicillin, Peanuts, Pollen (or write None)"
                        value={profile.allergies} onChange={(e) => setProfile(prev => ({ ...prev, allergies: e.target.value }))}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm resize-none h-20 transition-all" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Emergency Contact</label>
                      <input type="text" placeholder="e.g. Jane Doe (Wife) — +1 (555) 012-3456"
                        value={profile.emergencyContact} onChange={(e) => setProfile(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-sm transition-all" />
                    </div>

                    <button type="submit" disabled={savingProfile}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 py-3 text-sm font-bold text-white transition-all disabled:opacity-50 shadow-md shadow-violet-500/15">
                      <Save className="h-4 w-4" />
                      {savingProfile ? "Saving…" : "Save Profile"}
                    </button>
                  </form>
                </div>

                {/* Profile summary card */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-[#140e28] to-[#0a0715] p-6 space-y-5">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center text-2xl font-black flex-shrink-0 shadow-lg shadow-fuchsia-500/20">
                        {(user.displayName || user.email || "P")[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">{user.displayName || "Patient"}</h4>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                          <ShieldCheck className="h-2.5 w-2.5" />
                          Verified Patient
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Blood Group", value: profile.bloodGroup || "—", color: "text-rose-400" },
                        { label: "Gender", value: profile.gender || "—", color: "text-fuchsia-400" },
                        { label: "Date of Birth", value: profile.dob ? new Date(profile.dob).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—", color: "text-amber-400" },
                        { label: "Appointments", value: appointments.length.toString(), color: "text-teal-400" },
                      ].map((item, i) => (
                        <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600">{item.label}</p>
                          <p className={`text-sm font-bold mt-0.5 ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>

                    {profile.allergies && (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-rose-500 mb-1">⚠ Known Allergies</p>
                        <p className="text-xs text-slate-300">{profile.allergies}</p>
                      </div>
                    )}

                    {profile.emergencyContact && (
                      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-600 mb-1">Emergency Contact</p>
                        <p className="text-xs text-slate-300">{profile.emergencyContact}</p>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Health Activity</h4>
                    {[
                      { label: "Consultations", value: appointments.length, icon: Calendar, color: "text-fuchsia-400" },
                      { label: "Clinical Records", value: clinicalCount, icon: FileText, color: "text-teal-400" },
                      { label: "Health Logs", value: records.filter(r => r.type === "patient_log").length, icon: HeartPulse, color: "text-rose-400" },
                      { label: "Reviews Given", value: Object.keys(reviewedAppts).length, icon: Star, color: "text-amber-400" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-400 font-semibold">
                          <item.icon className={`h-3.5 w-3.5 ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="font-black text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Review Modal ───────────────────────────────── */}
      {reviewModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-fuchsia-500/30 bg-[#140e28]/95 p-8 backdrop-blur-xl shadow-2xl shadow-fuchsia-500/10">
            <div className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] bg-gradient-to-tr from-fuchsia-500/15 to-transparent rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[200px] h-[200px] bg-gradient-to-bl from-teal-500/15 to-transparent rounded-full blur-[80px] pointer-events-none" />
            <button onClick={() => { setReviewModalAppt(null); setRatingValue(0); setReviewText(""); }}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors">
              <X className="h-4 w-4" />
            </button>
            <div className="space-y-6 relative z-10">
              <div className="text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-400">Feedback Hub</span>
                <h3 className="text-xl font-black text-white">Rate Your Specialist</h3>
                <p className="text-xs text-slate-400">How was your consultation with <span className="font-bold text-white">{reviewModalAppt.doctorName}</span>?</p>
              </div>
              <form onSubmit={handleReviewSubmit} className="space-y-5">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button"
                        onClick={() => setRatingValue(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-90">
                        <Star className={`h-9 w-9 transition-all ${star <= (ratingHover || ratingValue) ? "fill-fuchsia-400 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]" : "text-slate-700"}`} />
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase h-4">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][ratingValue]}
                  </span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Written Review</label>
                  <textarea placeholder="Describe your appointment experience…" rows={4} value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-white placeholder-slate-700 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 text-xs resize-none transition-all" required />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => { setReviewModalAppt(null); setRatingValue(0); setReviewText(""); }}
                    className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingReview || ratingValue === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:brightness-110 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50">
                    {isSubmittingReview ? "Submitting…" : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancellation Confirmation Modal ─────────── */}
      {cancelModalAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-rose-500/25 bg-[#120a14]/95 p-8 backdrop-blur-xl shadow-2xl shadow-rose-500/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-[80px] pointer-events-none" />
            <div className="relative z-10 space-y-5">
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
                  <AlertTriangle className="h-7 w-7 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Cancel Appointment?</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Are you sure you want to cancel your <span className="font-bold text-rose-300">{cancelModalAppt.serviceName}</span> with{" "}
                    <span className="font-bold text-rose-300">{cancelModalAppt.doctorName}</span> on {cancelModalAppt.date}?
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-rose-500/15 bg-rose-500/5 p-3 text-xs text-rose-300 text-center">
                This action cannot be undone. Refunds are subject to our clinic policy.
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCancelModalAppt(null)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-slate-400 hover:text-white transition-colors">
                  Keep Appointment
                </button>
                <button onClick={handleCancelAppointment} disabled={isCancelling}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 py-2.5 text-xs font-bold text-white transition-all disabled:opacity-50">
                  {isCancelling ? "Cancelling…" : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
