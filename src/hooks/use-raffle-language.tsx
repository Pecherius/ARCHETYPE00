"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { getTranslations, type Translations } from "../lib/raffle-i18n"

interface LanguageContextType {
  language: string
  setLanguage: (language: string) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function RaffleLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState("en")
  const [t, setTranslations] = useState<Translations>(getTranslations("en"))

  useEffect(() => {
    // Load saved language from localStorage
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("punkable_language") || "en"
      setLanguageState(savedLanguage)
      setTranslations(getTranslations(savedLanguage))
    }
  }, [])

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage)
    setTranslations(getTranslations(newLanguage))

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("punkable_language", newLanguage)
    }
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useRaffleLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useRaffleLanguage must be used within a RaffleLanguageProvider")
  }
  return context
}
