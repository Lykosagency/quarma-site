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
// Ces clés sont maintenant intégrées pour assurer la connexion directe
const firebaseConfig = {
  apiKey: "AIzaSyADjbqpT9TouUVXtIkGGctALUTMhm16kmo",
  authDomain: "quarma-site.firebaseapp.com",
  projectId: "quarma-site",
  storageBucket: "quarma-site.firebasestorage.app",
  messagingSenderId: "370880950442",
  appId: "1:370880950442:web:cfb615f8a9e235f19d60d3"
};

// Initialisation des services Firebase
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
        <div className="leading-tight text-left">
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

  // Authentification automatique au chargement
  useEffect(() => {
    const login = async () => {
      try {
        await signInAnonymously(auth);
        console.log("Connecté anonymement à Firebase");
      } catch (err) {
        console.error("Erreur Auth:", err);
        setErrorMessage("La connexion sécurisée a échoué. Vérifiez que l'authentification anonyme est activée dans votre console Firebase.");
      }
    };

    login();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage("Veuillez patienter pendant la sécurisation de la connexion (Auth)...");
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage("");

    try {
      // 1. Sauvegarde dans Firestore (Collection 'applications')
      await addDoc(collection(db, 'applications'), {
        ...formData,
        userId: user.uid,
        submittedAt: serverTimestamp(),
      });

      // 2. Envoi de l'email via FormSubmit (Backup)
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
      console.error("Erreur Firestore:", error);
      setErrorMessage("Échec de l'envoi. Assurez-vous d'avoir créé la base 'Firestore' en mode test dans votre console Firebase.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      <Navbar />
      
      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase mb-6">
            Dossier d'inscription souveraine
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
            Formulaire de <br/>
            <span className="bg-gradient-to-r from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">Candidature</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Ce formulaire nous permet d'analyser votre situation en amont pour garantir la pertinence de notre futur échange.
          </p>
        </div>

        <div id="candidature" className="max-w-2xl mx-auto">
          <div className="bg-[#0A0A0A] border border-white/10 p-8 md:p-12 rounded-[40px] shadow-2xl relative">
            {status === 'success' ? (
              <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-[#D4AF37]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="text-[#D4AF37]" size={40} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Dossier Transmis</h2>
                <p className="text-neutral-400">Votre demande est en cours d'examen. <br/>Réponse sous 24h à l'adresse indiquée.</p>
                <button 
                  onClick={() => setStatus('idle')} 
                  className="mt-8 text-sm font-bold text-[#D4AF37] hover:text-white transition-colors"
                >
                  Envoyer un autre dossier
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8 text-left">
                {status === 'error' && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-start gap-3 text-sm">
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <p>{errorMessage}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Situation actuelle</label>
                    <select 
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#D4AF37] appearance-none"
                      value={formData.situation}
                      onChange={e => setFormData({...formData, situation: e.target.value})}
                    >
                      <option>Entrepreneur / Dirigeant</option>
                      <option>Indépendant / Freelance</option>
                      <option>Investisseur</option>
                      <option>Salarié en transition</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Enjeu Prioritaire</label>
                    <select 
                      className="w-full bg-black border border-white/10 p-4 rounded-xl text-white outline-none focus:border-[#D4AF37] appearance-none"
                      value={formData.enjeu}
                      onChange={e => setFormData({...formData, enjeu: e.target.value})}
                    >
                      <option>Fiscalité / Optimisation</option>
                      <option>Structuration internationale</option>
                      <option>Gestion de patrimoine</option>
                      <option>Scale Business</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Décrivez votre projet & revenus actuels</label>
                  <textarea 
                    className="w-full bg-black border border-white/10 p-4 rounded-xl text-white h-32 focus:border-[#D4AF37] outline-none resize-none transition-all placeholder:text-neutral-700" 
                    placeholder="Détails sur votre activité, CA, bénéfices..." 
                    value={formData.details}
                    onChange={e => setFormData({...formData, details: e.target.value})}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-widest">Qu'attendez-vous de Quarma ?</label>
                  <textarea 
                    className="w-full bg-black border border-white/10 p-4 rounded-xl text-white h-24 focus:border-[#D4AF37] outline-none resize-none transition-all placeholder:text-neutral-700" 
                    placeholder="Soyez direct sur vos objectifs..." 
                    value={formData.attentes}
                    onChange={e => setFormData({...formData, attentes: e.target.value})}
                    required 
                  />
                </div>

                <div className="pt-6 border-t border-white/5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      className="bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4AF37] outline-none placeholder:text-neutral-700"
                      placeholder="Nom complet"
                      value={formData.contactName}
                      onChange={e => setFormData({...formData, contactName: e.target.value})}
                      required
                    />
                    <input 
                      className="bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4AF37] outline-none placeholder:text-neutral-700"
                      type="email"
                      placeholder="Email professionnel"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <input 
                    className="w-full bg-black border border-white/10 p-4 rounded-xl text-white focus:border-[#D4AF37] outline-none placeholder:text-neutral-700"
                    placeholder="Téléphone (WhatsApp)"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:bg-[#D4AF37] hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Transmission sécurisée...
                    </>
                  ) : (
                    <>
                      Soumettre mon dossier
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <footer className="py-20 border-t border-white/5 text-center">
         <div className="text-[10px] font-bold uppercase text-neutral-600 tracking-[0.3em]">
           Quarma • Excellence en Structuration Patrimoniale
         </div>
      </footer>
    </div>
  );
}