// src/app/booking/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/client";
import { useAuth } from "@/context/AuthContext";
import { Calendar, Clock, User, Heart, CreditCard, ChevronRight, Check } from "lucide-react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
  rating: number;
  experience: string;
  availability: {
    days: string[];
    hours: string[];
  };
  bio: string;
}

export default function Booking() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Data state
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        const servicesSnap = await getDocs(collection(db, "services"));
        const servicesList = servicesSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Service, "id">),
        }));
        setServices(servicesList);

        const doctorsSnap = await getDocs(collection(db, "doctors"));
        const doctorsList = doctorsSnap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<Doctor, "id">),
        }));
        setDoctors(doctorsList);
      } catch (err) {
        console.error("Error fetching database records:", err);
      } finally {
        setLoading(false);
      }
    }
    if (user) {
      fetchData();
    }
  }, [user]);

  // Filter doctors based on selected service specialty
  const filteredDoctors = selectedService
    ? doctors.filter((doc) => {
        const serviceToSpecialtyMap: Record<string, string> = {
          "General Consultation": "General Medicine",
          "Cardiac Screening": "Cardiology",
          "Neurological Assessment": "Neurology",
          "Pediatric Wellness Check": "Pediatrics",
          "Dermatological Skin Scan": "Dermatology",
          "Orthopedic Consultation": "Orthopedics",
        };
        return doc.specialty === serviceToSpecialtyMap[selectedService.name];
      })
    : doctors;


  // Determine if a selected date is valid based on doctor's available days
  const getDayName = (dateString: string) => {
    if (!dateString) return "";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dateObj = new Date(dateString);
    return days[dateObj.getDay()];
  };

  const isDoctorAvailableOnDate = () => {
    if (!selectedDoctor || !selectedDate) return false;
    const selectedDay = getDayName(selectedDate);
    return selectedDoctor.availability.days.includes(selectedDay);
  };

  const handleCheckout = async () => {
    if (!user || !selectedService || !selectedDoctor || !selectedDate || !selectedTime) {
      setError("Please complete all steps before booking.");
      return;
    }

    setCheckoutLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          servicePrice: selectedService.price,
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create payment session.");

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-10 w-10 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-slate-400 font-medium">Loading details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Navbar Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-md px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span onClick={() => router.push("/dashboard")} className="text-xl font-bold cursor-pointer bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
            AuraCare Clinic
          </span>
          <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
            Cancel Booking
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 mt-12 space-y-8">
        {/* Step Progress Indicators */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-900 pb-4">
          <span className={step === 1 ? "text-teal-400" : step > 1 ? "text-slate-300" : ""}>1. Choose Service</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step === 2 ? "text-teal-400" : step > 2 ? "text-slate-300" : ""}>2. Select Specialist</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step === 3 ? "text-teal-400" : step > 3 ? "text-slate-300" : ""}>3. Schedule Slot</span>
          <ChevronRight className="h-4 w-4" />
          <span className={step === 4 ? "text-teal-400" : ""}>4. Checkout</span>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-500/10 p-4 border border-rose-500/20 text-sm text-rose-400">
            {error}
          </div>
        )}

        {/* STEP 1: SELECT SERVICE */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Select a Medical Service</h2>
              <p className="text-slate-400 text-sm mt-1">Pick a care category that fits your health requirements.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service);
                    setSelectedDoctor(null); // Reset doctor when service changes
                    setStep(2);
                  }}
                  className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                    selectedService?.id === service.id
                      ? "border-teal-500 bg-teal-500/5 shadow-lg shadow-teal-500/5"
                      : "border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-white">{service.name}</h3>
                    <span className="text-xl font-bold text-teal-400">${service.price}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{service.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: SELECT DOCTOR */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-white">Select a Medical Specialist</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Showing specialists in {selectedService?.name.replace(" Consultation", "").replace(" Screening", "")}.
                </p>
              </div>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-teal-400 hover:text-teal-300">
                &larr; Back to Services
              </button>
            </div>

            <div className="space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-12 border border-slate-900 rounded-2xl text-slate-500 text-sm">
                  No specialists found in this department.
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setSelectedDate(""); // Reset slots
                      setSelectedTime("");
                      setStep(3);
                    }}
                    className={`flex flex-col md:flex-row gap-6 border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                      selectedDoctor?.id === doctor.id
                        ? "border-teal-500 bg-teal-500/5"
                        : "border-slate-800 bg-slate-900/10 hover:border-slate-700 hover:bg-slate-900/20"
                    }`}
                  >
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-20 h-20 rounded-full object-cover border border-slate-700 mx-auto md:mx-0"
                    />
                    <div className="flex-1 space-y-2 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-white">{doctor.name}</h3>
                        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400">
                          <span>⭐</span>
                          <span className="font-semibold text-slate-200">{doctor.rating}</span>
                          <span className="text-slate-500">({doctor.experience})</span>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-teal-400 tracking-wider uppercase">{doctor.specialty}</p>
                      <p className="text-sm text-slate-400">{doctor.bio}</p>
                      <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                        {doctor.availability.days.map((day, idx) => (
                          <span key={idx} className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5 text-xs text-slate-400">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE DATE & TIME */}
        {step === 3 && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-white">Choose Consultation Slot</h2>
                <p className="text-slate-400 text-sm mt-1">Select an available day and hour with {selectedDoctor.name}.</p>
              </div>
              <button onClick={() => setStep(2)} className="text-xs font-bold text-teal-400 hover:text-teal-300">
                &larr; Back to Doctors
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Calendar Date Input */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Consultation Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime("");
                  }}
                  className="w-full rounded-xl bg-slate-900 border border-slate-800 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {selectedDate && (
                  <p className="text-xs text-slate-400">
                    Selected day: <span className="font-semibold text-teal-400">{getDayName(selectedDate)}</span>
                  </p>
                )}
              </div>

              {/* Time Slots Area */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Available Hour</label>
                {!selectedDate ? (
                  <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
                    Choose a date to view available time slots.
                  </div>
                ) : !isDoctorAvailableOnDate() ? (
                  <div className="rounded-xl border border-rose-950/20 bg-rose-500/5 p-8 text-center text-sm text-rose-400 border-solid">
                    {selectedDoctor.name} is not available on {getDayName(selectedDate)}s. Please choose a different date.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {selectedDoctor.availability.hours.map((hour) => (
                      <button
                        key={hour}
                        onClick={() => setSelectedTime(hour)}
                        className={`rounded-lg py-2.5 text-sm font-semibold transition-all border ${
                          selectedTime === hour
                            ? "bg-teal-500 text-white border-teal-500"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700"
                        }`}
                      >
                        {hour}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selectedDate && selectedTime && isDoctorAvailableOnDate() && (
              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setStep(4)}
                  className="rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 px-8 py-3 text-sm font-semibold text-white hover:from-teal-400 hover:to-emerald-400 transition-all duration-300 shadow-md shadow-teal-500/20"
                >
                  Continue &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: CHECKOUT SUMMARY */}
        {step === 4 && selectedService && selectedDoctor && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-white">Review & Pay</h2>
                <p className="text-slate-400 text-sm mt-1">Review the details of your appointment before proceeding.</p>
              </div>
              <button onClick={() => setStep(3)} className="text-xs font-bold text-teal-400 hover:text-teal-300">
                &larr; Edit Date/Time
              </button>
            </div>

            {/* Receipt Summary Grid */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/10 p-8 space-y-6 backdrop-blur-sm">
              <div className="flex justify-between items-start border-b border-slate-800/80 pb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedService.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400 mt-2">
                    <User className="h-4 w-4 text-teal-400" />
                    <span>Specialist: {selectedDoctor.name}</span>
                  </div>
                </div>
                <span className="text-2xl font-bold text-teal-400">${selectedService.price}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</span>
                    <span className="text-sm font-medium text-slate-200 mt-1 block">
                      {new Date(selectedDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Consultation Time</span>
                    <span className="text-sm font-medium text-slate-200 mt-1 block">{selectedTime} ({selectedService.duration})</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-6 flex items-center gap-3 text-xs text-slate-400">
                <CreditCard className="h-4 w-4 text-emerald-400" />
                <span>Secure checkouts handled by Stripe. Cancel for a full refund up to 24 hours prior.</span>
              </div>
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="group relative flex w-full md:w-auto justify-center items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 py-3.5 px-10 text-base font-semibold text-white hover:from-teal-400 hover:to-emerald-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-500/25"
              >
                {checkoutLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Creating Session...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Secure Payment</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
