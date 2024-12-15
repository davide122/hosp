import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import ScrollArrow from "./ScrollArrow";

const HeroSection = () => {
  const [showModal, setShowModal] = useState(false);
  const videoRef = useRef(null); // Riferimento per il video

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.muted = false; // Disattiva il mute
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Riattiva il mute
    }
  };

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

  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -50]);
  const canvasRef = useThreeHeroScene();

  return (
    <section
      id="panoramica"
      className="relative min-h-screen flex flex-col md:flex-row items-center justify-between px-8 md:px-16 pt-16 md:pt-24"
      style={{ marginTop: "-4rem" }}
    >
      {/* Container */}
      <div className="container mx-auto max-w-screen-xl flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Colonna di Testo */}
        <motion.div
          className="md:w-1/2 flex flex-col justify-center text-center md:text-left"
          style={{ y }}
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="text-6xl md:text-8xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 leading-tight"
          >
            Ospitalità <br className="hidden md:block" /> Reinventata
          </motion.h1>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-xl md:text-3xl text-gray-300 mb-10 leading-relaxed"
          >
            Immagina un concierge virtuale, sempre presente, elegante e intelligente. Con il nostro assistente AI, le tue strutture ricettive brillano di una luce nuova.
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 50 },
              show: { opacity: 1, y: 0 },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <button
              className="px-10 py-4 md:px-12 md:py-5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 transition-transform rounded-full font-semibold text-lg md:text-xl"
            >
              Scopri Ora
            </button>
            <button
              className="px-10 py-4 md:px-12 md:py-5 bg-white/10 backdrop-blur-lg rounded-full font-semibold text-lg md:text-xl hover:bg-white/20 transition-all duration-300"
              onClick={() => setShowModal(true)}
            >
              Guarda la Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Colonna dell'Avatar */}
        <div
          className="md:w-1/2 flex justify-center relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative flex items-center justify-center w-[500px] h-[500px] overflow-visible"
          >
            {/* Sfondo Radiale Pulsante */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 opacity-80 blur-xl"></div>

            {/* Immagine con Effetto 3D */}
            <motion.div
              initial={{ y: -20 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative z-10"
            >
              <video
                ref={videoRef}
                src="/mantalk.mp4"
                alt="Concierge AI"
                className="w-[600px] h-auto rounded-full shadow-2xl transform hover:scale-110 transition-transform duration-500"
                autoPlay
                loop
                muted
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Modale per il video demo */}
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black  z-50 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-lg w-4/5 h-4/5">
            <video
              src="/mantalk.mp4"
              autoPlay
              loop
              controls
              className="w-full h-full object-contain"
              onClick={() => setShowModal(true)}
            />
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow hover:bg-gray-700 transition"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}

      <ScrollArrow target="#caratteristiche" />
    </section>
  );
};

export default HeroSection;
