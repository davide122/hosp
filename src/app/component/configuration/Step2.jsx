// components/Step2.js
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step2({ onNext, onPrev }) {
  const [formData, setFormData] = useState({
    nome: '',
    descrizione: '',
    personalità: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Abilita il pulsante solo se tutti i campi sono compilati
  const isValid = formData.nome && formData.descrizione && formData.personalità;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Configurazione del Bot</h2>
      <form style={styles.form} onSubmit={(e) => { e.preventDefault(); isValid && onNext(); }}>
        <input
          style={styles.input}
          type="text"
          name="nome"
          placeholder="Nome del Bot"
          value={formData.nome}
          onChange={handleChange}
        />
        <textarea
          style={styles.input}
          name="descrizione"
          placeholder="Descrizione del Bot"
          value={formData.descrizione}
          onChange={handleChange}
        />
        <input
          style={styles.input}
          type="text"
          name="personalità"
          placeholder="Personalità del Bot"
          value={formData.personalità}
          onChange={handleChange}
        />
        <div style={styles.buttons}>
          <motion.button
            style={styles.navButton}
            onClick={onPrev}
            whileHover={{ scale: 1.05 }}
          >
            Indietro
          </motion.button>
          <motion.button
            style={{ ...styles.navButton, opacity: isValid ? 1 : 0.5 }}
            type="submit"
            whileHover={{ scale: isValid ? 1.05 : 1 }}
            disabled={!isValid}
          >
            Avanti
          </motion.button>
        </div>
      </form>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: '2.5rem',
    marginBottom: '1.5rem',
    color: '#8A2BE2',
  },
  form: {
    width: '100%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '1rem',
    marginBottom: '1rem',
    border: 'none',
    borderRadius: '5px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  buttons: {
    display: 'flex',
    justifyContent: 'space-between',
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
