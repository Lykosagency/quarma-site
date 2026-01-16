import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Globe, Check, X, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

// --- CONFIGURATION FIREBASE RÉELLE ---
const firebaseConfig = {
  apiKey: "AIzaSyADjbqpT9TouUVXtIkGGctALUTMhm16kmo",
  authDomain: "quarma-site.firebaseapp.com",
  projectId: "quarma-site",
  storageBucket: "quarma-site.firebasestorage.app",
  messagingSenderId: "370880950442",
  appId: "1:370880950442:web:cfb615f8a9e235f19d60d3"
};

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
    <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
          <span className="text-black font-bold text-xl">Q</span>
        </div>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-white">Quarma</div>
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] opacity-80">
            Private Wealth Structuring
          </div>
        </div>
      </div>
      <a href="#candidature" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-[#D4AF37] transition-all">
        Candidater
      </a>
    </div>
  </nav>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    situation: 'Entrepreneur / Dirigeant',
    enjeu: 'Fiscalité / Optimisation / Structuration internationale',
    delai: 'Cette semaine',
    pret: 'Oui',
    details: '',
    attentes: '',
    contactName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    signInAnonymously(auth)
      .then(() => console.log("Connecté à Quarma Secure Gateway"))
      .catch((err) => {
        console.error(err);
        setErrorMessage("Erreur de connexion sécurisée. Vérifiez l'activation de l'Auth Anonyme dans Firebase.");
        setStatus('error');
      });

    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setErrorMessage("Veuillez patienter pendant la sécurisation de la connexion...");
      setStatus('error');
      return;
    }

    setStatus('submitting');

    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        userId: user.uid,
        submittedAt: serverTimestamp(),
      });

      await fetch("https://formsubmit.co/ajax/cellerierquentin@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            _subject: `QUARMA : Nouvelle Candidature de ${formData.contactName}`,
            ...formData
        })
      });

      setStatus('success');
    } catch (error) {
      console.error(error);
      setErrorMessage("Échec de l'envoi. Assurez-vous d'avoir créé la base 'Firestore' en mode test dans votre console Firebase.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">...</main>
    </div>
  );
}
