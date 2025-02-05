"use client";

import { motion } from "framer-motion";

const reviews = [
  {
    name: "Giulia R.",
    feedback: "Un servizio eccellente! Il bot ha superato le mie aspettative.",
    rating: 5,
  },
  {
    name: "Marco L.",
    feedback: "Configurazione semplice e risultati incredibili!", 
    rating: 4,
  },
  {
    name: "Elena V.",
    feedback: "L'assistenza clienti è stata super disponibile e veloce.",
    rating: 5,
  },
];

const ReviewSection = () => {
  return (
    <div className="bg-primary  py-16 px-6 md:px-20">
      <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 mb-12">
        Cosa Dicono di Noi
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {reviews.map((review, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-gray-800/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-gray-700 hover:shadow-indigo-500/40 transition duration-300"
          >
            <h3 className="text-xl font-semibold text-white mb-2">{review.name}</h3>
            <p className="text-gray-300 mb-4">{review.feedback}</p>
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-600"}>
                  ★
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
