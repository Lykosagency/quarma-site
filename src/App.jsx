import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Zap, Globe, Check, X, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
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

// --- CONFIGURATION FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyADjbqpT9TouUVXtIkGGctALUTMhm16kmo",
  authDomain: "quarma-site.firebaseapp.com",
  projectId: "quarma-site",
  storageBucket: "quarma-site.firebasestorage.app",
  messagingSenderId: "370880950442",
  appId: "1:370880950442:web:cfb615f8a9e235f19d60d3"
};

// Initialisation de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = 'quarma-prod'; // ID pour organiser les données dans la base

// --- Components ---

const Navbar = () => (
  <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
    <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <a 
          href="https://quarma.net" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20 hover:scale-105 transition-transform overflow-hidden"
        >
          <img 
            src="https://www.google.com/s2/favicons?domain=quarma.net&sz=128" 
            alt="Quarma" 
            className="w-6 h-6 object-contain opacity-90 brightness-0 invert"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement.innerText = 'Q';
              e.currentTarget.parentElement.classList.add('text-white', 'font-bold', 'text-xl');
            }}
          />
        </a>
        <div className="leading-tight">
          <div className="font-bold tracking-tight text-white">Quarma</div>
          <div className="text-[10px] uppercase tracking-widest text-[#D4AF37] opacity-80">
            Private Structuring
          </div>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <a href="#pour-qui" className="hidden md:block text-sm font-medium text-neutral-400 hover:text-white transition-colors">
          Les Critères
        </a>
        <a
          href="#candidature"
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-[#D4AF37] transition-all duration-300"
        >
          Candidater
        </a>
      </div>
    </div>
  </nav>
);

// --- Typeform-style Logic ---

const Hero = ({ user }) => {
  const [formData, setFormData] = useState({
    situation: '',
    enjeu: '',
    delai: '',
    pret: '',
    budget: '',
    attentes: '',
    lastName: '', 
    firstName: '',
    email: '',
    phone: ''
  });

  const [status, setStatus] = useState('idle');
  const [currentStep, setCurrentStep] = useState(0);
   
  const formRef = useRef(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = (overrideValue = null) => {
    const dataToCheck = { ...formData };
    if (overrideValue !== null && steps[currentStep].field) {
        if (!Array.isArray(steps[currentStep].field)) {
            dataToCheck[steps[currentStep].field] = overrideValue;
        }
    }

    const currentField = steps[currentStep].field;
    if (Array.isArray(currentField)) {
        const missing = currentField.some(f => !dataToCheck[f]);
        if (missing) return; 
    } else if (currentField && !dataToCheck[currentField]) {
        return; 
    }

    let nextIndex = currentStep + 1;
    while (
        steps[nextIndex] && 
        steps[nextIndex].condition && 
        !steps[nextIndex].condition(dataToCheck)
    ) {
        nextIndex++;
    }

    if (nextIndex < steps.length) {
        setCurrentStep(nextIndex);
        if (formRef.current) formRef.current.scrollTop = 0;
    }
  };

  const prevStep = () => {
    let prevIndex = currentStep - 1;
    while (
        prevIndex >= 0 && 
        steps[prevIndex].condition && 
        !steps[prevIndex].condition(formData)
    ) {
        prevIndex--;
    }
    setCurrentStep(Math.max(0, prevIndex));
  };

  const handleSubmit = async (e) => {
    if(e) e.preventDefault();
    
    setStatus('submitting');
    try {
      // 1. Sauvegarde dans Firebase
      if (user) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'applications'), {
          ...formData,
          userId: user.uid,
          submittedAt: serverTimestamp(),
          status: 'new'
        });
      }

      // 2. Envoi par email via FormSubmit
      try {
        await fetch("https://formsubmit.co/ajax/cellerierquentin@gmail.com", {
          method: "POST",
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            _subject: `Nouvelle Candidature Quarma - ${formData.firstName} ${formData.lastName}`,
            _template: "table",
            ...formData
          })
        });
      } catch (emailError) {
        console.warn("L'envoi email a échoué", emailError);
      }

      setStatus('success');
    } catch (error) {
      console.error("Error", error);
      setStatus('error');
    }
  };

  // --- Step Configuration ---
  const steps = [
    {
      id: 'situation',
      field: 'situation',
      question: "Quelle est votre situation actuelle ?",
      sub: "Choisissez la réponse la plus juste.",
      type: 'choice',
      options: [
        "Entrepreneur / Dirigeant",
        "Indépendant / Freelance",
        "Investisseur",
        "Salarié (en transition ou réflexion)",
        "Autre"
      ]
    },
    {
      id: 'enjeu',
      field: 'enjeu',
      question: "Quel est votre enjeu PRIORITAIRE ?",
      sub: "Là où vous avez le plus besoin d'aide.",
      type: 'choice',
      options: [
        "Business (offre, structuration, revenus)",
        "Fiscalité / Optimisation / Structuration",
        "Argent / Placements / Décisions",
        "Clarté globale / Prises de décision",
        "Autre"
      ]
    },
    {
      id: 'delai',
      field: 'delai',
      question: "Quand aimeriez-vous commencer ?",
      type: 'choice',
      options: [
        "Cette semaine",
        "Ce mois-ci",
        "Dans 1-3 mois",
        "Plus tard"
      ]
    },
    {
      id: 'pret',
      field: 'pret',
      question: "Êtes-vous prêt(e) à investir du temps, de l’argent et de l’énergie ?",
      sub: "Pour résoudre ce problème.",
      type: 'choice',
      options: ["OUI", "NON"]
    },
    {
      id: 'budget',
      field: 'budget',
      question: "Quel est votre budget d'investissement ?",
      sub: "Une estimation de l'enveloppe que vous pouvez consacrer.",
      type: 'choice',
      condition: (data) => data.pret === 'OUI',
      options: [
        "< 1000€",
        "Entre 1000 et 3000€",
        "Entre 3000 et 10 000€",
        "> 10 000€",
        "Autre"
      ]
    },
    {
      id: 'attentes',
      field: 'attentes',
      question: "Qu’attendez-vous concrètement ?",
      sub: "Pas de solutions magiques. Juste de l'exécution.",
      type: 'textarea',
      placeholder: "Soyez direct (objectifs, livrables)..."
    },
    {
      id: 'contact',
      field: ['lastName', 'firstName', 'email', 'phone'],
      question: "Pour vous recontacter",
      sub: "Dernière étape pour valider votre dossier.",
      type: 'contact_form'
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && currentStepData.type !== 'textarea') {
        e.preventDefault();
        nextStep();
    }
  };

  return (
    <header className="relative mx-auto max-w-6xl px-6 pt-32 pb-20 min-h-[90vh] flex flex-col justify-center">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#D4AF37]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="grid lg:grid-cols-2 gap-12 lg:items-center relative z-10">
        
        {/* Left Side: Text */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-1.5 text-xs font-semibold text-[#D4AF37] tracking-wide uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
            Candidature
          </div>

          <h1 className="mt-8 text-5xl sm:text-6xl font-bold tracking-tight leading-[1.05] text-white">
            Formulaire<br />
            <span className="bg-gradient-to-br from-[#F3E5AB] via-[#D4AF37] to-[#B8860B] bg-clip-text text-transparent">
              d'Inscription
            </span>
          </h1>

          <p className="mt-8 text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Je ne travaille qu'avec des profils que je peux réellement aider.
            <br />
            Répondez avec sincérité, il n'y a pas de bonne réponse.
          </p>
        </div>

        {/* Right Side: Typeform Card */}
        <div className="w-full lg:max-w-lg mx-auto">
          <div id="candidature" ref={formRef} className="min-h-[420px] rounded-[24px] bg-[#0A0A0A] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
            
            {status === 'success' ? (
              // SUCCESS STATE
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-500">
                <div className="h-20 w-20 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mb-6 ring-1 ring-[#D4AF37]/30">
                  <Check size={40} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Candidature reçue</h3>
                <p className="text-neutral-400 max-w-sm text-base mb-6">
                  Je vais étudier votre profil personnellement. Si votre dossier est retenu, vous recevrez une invitation sous 24h.
                </p>
                <button 
                  onClick={() => { setStatus('idle'); setCurrentStep(0); setFormData({situation:'', enjeu:'', delai:'', pret:'', budget:'', details:'', attentes:'', lastName: '', firstName: '', email:'', phone:''})}}
                  className="text-xs font-bold text-[#D4AF37] hover:text-white transition-colors uppercase tracking-wider"
                >
                  Envoyer un autre dossier
                </button>
              </div>
            ) : (
              // FORM STATE
              <>
                {/* Header / Progress Bar */}
                <div className="px-6 pt-6 pb-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-bold text-[#D4AF37] tracking-wider uppercase">Question {currentStep + 1} / {steps.length}</span>
                        {currentStep > 0 && (
                             <button onClick={prevStep} className="text-neutral-500 hover:text-white transition-colors">
                                 <ArrowLeft size={16} />
                             </button>
                        )}
                    </div>
                    <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#D4AF37] transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 px-6 py-2 flex flex-col justify-center">
                    <div key={currentStep} className="animate-in slide-in-from-right-8 fade-in duration-300">
                        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
                            {currentStepData.question}
                        </h2>
                        {currentStepData.sub && (
                            <p className="text-neutral-400 text-sm mb-6">{currentStepData.sub}</p>
                        )}
                        {!currentStepData.sub && <div className="mb-6"></div>}

                        {/* INPUT TYPES */}
                         
                        {/* 1. CHOICE / BUTTONS */}
                        {currentStepData.type === 'choice' && (
                            <div className="space-y-2">
                                {currentStepData.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            updateField(currentStepData.field, option);
                                            setTimeout(() => nextStep(option), 150);
                                        }}
                                        className={`w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 flex items-center justify-between group
                                            ${formData[currentStepData.field] === option 
                                                ? 'bg-[#D4AF37] border-[#D4AF37] text-black font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]' 
                                                : 'bg-[#151515] border-white/5 text-neutral-300 hover:border-[#D4AF37]/50 hover:bg-[#1A1A1A]'
                                            }
                                        `}
                                    >
                                        <span className="text-sm font-medium">{option}</span>
                                        {formData[currentStepData.field] === option && <Check size={16} />}
                                        <span className={`text-[10px] uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${formData[currentStepData.field] === option ? 'text-black' : 'text-[#D4AF37]'}`}>
                                            Sélectionner
                                        </span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* 2. TEXTAREA */}
                        {currentStepData.type === 'textarea' && (
                            <div className="relative">
                                <textarea
                                    autoFocus
                                    value={formData[currentStepData.field]}
                                    onChange={(e) => updateField(currentStepData.field, e.target.value)}
                                    rows={4}
                                    className="w-full bg-transparent border-b border-white/10 text-lg text-white placeholder-neutral-700 focus:border-[#D4AF37] focus:outline-none py-2 transition-colors resize-none"
                                    placeholder={currentStepData.placeholder}
                                />
                                <div className="mt-4 flex justify-end">
                                    <button 
                                        onClick={() => nextStep()}
                                        disabled={!formData[currentStepData.field]}
                                        className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm hover:bg-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        Valider <ArrowRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* 3. CONTACT FORM (Final Step) */}
                        {currentStepData.type === 'contact_form' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#D4AF37] uppercase mb-1">Nom</label>
                                        <input 
                                            type="text"
                                            autoFocus
                                            value={formData.lastName}
                                            onChange={(e) => updateField('lastName', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="w-full bg-transparent border-b border-white/10 text-base text-white py-2 focus:border-[#D4AF37] focus:outline-none"
                                            placeholder="Dupont"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-[#D4AF37] uppercase mb-1">Prénom</label>
                                        <input 
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => updateField('firstName', e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="w-full bg-transparent border-b border-white/10 text-base text-white py-2 focus:border-[#D4AF37] focus:outline-none"
                                            placeholder="Jean"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[#D4AF37] uppercase mb-1">Email</label>
                                    <input 
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => updateField('email', e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        className="w-full bg-transparent border-b border-white/10 text-base text-white py-2 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="jean.dupont@societe.com"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-[#D4AF37] uppercase mb-1">Téléphone</label>
                                    <input 
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => updateField('phone', e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleSubmit(e);
                                        }}
                                        className="w-full bg-transparent border-b border-white/10 text-base text-white py-2 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="06 12 34 56 78"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={status === 'submitting' || !formData.lastName || !formData.firstName || !formData.email || !formData.phone}
                                        className="w-full group rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B8860B] px-6 py-3 text-base font-bold text-black hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-[#D4AF37]/20"
                                    >
                                        {status === 'submitting' ? (
                                            <><Loader2 className="animate-spin h-4 w-4" /> Envoi...</>
                                        ) : (
                                            <>Envoyer ma candidature <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                        )}
                                    </button>
                                    {status === 'error' && (
                                        <p className="text-red-500 text-xs mt-2 text-center">Une erreur est survenue. Réessayez.</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer of card */}
                {currentStepData.type === 'textarea' && (
                    <div className="px-6 pb-4 text-[10px] text-neutral-600 flex justify-between items-center">
                        <span>Appuyez sur <strong>Entrée</strong> pour passer à la ligne</span>
                        <div className="hidden sm:flex gap-2">
                             <div className="px-2 py-0.5 bg-white/5 rounded">Shift + Enter</div> pour sauter une ligne
                        </div>
                    </div>
                )}
                {currentStepData.type === 'choice' && (
                     <div className="px-6 pb-6"></div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const Features = () => (
  <section className="mx-auto max-w-6xl px-6 py-8 border-t border-white/5">
    <div className="grid md:grid-cols-3 gap-8">
      {/* Feature 1 */}
      <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
        <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
          <ShieldCheck size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-white">Gagnez de l’argent</h3>
        <p className="mt-2 text-neutral-500 text-sm leading-relaxed">
          Prenez les bonnes décisions financières et stratégiques, à titre personnel ou professionel, pour votre business ou votre fiscalité.
        </p>
      </div>
      {/* Feature 2 */}
      <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
        <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
          <Zap size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-white">Gagnez du temps</h3>
        <p className="mt-2 text-neutral-500 text-sm leading-relaxed">
          Accélérez votre évolution personnelle et professionnelle grâce à des méthodes éprouvées et un accompagnement sur mesure.
        </p>
      </div>
      {/* Feature 3 */}
      <div className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
        <div className="text-[#D4AF37] mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
          <Globe size={32} strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-white">Gagnez en énergie</h3>
        <p className="mt-2 text-neutral-500 text-sm leading-relaxed">
          Libérez-vous des peurs, croyances et blocages inconscients pour être performant sans vous épuiser.
        </p>
      </div>
    </div>
  </section>
);

const Criteria = () => (
  <section id="pour-qui" className="mx-auto max-w-6xl px-6 py-20 bg-[#050505] rounded-[48px] border border-white/5 mb-20">
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight text-white">Profitez du meilleur de mon réseau</h2>
      <p className="mt-4 text-neutral-500">Nous ne travaillons qu'avec 10 nouveaux clients par trimestre.</p>
    </div>
  </section>
);

const Footer = () => (
  <footer className="mx-auto max-w-6xl px-6 pb-20">
    <div className="rounded-[40px] bg-gradient-to-br from-[#D4AF37]/20 via-neutral-900 to-black p-12 text-center border border-[#D4AF37]/20">
      <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6 text-white">
        Prêt(e) pour une structuration <span className="text-[#D4AF37]">souveraine ?</span>
      </h3>
      <p className="text-neutral-400 max-w-2xl mx-auto mb-10">
        La première étape vers la clarté commence par un échange confidentiel.<br />Soumettez votre profil dès aujourd'hui.
      </p>
      <a 
        href="#candidature"
        className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-5 text-lg font-bold text-black hover:bg-[#D4AF37] transition-colors"
      >
        Envoyer mon dossier
      </a>

      <div className="mt-20 pt-10 border-t border-white/5 flex justify-center items-center text-xs text-neutral-500">
        <div>© 2020 Quarma • Private Structuring</div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Auth anonyme automatique pour permettre l'écriture dans Firestore
    const initAuth = async () => {
       await signInAnonymously(auth);
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37]/30">
      <Navbar />
      <Hero user={user} />
      <Features />
      <Criteria />
      <Footer />
    </div>
  );
}