// components/Step4.js
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step4({ onNext, onPrev }) {
  const [theme, setTheme] = useState('#4B0082');

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
  };

  return (
    <div style={{ ...styles.container, background: theme }}>
      <h2 style={styles.heading}>Personalizzazione Avanzata</h2>
      <div style={styles.customizationContainer}>
        <label style={styles.label}>
          Scegli il Colore Principale:
          <input
            type="color"
            value={theme}
            onChange={handleThemeChange}
            style={styles.colorInput}
          />
        </label>
        <motion.div
          style={styles.preview}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          Anteprima Live
        </motion.div>
      </div>
      <div style={styles.buttons}>
        <motion.button style={styles.navButton} onClick={onPrev} whileHover={{ scale: 1.05 }}>
          Indietro
        </motion.button>
        <motion.button style={styles.navButton} onClick={onNext} whileHover={{ scale: 1.05 }}>
          Avanti
        </motion.button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    color: '#FF007F', // Cyber Pink
  },
  customizationContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  label: {
    fontSize: '1.2rem',
  },
  colorInput: {
    marginLeft: '1rem',
    border: 'none',
    background: '#fff',
    padding: '0.2rem',
    borderRadius: '5px',
  },
  preview: {
    marginTop: '2rem',
    padding: '2rem',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.2)',
    fontSize: '1.5rem',
  },
  buttons: {
    marginTop: '2rem',
    display: 'flex',
    gap: '1rem',
  },
  navButton: {
    padding: '1rem 2rem',
    background: 'linear-gradient(45deg, #4B0082, #8A2BE2)',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    color: 'white',
  },
};
