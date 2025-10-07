"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Globe } from "lucide-react"
import { useLanguage } from "../hooks/use-language"
import { getAvailableLanguages } from "../lib/i18n"

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const availableLanguages = getAvailableLanguages()

  const currentLanguage = availableLanguages.find((lang) => lang.code === language) || availableLanguages[0]

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border-pink-200 hover:bg-pink-50 hover:border-pink-300 transition-all duration-200"
        >
          <Globe className="w-4 h-4 text-pink-600" />
          <span className="text-sm font-medium text-gray-700">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-white border-pink-200 shadow-lg">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => {
              setLanguage(lang.code)
              setIsOpen(false)
            }}
            className={`flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-pink-50 transition-colors ${
              language === lang.code ? "bg-pink-100 text-pink-700" : "text-gray-700"
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-medium">{lang.name}</span>
            {language === lang.code && <div className="ml-auto w-2 h-2 bg-pink-500 rounded-full" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
