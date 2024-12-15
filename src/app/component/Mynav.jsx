import { Bot, BarChart3, Settings, ArrowRight, Play, Pause, CheckCircle } from "lucide-react";
import Link from "next/link";
const Mynav = () => {
    return(
        <div className="sticky navbar top-0 z-50 w-full py-6 backdrop-blur-sm bg-black/30 border-b border-white/10 hidden sm:block">
        <div className="w-[90%] mx-auto relative flex items-center h-12 justify-between sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/icon.png" className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full"></img>
            <span className="font-semibold tracking-wide text-sm md:text-base">Hospitality Bot</span>
          </div>

          {/* CTA Desktop */}
          <Link href={"/register"} passHref className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full font-semibold text-xs md:text-sm hover:scale-105 transition-transform hidden sm:block">
          Registrati
        </Link>

          {/* Nav Links */}
          <nav className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 backdrop-blur-md bg-black/30 border border-white/10 rounded-full px-8 py-5 flex gap-8 text-gray-300 text-sm items-center justify-center shadow-lg">
            <a href="#panoramica" className="hover:text-white transition-colors">Panoramica</a>
            <a href="#caratteristiche" className="hover:text-white transition-colors">Caratteristiche</a>
            <a href="#roadmap" className="hover:text-white transition-colors">Tabella di marcia</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
            <a href="#info" className="hover:text-white transition-colors">Info</a>
          </nav>

        </div>
      </div>
    )
}
export default Mynav