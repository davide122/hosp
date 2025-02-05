// components/Step5.js
import { motion } from 'framer-motion';

export default function Step5({ onPrev, onComplete }) {
  // In un caso reale, i dati riassuntivi verrebbero passati come props o tramite un context.
  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Riepilogo e Conferma</h2>
      <div style={styles.summary}>
        <p><strong>Nome del Bot:</strong> Bot AI</p>
        <p><strong>Descrizione:</strong> Un bot intelligente e futuristico</p>
        <p><strong>Personalità:</strong> Innovativa e dinamica</p>
        <p><strong>Voce:</strong> Voce 1</p>
      </div>
      <motion.button
        style={styles.completeButton}
        whileHover={{ scale: 1.1, boxShadow: "0px 0px 12px #00BFFF" }}
        onClick={onComplete || (() => alert('Configurazione completata!'))}
      >
        Completa
      </motion.button>
      <motion.button style={styles.backButton} onClick={onPrev} whileHover={{ scale: 1.05 }}>
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
  summary: {
    background: 'rgba(255,255,255,0.1)',
    padding: '2rem',
    borderRadius: '10px',
    marginBottom: '2rem',
    width: '80%',
    maxWidth: '500px',
  },
  completeButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(45deg, #4B0082, #8A2BE2)',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
    fontSize: '1.2rem',
    marginBottom: '1rem',
  },
  backButton: {
    padding: '0.5rem 1rem',
    background: '#4B0082',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
  },
};
