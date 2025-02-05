import { motion } from "framer-motion";

const Stepper = ({ step }) => {
  const steps = ["Avatar", "Voce", "Riepilogo"];

  return (
    <div className="flex justify-start items-center space-x-6 my-6">
      {steps.map((label, index) => (
        <motion.div
          key={index}
          className={`w-16 h-16 flex items-center justify-center rounded-full border-2 text-lg font-bold transition-all shadow-lg ${
            index + 1 === step
              ? "bg-purple-500 border-purple-500 text-white scale-125 shadow-[0_0_20px_rgba(128,0,255,0.8)]"
              : "border-gray-600 text-gray-400"
          }`}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          {index + 1}
        </motion.div>
      ))}
    </div>
  );
};

export default Stepper;
