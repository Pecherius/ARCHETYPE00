"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRaffleLanguage } from "../hooks/use-raffle-language"
import { getAvailableLanguages } from "../lib/raffle-i18n"

export default function RaffleLanguageSelector() {
  const { language, setLanguage } = useRaffleLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const availableLanguages = getAvailableLanguages()

  const currentLanguage = availableLanguages.find((lang) => lang.code === language) || availableLanguages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 border border-zinc-600 rounded-lg text-zinc-300 hover:bg-zinc-700/50 hover:border-zinc-500 transition-all duration-200"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-48 bg-zinc-800 border border-zinc-600 rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              {availableLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-zinc-700/50 transition-colors ${
                    language === lang.code ? "bg-pink-500/20 text-pink-400" : "text-zinc-300"
                  }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                  {language === lang.code && (
                    <div className="ml-auto w-2 h-2 bg-pink-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
