"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const videos = [
  { src: "../img/ma.mp4", title: "Video 1" },
  { src: "/video2.mp4", title: "Video 2" },
  { src: "/video3.mp4", title: "Video 3" },
  { src: "/video4.mp4", title: "Video 4" },
  { src: "/video5.mp4", title: "Video 5" },
];

const VideoCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = (direction) => {
    setCurrentIndex((prevIndex) =>
      direction === "next"
        ? (prevIndex + 1) % videos.length
        : (prevIndex - 1 + videos.length) % videos.length
    );
  };

  return (
    <section
      className="py-16 px-4 relative overflow-hidden "
      style={{
        background: "radial-gradient(circle, rgba(63,94,251,0.1) 0%, rgba(0,0,0,1) 70%)",
      }}
    >
      <div className="relative max-w-screen-xl mx-auto text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
          I Nostri Video
        </h2>

        {/* Indicatore Progressivo (solo per mobile) */}
        <div className="block sm:hidden w-full h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / videos.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          ></motion.div>
        </div>

        {/* Contenitore Video */}
        <div className="relative flex justify-center items-center">
          {/* Bottone Previous (solo mobile) */}
          <motion.button
            className="absolute left-4 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full shadow-lg hover:scale-110 transition-transform sm:hidden"
            onClick={() => handleScroll("prev")}
            whileHover={{ scale: 1.2 }}
          >
            <ChevronLeft className="text-white w-6 h-6" />
          </motion.button>

          {/* Video Container */}
          <div className="relative w-full flex justify-center overflow-hidden">
            <motion.div
              className="flex flex-wrap sm:flex-nowrap gap-6"
              initial={{ x: 0 }}
              animate={{
                x: `-${currentIndex * 100}%`,
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {videos.map((video, index) => (
                <motion.div
                  key={index}
                  className={`sm:w-[25%] w-full h-[400px] bg-black rounded-xl shadow-3xl overflow-hidden
                  } transition-transform duration-300`}
                >
                  <video
                    src={video.src}
                    controls
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Bottone Next (solo mobile) */}
          <motion.button
            className="absolute right-4 z-10 bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-full shadow-lg hover:scale-110 transition-transform sm:hidden"
            onClick={() => handleScroll("next")}
            whileHover={{ scale: 1.2 }}
          >
            <ChevronRight className="text-white w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

export default VideoCarousel;
