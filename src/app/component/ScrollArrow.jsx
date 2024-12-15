"use client";

import { motion, useInView } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useRef } from "react";

const ScrollArrow = ({ target }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const handleClick = () => {
    const section = document.querySelector(target);
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.div
      ref={ref}
      className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{
        duration: 1,
        ease: "easeOut",
      }}
      onClick={handleClick}
    >
      <motion.div
        className="relative"
        initial={{ y: 0 }}
        animate={{ y: [0, 10, 0] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <ChevronDown className="w-10 h-10 text-indigo-400 hover:text-purple-500 transition-colors" />
      </motion.div>
    </motion.div>
  );
};

export default ScrollArrow;
