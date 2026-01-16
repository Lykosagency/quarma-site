import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Globe, Check, X, ArrowRight, Loader2 } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// --- REMPLACEZ CES CLÉS PAR CELLES DE VOTRE CONSOLE FIREBASE ---
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:abcdef"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('idle');
  const [formData, setFormData] = useState({ contactName: '', email: '', details: '' });

  useEffect(() => {
    signInAnonymously(auth);
    return onAuthStateChanged(auth, setUser);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setStatus('submitting');
    try {
      await addDoc(collection(db, 'applications'), { ...formData, submittedAt: serverTimestamp() });
      await fetch("https://formsubmit.co/ajax/cellerierquentin@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _subject: "Nouveau Dossier Quarma", ...formData })
      });
      setStatus('success');
    } catch (err) { setStatus('error'); }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <nav className="p-6 border-b border-white/10 flex justify-between items-center">
        <div className="font-bold text-xl tracking-tighter">QUARMA</div>
        <a href="#form" className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold">Candidater</a>
      </nav>

      <main className="max-w-4xl mx-auto pt-20 px-6 text-center">
        <h1 className="text-6xl font-bold mb-6">Structuration <span className="text-[#D4AF37]">Souveraine</span></h1>
        <p className="text-neutral-400 text-xl mb-12">Le premier pas vers votre optimisation commence ici.</p>

        <div id="form" className="bg-neutral-900 p-8 rounded-3xl border border-white/10 text-left max-w-xl mx-auto">
          {status === 'success' ? (
            <div className="text-center py-10 text-green-500 font-bold">Dossier transmis avec succès.</div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full bg-black border border-white/10 p-4 rounded-xl" placeholder="Nom complet" onChange={e => setFormData({...formData, contactName: e.target.value})} required />
              <input className="w-full bg-black border border-white/10 p-4 rounded-xl" type="email" placeholder="Email" onChange={e => setFormData({...formData, email: e.target.value})} required />
              <textarea className="w-full bg-black border border-white/10 p-4 rounded-xl h-32" placeholder="Décrivez votre projet..." onChange={e => setFormData({...formData, details: e.target.value})} required />
              <button className="w-full bg-[#D4AF37] text-black font-bold py-4 rounded-xl hover:brightness-110 transition-all flex justify-center">
                {status === 'submitting' ? <Loader2 className="animate-spin" /> : "Envoyer mon dossier"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
