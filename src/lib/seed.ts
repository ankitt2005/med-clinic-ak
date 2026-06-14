// src/lib/seed.ts
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/firebase/client";

export const initialDoctors = [
  // === GENERAL MEDICINE ===
  {
    id: "doc-gen-1",
    name: "Dr. David Kim",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "10 years",
    availability: {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      hours: ["08:30 AM", "09:30 AM", "10:30 AM", "11:30 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Kim provides comprehensive primary care services, wellness counseling, and chronic condition management.",
  },
  {
    id: "doc-gen-2",
    name: "Dr. Emily Stone",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop",
    rating: 4.8,
    experience: "7 years",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM"],
    },
    bio: "Dr. Stone is committed to preventative medicine and family health, emphasizing healthy lifestyles and early detection.",
  },
  {
    id: "doc-gen-3",
    name: "Dr. Robert Vance",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop",
    rating: 4.75,
    experience: "12 years",
    availability: {
      days: ["Tuesday", "Thursday"],
      hours: ["10:00 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"],
    },
    bio: "Dr. Vance specializes in internal medicine and senior care, coordinating treatment programs for optimal aging.",
  },
  {
    id: "doc-gen-4",
    name: "Dr. Susan Miller",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=250&auto=format&fit=crop",
    rating: 4.95,
    experience: "14 years",
    availability: {
      days: ["Monday", "Tuesday", "Wednesday"],
      hours: ["09:00 AM", "10:30 AM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. Miller offers full-spectrum general consultations and travel medicine guidance with a patient-centered approach.",
  },
  {
    id: "doc-gen-5",
    name: "Dr. Thomas Wright",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop",
    rating: 4.65,
    experience: "8 years",
    availability: {
      days: ["Wednesday", "Thursday", "Friday"],
      hours: ["09:30 AM", "10:30 AM", "11:30 AM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Wright has a strong clinical focus on disease screening, metabolic disorders, and medical weight management.",
  },
  {
    id: "doc-gen-6",
    name: "Dr. Lisa Sanders",
    specialty: "General Medicine",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "18 years",
    availability: {
      days: ["Monday", "Thursday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Sanders is a renowned diagnostician, specializing in sorting out mystery symptoms and complex medical cases.",
  },

  // === CARDIOLOGY ===
  {
    id: "doc-card-1",
    name: "Dr. Sarah Jenkins",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "12 years",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Jenkins is a board-certified cardiologist specializing in preventive cardiology and cardiovascular diagnostics.",
  },
  {
    id: "doc-card-2",
    name: "Dr. James Watson",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=250&auto=format&fit=crop",
    rating: 4.85,
    experience: "16 years",
    availability: {
      days: ["Tuesday", "Thursday"],
      hours: ["09:30 AM", "10:30 AM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Watson focuses on clinical electrophysiology, heart rhythm management, and pacemaker evaluations.",
  },
  {
    id: "doc-card-3",
    name: "Dr. Arthur Dent",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=250&auto=format&fit=crop",
    rating: 4.7,
    experience: "9 years",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Dent specializes in non-invasive imaging, echocardiography, and hypertension treatment strategies.",
  },
  {
    id: "doc-card-4",
    name: "Dr. Lisa Cuddy",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1623854767648-e7bb8c5f24db?q=80&w=250&auto=format&fit=crop",
    rating: 4.95,
    experience: "15 years",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Cuddy is an expert in interventional cardiology, cardiac rehabilitation programs, and women's heart health.",
  },
  {
    id: "doc-card-5",
    name: "Dr. Gregory House",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1582750433449-6493500d83e6?q=80&w=250&auto=format&fit=crop",
    rating: 4.5,
    experience: "22 years",
    availability: {
      days: ["Tuesday", "Wednesday"],
      hours: ["11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. House is a brilliant specialist who treats advanced cardiac conditions and complex vascular system diseases.",
  },
  {
    id: "doc-card-6",
    name: "Dr. Eric Foreman",
    specialty: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250&auto=format&fit=crop",
    rating: 4.8,
    experience: "11 years",
    availability: {
      days: ["Monday", "Thursday", "Friday"],
      hours: ["08:30 AM", "09:30 AM", "10:30 AM", "01:30 PM", "03:30 PM"],
    },
    bio: "Dr. Foreman works extensively on coronary artery diseases, vascular care, and preventive lipidology.",
  },

  // === NEUROLOGY ===
  {
    id: "doc-neur-1",
    name: "Dr. Marcus Chen",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop",
    rating: 4.8,
    experience: "15 years",
    availability: {
      days: ["Tuesday", "Thursday"],
      hours: ["10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. Chen is an expert in neurodegenerative disorders and advanced migraine therapeutics with over 15 years of experience.",
  },
  {
    id: "doc-neur-2",
    name: "Dr. Charles Xavier",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1637059824899-a441006a6875?q=80&w=250&auto=format&fit=crop",
    rating: 4.98,
    experience: "25 years",
    availability: {
      days: ["Monday", "Wednesday"],
      hours: ["09:00 AM", "10:30 AM", "01:30 PM", "03:00 PM", "04:30 PM"],
    },
    bio: "Dr. Xavier is a world-renowned neurologist specializing in brain mapping, cognitive rehabilitation, and sleep medicine.",
  },
  {
    id: "doc-neur-3",
    name: "Dr. Stephen Strange",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "14 years",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["10:00 AM", "11:00 AM", "02:00 PM", "03:30 PM"],
    },
    bio: "Dr. Strange specializes in central nervous system trauma, advanced neuro-diagnostics, and peripheral neuropathy.",
  },
  {
    id: "doc-neur-4",
    name: "Dr. Allison Cameron",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1643297609111-55174dba1ab8?q=80&w=250&auto=format&fit=crop",
    rating: 4.75,
    experience: "8 years",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. Cameron has a deep focus on neuro-immunology, multiple sclerosis management, and spinal care pathways.",
  },
  {
    id: "doc-neur-5",
    name: "Dr. Robert Chase",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=250&auto=format&fit=crop",
    rating: 4.82,
    experience: "10 years",
    availability: {
      days: ["Thursday", "Friday"],
      hours: ["09:30 AM", "10:30 AM", "01:30 PM", "02:30 PM", "04:00 PM"],
    },
    bio: "Dr. Chase specializes in pediatric neurology, epilepsy syndromes, and neurodevelopmental therapeutics.",
  },
  {
    id: "doc-neur-6",
    name: "Dr. Chris Taub",
    specialty: "Neurology",
    avatar: "https://images.unsplash.com/photo-1582750433449-6493500d83e6?q=80&w=250&auto=format&fit=crop",
    rating: 4.68,
    experience: "13 years",
    availability: {
      days: ["Monday", "Tuesday", "Friday"],
      hours: ["10:00 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Taub focuses on neuromuscular disorders, diagnostic electromyography, and headache management programs.",
  },

  // === PEDIATRICS ===
  {
    id: "doc-ped-1",
    name: "Dr. Aisha Patel",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=250&auto=format&fit=crop",
    rating: 4.95,
    experience: "9 years",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: ["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"],
    },
    bio: "Dr. Patel focuses on holistic child development, immunizations, and preventive pediatric healthcare.",
  },
  {
    id: "doc-ped-2",
    name: "Dr. John Watson",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop",
    rating: 4.8,
    experience: "13 years",
    availability: {
      days: ["Tuesday", "Wednesday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Watson specializes in infant nutrition, pediatric respiratory conditions, and childhood wellness management.",
  },
  {
    id: "doc-ped-3",
    name: "Dr. Perry Cox",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1582750433449-6493500d83e6?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "19 years",
    availability: {
      days: ["Monday", "Wednesday", "Thursday"],
      hours: ["08:30 AM", "09:30 AM", "11:30 AM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. Cox is a leading pediatric consultant specializing in childhood infectious diseases and juvenile clinical care.",
  },
  {
    id: "doc-ped-4",
    name: "Dr. Christopher Turk",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250&auto=format&fit=crop",
    rating: 4.85,
    experience: "11 years",
    availability: {
      days: ["Tuesday", "Thursday", "Friday"],
      hours: ["10:00 AM", "11:00 AM", "01:00 PM", "02:30 PM", "04:00 PM"],
    },
    bio: "Dr. Turk specializes in pediatric surgery diagnostics, developmental pediatrics, and adolescent growth counseling.",
  },
  {
    id: "doc-ped-5",
    name: "Dr. Elliot Reid",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop",
    rating: 4.78,
    experience: "8 years",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
    },
    bio: "Dr. Reid has a clinic focus on pediatric allergies, childhood asthma management, and early infancy healthcare.",
  },
  {
    id: "doc-ped-6",
    name: "Dr. Carla Espinosa",
    specialty: "Pediatrics",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=250&auto=format&fit=crop",
    rating: 4.92,
    experience: "12 years",
    availability: {
      days: ["Monday", "Tuesday", "Friday"],
      hours: ["09:30 AM", "10:30 AM", "01:30 PM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Espinosa focuses on child wellness guidelines, neonatal primary care, and family-centered pediatric plans.",
  },

  // === DERMATOLOGY ===
  {
    id: "doc-derm-1",
    name: "Dr. Elena Rostova",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=250&auto=format&fit=crop",
    rating: 4.7,
    experience: "8 years",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "01:00 PM", "02:00 PM", "04:00 PM"],
    },
    bio: "Dr. Rostova specializes in clinical dermatology, skin cancer screenings, and advanced aesthetic care.",
  },
  {
    id: "doc-derm-2",
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop",
    rating: 4.88,
    experience: "16 years",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: ["09:30 AM", "10:30 AM", "02:00 PM", "03:00 PM", "04:30 PM"],
    },
    bio: "Dr. Wilson focuses on cutaneous oncology, psoriasis therapeutics, and advanced immunological skin treatments.",
  },
  {
    id: "doc-derm-3",
    name: "Dr. Lawrence Kutner",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=250&auto=format&fit=crop",
    rating: 4.75,
    experience: "10 years",
    availability: {
      days: ["Tuesday", "Wednesday"],
      hours: ["10:00 AM", "11:00 AM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Kutner specializes in clinical dermoscopy, acne care programs, and minimally invasive laser procedures.",
  },
  {
    id: "doc-derm-4",
    name: "Dr. Martha Jones",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1643297609111-55174dba1ab8?q=80&w=250&auto=format&fit=crop",
    rating: 4.9,
    experience: "9 years",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: ["09:00 AM", "10:30 AM", "11:30 AM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Jones is an expert in pediatric dermatology, skin allergy diagnosis, and targeted eczema care routines.",
  },
  {
    id: "doc-derm-5",
    name: "Dr. Donna Noble",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=250&auto=format&fit=crop",
    rating: 4.82,
    experience: "11 years",
    availability: {
      days: ["Thursday", "Friday"],
      hours: ["10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "04:00 PM"],
    },
    bio: "Dr. Noble specializes in hair and scalp conditions, clinical trichology, and restorative skin rejuvenation plans.",
  },
  {
    id: "doc-derm-6",
    name: "Dr. Clara Oswald",
    specialty: "Dermatology",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop",
    rating: 4.86,
    experience: "7 years",
    availability: {
      days: ["Monday", "Tuesday", "Thursday"],
      hours: ["08:30 AM", "09:30 AM", "10:30 AM", "01:30 PM", "03:00 PM"],
    },
    bio: "Dr. Oswald focuses on clinical photo-therapy, pigmentary disorders, and general preventative skincare evaluations.",
  },

  // === ORTHOPEDICS ===
  {
    id: "doc-orth-1",
    name: "Dr. John Miller",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=250&auto=format&fit=crop",
    rating: 4.85,
    experience: "14 years",
    availability: {
      days: ["Monday", "Wednesday"],
      hours: ["09:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:30 PM"],
    },
    bio: "Dr. Miller is a specialist in joint reconstruction, sports injuries, and minimally invasive orthopaedic procedures.",
  },
  {
    id: "doc-orth-2",
    name: "Dr. Jack Shephard",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=250&auto=format&fit=crop",
    rating: 4.96,
    experience: "18 years",
    availability: {
      days: ["Tuesday", "Thursday", "Friday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
    },
    bio: "Dr. Shephard is a leading spinal surgeon and orthopedic consultant specializing in complex spinal alignments and surgery.",
  },
  {
    id: "doc-orth-3",
    name: "Dr. Juliet Burke",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=250&auto=format&fit=crop",
    rating: 4.8,
    experience: "12 years",
    availability: {
      days: ["Monday", "Wednesday", "Friday"],
      hours: ["09:30 AM", "10:30 AM", "01:30 PM", "02:30 PM", "03:30 PM"],
    },
    bio: "Dr. Burke focuses on hand and upper extremity surgeries, fracture repair, and clinical rehabilitative therapies.",
  },
  {
    id: "doc-orth-4",
    name: "Dr. James Sawyer",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=250&auto=format&fit=crop",
    rating: 4.72,
    experience: "10 years",
    availability: {
      days: ["Tuesday", "Thursday"],
      hours: ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:30 PM"],
    },
    bio: "Dr. Sawyer specializes in sports medicine, arthroscopic surgery of the knee and shoulder, and ligament reconstructions.",
  },
  {
    id: "doc-orth-5",
    name: "Dr. Kate Connor",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?q=80&w=250&auto=format&fit=crop",
    rating: 4.89,
    experience: "11 years",
    availability: {
      days: ["Monday", "Thursday"],
      hours: ["09:00 AM", "10:00 AM", "11:00 AM", "01:30 PM", "03:00 PM"],
    },
    bio: "Dr. Connor specializes in pediatric orthopedics, scoliosis screening, and childhood bone development care.",
  },
  {
    id: "doc-orth-6",
    name: "Dr. Hugo Reyes",
    specialty: "Orthopedics",
    avatar: "https://images.unsplash.com/photo-1582750433449-6493500d83e6?q=80&w=250&auto=format&fit=crop",
    rating: 4.78,
    experience: "9 years",
    availability: {
      days: ["Wednesday", "Friday"],
      hours: ["10:00 AM", "11:30 AM", "02:30 PM", "03:30 PM", "04:30 PM"],
    },
    bio: "Dr. Reyes focuses on clinical podiatry, ankle arthroplasty, and orthotic therapy programs for sports injuries.",
  },
];

export const initialServices = [
  {
    id: "ser-1",
    name: "General Consultation",
    price: 50,
    duration: "30 mins",
    description: "Standard checkup, physical evaluation, prescriptions, and health advice.",
  },
  {
    id: "ser-2",
    name: "Cardiac Screening",
    price: 120,
    duration: "45 mins",
    description: "EKG monitoring, heart rate analysis, and detailed cardiovascular health check.",
  },
  {
    id: "ser-3",
    name: "Neurological Assessment",
    price: 150,
    duration: "60 mins",
    description: "In-depth nervous system scan, cognitive testing, and specialized migraine consult.",
  },
  {
    id: "ser-4",
    name: "Pediatric Wellness Check",
    price: 60,
    duration: "30 mins",
    description: "Growth tracking, vaccination checkups, and standard child welfare assessments.",
  },
  {
    id: "ser-5",
    name: "Dermatological Skin Scan",
    price: 90,
    duration: "30 mins",
    description: "Full-body skin scanning, mole mapping, acne evaluation, and care prescription.",
  },
  {
    id: "ser-6",
    name: "Orthopedic Consultation",
    price: 110,
    duration: "45 mins",
    description: "Bone and joint injury scans, mobility tests, and personalized rehabilitation programs.",
  },
];

export async function seedDatabaseIfNeeded() {
  try {
    const doctorsRef = collection(db, "doctors");
    const docsSnap = await getDocs(doctorsRef);

    // If there are fewer doctors than our complete list, rewrite the collection with the new list
    if (docsSnap.size < 30) {
      console.log("Seeding doctors database with full list of 36 specialists...");
      const batch = writeBatch(db);
      initialDoctors.forEach((doctor) => {
        const docRef = doc(db, "doctors", doctor.id);
        batch.set(docRef, doctor);
      });
      await batch.commit();
      console.log("Doctors seeded successfully.");
    }

    const servicesRef = collection(db, "services");
    const servicesSnap = await getDocs(servicesRef);

    if (servicesSnap.empty) {
      console.log("Seeding services database...");
      const batch = writeBatch(db);
      initialServices.forEach((service) => {
        const docRef = doc(db, "services", service.id);
        batch.set(docRef, service);
      });
      await batch.commit();
      console.log("Services seeded successfully.");
    }
  } catch (error) {
    console.error("Database seeding failed:", error);
  }
}
