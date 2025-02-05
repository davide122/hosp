// components/Step3.js
import { motion } from 'framer-motion';

export default function Step3({ onNext, onPrev }) {
  const voices = [
    { id: 1, label: 'Voce 1', src: '/audio/voice1.mp3' },
    { id: 2, label: 'Voce 2', src: '/audio/voice2.mp3' },
    { id: 3, label: 'Voce 3', src: '/audio/voice3.mp3' },
  ];

  const playAudio = (src) => {
    const audio = new Audio(src);
    audio.play();
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Seleziona la Voce del Bot</h2>
      <div style={styles.voiceContainer}>
        {voices.map((voice) => (
          <motion.button
            key={voice.id}
            style={styles.voiceButton}
            whileHover={{ scale: 1.1, boxShadow: '0px 0px 8px #FF007F' }}
            onClick={() => playAudio(voice.src)}
            onDoubleClick={onNext} // doppio click per confermare la selezione
          >
            {voice.label}
          </motion.button>
        ))}
      </div>
      <motion.button
        style={styles.backButton}
        onClick={onPrev}
        whileHover={{ scale: 1.05 }}
      >
        Indietro
      </motion.button>
    </div>
  );
}

const styles = {
  container: {
    background: '#0B0D13',
    color: 'white',
    height: '100vh',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    color: '#8A2BE2',
  },
  voiceContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
  },
  voiceButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(45deg, #4B0082, #8A2BE2)',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
  },
  backButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    background: '#4B0082',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
  },
};
