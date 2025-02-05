// components/ProgressIndicator.js
import { motion } from 'framer-motion';

export default function ProgressIndicator({ currentStep, totalSteps }) {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);
  return (
    <div style={styles.container}>
      {steps.map(step => (
        <motion.div
          key={step}
          style={{
            ...styles.dot,
            background: step <= currentStep ? '#FF007F' : '#4B0082',
          }}
          layout
        />
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    top: '50%',
    right: '2rem',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    zIndex: 1000,
  },
  dot: {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    background: '#4B0082',
  },
};
