// components/Step1.js
import { motion } from 'framer-motion';

export default function Step1({ onNext }) {
  return (
    <div style={styles.stepContainer}>
      <motion.h1
        style={styles.title}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Configura il Tuo Bot AI
      </motion.h1>
      <motion.button
        style={styles.button}
        whileHover={{ scale: 1.1, boxShadow: "0px 0px 8px #FF007F" }}
        onClick={onNext}
      >
        Inizia
      </motion.button>
    </div>
  );
}

const styles = {
  stepContainer: {
    background: '#0B0D13', // Deep Black
    color: 'white',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '3rem',
    marginBottom: '2rem',
    textAlign: 'center',
    color: '#8A2BE2', // Purple Neon
    textShadow: '0 0 10px #00BFFF', // Glowing Blue
  },
  button: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    background: 'linear-gradient(45deg, #4B0082, #8A2BE2)', // Indigo - Purple Neon
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
  },
};
