"use client"
import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import * as THREE from "three";
import { Bot, BarChart3, Settings, ArrowRight, Play, Pause, CheckCircle } from "lucide-react";
import ChatWithGP from "./ChatWithGP";
import AudioGenerator from "./audiogenerator";
import Mynav from "./Mynav";
import HeroSection from "./HeroSection";
import Roadmap from "./Roadmap";
import VideoCarousel from "./VideoCarousel";
import Image from "next/image";
import dash from "../img/davidus.png"
import SectionDivider from "./SectionDivider";
import Footer from "./MyFooter";
function useThreeHeroScene() {
  const canvasRef = useRef(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const pointLight = new THREE.PointLight("#ffffff", 1.2);
    pointLight.position.set(0, 1, 4);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight("#333", 0.5);
    scene.add(ambientLight);

    let animationFrameId;

    const animate = () => {
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      if (!canvas) return;
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  return canvasRef;
}

export default function LandingPage() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const canvasRef = useThreeHeroScene();

  // Stati per Personalizzazione
  const [voiceStyle, setVoiceStyle] = useState("Professionale");
  const [behaviorMode, setBehaviorMode] = useState("Interattivo");
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Features
  const features = [
    {
      icon: <Bot className="w-8 h-8 text-purple-400" />,
      title: "Disponibilità 24/7",
      description: "Risposte immediate ad ogni ora, per ospiti sempre accolti e soddisfatti.",
    },
    {
      icon: <Settings className="w-8 h-8 text-purple-400" />,
      title: "Personalità su Misura",
      description: "Voce, tono e stile che riflettono l’unicità della tua struttura.",
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
      title: "Analisi Avanzate",
      description: "Monitoraggio in tempo reale per ottimizzare servizi e strategie.",
    },
  ];

  // Testimonial
  const testimonials = [
    "“Una rivoluzione: gli ospiti trovano subito le informazioni, senza attese.” – Hotel Zenith",
    "“L’assistente AI ha migliorato le recensioni e l’immagine del nostro B&B.” – B&B Armonia",
    "“Meno stress interno, più soddisfazione esterna: un vero valore aggiunto.” – Resort Paradiso"
  ];

  
  // Team
  const teamMembers = [
    { name: "Alice R.", role: "AI Engineer" },
    { name: "Marco D.", role: "UI/UX Designer" },
    { name: "Sara V.", role: "Full-Stack Dev" },
  ];

  // FAQ
  const faqs = [
    {
      q: "Come funziona l’assistente virtuale?",
      a: "Utilizziamo modelli AI evoluti per comprendere le domande e rispondere in modo coerente, immediato e personalizzabile.",
    },
    {
      q: "Posso adattare la voce e il tono?",
      a: "Assolutamente. Scegli tra stili differenti di voce e linguaggio per rispecchiare la personalità del tuo brand.",
    },
    {
      q: "È compatibile con i sistemi di prenotazione esistenti?",
      a: "Sì, l’assistente si integra via API, semplificando la gestione di prenotazioni e richieste.",
    },
  ];

  const [openFAQ, setOpenFAQ] = useState(null);
  const toggleFAQ = (i) => setOpenFAQ(openFAQ === i ? null : i);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black via-[#0b0d13] to-[#07080d] text-white font-sans overflow-x-hidden selection:bg-purple-500 selection:text-white">

      {/* Stelle sullo sfondo animate */}
      <motion.div
  className="pointer-events-none select-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1a1b1f_0%,_transparent_70%),radial-gradient(ellipse_at_bottom,#101115_0%,transparent_70%)]"
  animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
  transition={{ duration: 15, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
>
  <div className="absolute inset-0">
    {Array.from({ length: 50 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute bg-white rounded-full opacity-50"
        style={{
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 2 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
        }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          y: [`${Math.random() * 10 - 5}px`, `${Math.random() * 20 - 10}px`],
        }}
        transition={{
          duration: Math.random() * 5 + 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      ></motion.div>
    ))}
  </div>
</motion.div>


      {/* Navbar Desktop (hidden su mobile, visibile da sm in su) */}
     <Mynav/>

      {/* Navbar Mobile (visibile solo su mobile, hidden da sm in su) */}
      <div className="sticky top-0 z-50 w-full py-4 bg-black/30 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 sm:hidden mb-10">
        {/* Logo Mobile */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></div>
          <span className="font-semibold tracking-wide text-sm">AI Hospitality</span>
        </div>

        {/* Pulsante Menu Mobile */}
        <button className="px-2 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full font-semibold text-xs hover:scale-105 transition-transform">
          Menu
        </button>
      </div>

      {/* Hero Section migliorata */}
      <HeroSection/>
      <SectionDivider from="indigo-500" to="pink-500" />

      {/* Caratteristiche */}

      {/* Roadmap */}
    <Roadmap></Roadmap>


    <section
  id="chatbot"
  className="py-24 px-8 bg-gradient-to-b from-black via-[#0b0d13] to-[#07080d] text-white relative"
>
  {/* Titolo e descrizione */}
  <div className="max-w-4xl mx-auto text-center mb-20">
    <h2 className="text-5xl md:text-6xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
      Scopri il Nostro Chatbot AI
    </h2>
    <p className="text-gray-400 text-xl md:text-2xl text-center">
      Trasforma l’esperienza dei tuoi ospiti con un assistente virtuale
      che risponde in tempo reale, garantendo supporto continuo e
      personalizzato.
    </p>
  </div>

  {/* Dimostrazione del Chatbot */}
  <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
    {/* Chatbot Component */}
    <div className="w-full h-auto p-8 rounded-3xl bg-gray-800/50 backdrop-blur-lg border border-gray-700 shadow-2xl relative">
      <ChatWithGP />
      <div className="absolute -top-6 -left-6 w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 blur-lg opacity-30"></div>
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 blur-lg opacity-30"></div>
    </div>

    {/* Punti di Forza */}
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Bot className="w-12 h-12 text-purple-500" />
        <div>
          <h4 className="text-2xl font-semibold text-gray-100">
            Disponibilità 24/7
          </h4>
          <p className="text-gray-400">
            Il chatbot è sempre attivo, rispondendo immediatamente a tutte le
            richieste, senza tempi di attesa.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Settings className="w-12 h-12 text-purple-500" />
        <div>
          <h4 className="text-2xl font-semibold text-gray-100">
            Personalizzabile
          </h4>
          <p className="text-gray-400">
            Adatta la voce, il tono e lo stile del chatbot per riflettere la
            personalità unica della tua struttura.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <BarChart3 className="w-12 h-12 text-purple-500" />
        <div>
          <h4 className="text-2xl font-semibold text-gray-100">
            Analisi e Ottimizzazione
          </h4>
          <p className="text-gray-400">
            Ottieni report dettagliati sulle richieste dei tuoi clienti per
            migliorare continuamente i tuoi servizi.
          </p>
        </div>
      </div>
    </div>
  </div>

  {/* Decorazioni */}
  <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 opacity-20 blur-xl"></div>
  <div className="absolute -bottom-10 -right-10 w-36 h-36 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 opacity-20 blur-xl"></div>
</section>




      {/* Personalizzazione */}
   <section>
    <AudioGenerator></AudioGenerator>
   </section>

      {/* Analytics */}

      {/* Testimonianze */}
      <section id="pricing" className="py-32 px-4 bg-gradient-to-b from-black to-[#0b0d13] text-white relative">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            I Nostri Pacchetti
          </h2>
          <p className="text-gray-400 text-lg">
            Scegli il piano perfetto per le tue esigenze e fai brillare la tua attività.
          </p>
        </div>

        {/* Card Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Pacchetto Base */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-xl p-8 flex flex-col justify-between items-center hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Base</h3>
            <p className="text-gray-300 text-sm mb-6">Ideale per piccoli progetti e startup.</p>
            <p className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              €99
            </p>
            <ul className="text-gray-400 text-sm space-y-2 mb-6">
              <li>✔️ Configurazione iniziale</li>
              <li>✔️ Supporto via email</li>
              <li>❌ Personalizzazione avanzata</li>
            </ul>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full font-semibold hover:scale-105 transition-transform">
              Acquista Ora
            </button>
          </motion.div>

          {/* Pacchetto Standard */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-xl p-8 flex flex-col justify-between items-center hover:scale-105 transition-transform duration-300 border-4 border-purple-500"
          >
            <h3 className="text-2xl font-bold text-purple-400 mb-4">Standard</h3>
            <p className="text-gray-300 text-sm mb-6">La scelta più popolare per le aziende in crescita.</p>
            <p className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              €199
            </p>
            <ul className="text-gray-400 text-sm space-y-2 mb-6">
              <li>✔️ Configurazione iniziale</li>
              <li>✔️ Supporto prioritario</li>
              <li>✔️ Personalizzazione avanzata</li>
            </ul>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full font-semibold hover:scale-105 transition-transform">
              Acquista Ora
            </button>
          </motion.div>

          {/* Pacchetto Premium */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl shadow-xl p-8 flex flex-col justify-between items-center hover:scale-105 transition-transform duration-300"
          >
            <h3 className="text-2xl font-bold text-indigo-400 mb-4">Premium</h3>
            <p className="text-gray-300 text-sm mb-6">Per aziende che puntano all'eccellenza.</p>
            <p className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              €299
            </p>
            <ul className="text-gray-400 text-sm space-y-2 mb-6">
              <li>✔️ Tutte le funzionalità Standard</li>
              <li>✔️ Supporto dedicato</li>
              <li>✔️ Integrazione avanzata</li>
            </ul>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full font-semibold hover:scale-105 transition-transform">
              Acquista Ora
            </button>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section
        id="info"
        className="py-20 px-4 relative overflow-hidden h-100"
        style={{
          background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
        }}
      >
        <div className="absolute inset-0 z-0 vh">
          {/* Luce soffusa */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-purple-800/30 via-transparent to-black/90 rounded-full"
            style={{
              filter: "blur(100px)",
              zIndex: -1,
            }}
          >
            
          </div>
        </div>

        <div className="max-w-6xl mx-auto text-center mb-16 relative z-10 py-16" >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Il Nostro Team
          </h2>
          <p className="text-gray-400 text-lg">
            Le menti che guidano questa trasformazione digitale.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 relative z-10">
          {teamMembers.map((member, i) => (
            <motion.div
              key={i}
              className="p-8 rounded-3xl bg-black/30 backdrop-blur-xl border border-gray-800 hover:border-purple-500 transition-all duration-300 flex flex-col items-center text-center cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ rotateY: 10, rotateX: -5 }}
            >
              <Image src={dash} className="w-100 h-100 bg-gray-600 rounded-full mb-4" width={100} height={100}/>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-gray-400 text-sm">{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="py-20 px-4 relative overflow-hidden"
        style={{
          background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
        }}
      >
        {/* Effetto luce soffusa */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-purple-800/20 via-black to-black rounded-full"
          style={{ filter: "blur(120px)", zIndex: -1 }}
        ></div>

        <div className="max-w-6xl mx-auto text-center mb-16 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Domande Frequenti
          </h2>
          <p className="text-gray-400 text-lg">
            Risposte immediate alle tue curiosità.
          </p>
        </div>

        {/* FAQ Cards */}
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              className="rounded-3xl bg-gradient-to-r from-gray-800/50 to-gray-900/30 backdrop-blur-lg border border-gray-700 hover:border-purple-500 p-6 cursor-pointer transition-transform"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => toggleFAQ(i)}
              whileHover={{ scale: 1.03 }}
            >
              <div className="flex items-center justify-between text-white font-semibold mb-2">
                <span className="text-lg">{faq.q}</span>
                <motion.span
                  animate={{ rotate: openFAQ === i ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.span>
              </div>
              {openFAQ === i && (
                <motion.p
                  className="text-gray-300 mt-3 text-base"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {faq.a}
                </motion.p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Effetti decorativi */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
      </section>

      {/* CTA Finale */}
{/* CTA Finale */}
<section
  className="py-32 px-6 relative overflow-hidden"
  style={{
    background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
  }}
>
  {/* Effetto luce soffusa */}
  <div
    className="absolute inset-0 bg-gradient-to-b from-purple-800/20 via-black to-black rounded-full"
    style={{ filter: "blur(120px)", zIndex: -1 }}
  ></div>

  <div className="max-w-6xl mx-auto text-center relative z-10">
    <motion.h2
      className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-12 leading-tight"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1 }}
    >
      Preparati a Stupire i Tuoi Ospiti
    </motion.h2>

    <motion.div
      className="flex flex-col md:flex-row gap-8 justify-center items-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
    >
      <motion.button
        className="px-14 py-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform rounded-full font-bold text-2xl shadow-lg shadow-purple-500/30"
        whileTap={{ scale: 0.9 }}
      >
        Contattaci Ora
      </motion.button>
      <motion.button
        className="px-14 py-6 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform rounded-full font-bold text-2xl shadow-lg shadow-purple-500/30"
        whileTap={{ scale: 0.9 }}
      >
        Scopri le Tariffe
      </motion.button>
    </motion.div>
  </div>

  {/* Decorazioni */}
  <div className="absolute top-0 left-1/4 w-48 h-48 bg-purple-500 rounded-full opacity-10 blur-3xl"></div>
  <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-indigo-500 rounded-full opacity-10 blur-3xl"></div>
</section>
<Footer></Footer>
    </div>
  );
}
