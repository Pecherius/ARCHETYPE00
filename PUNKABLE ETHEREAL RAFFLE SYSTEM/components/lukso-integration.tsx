"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Download, Copy, Check, ExternalLink, Wallet, FileText, Zap, AlertTriangle, CheckCircle } from "lucide-react"
import { useLanguage } from "../hooks/use-language"
import { generateCSVForBatchSend, exportWinnersForLukso, validateUpAddress } from "../lib/lukso-integration"
import type { Winner } from "../lib/raffle-service"

interface LuksoIntegrationProps {
  winners: Winner[]
  raffleName: string
}

export default function LuksoIntegration({ winners, raffleName }: LuksoIntegrationProps) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)
  const [showBatchData, setShowBatchData] = useState(false)

  const winnersWithAddresses = winners.filter((w) => w.up_address)
  const winnersWithoutAddresses = winners.filter((w) => !w.up_address)
  const validAddresses = winnersWithAddresses.filter((w) => validateUpAddress(w.up_address!))
  const invalidAddresses = winnersWithAddresses.filter((w) => !validateUpAddress(w.up_address!))

  const downloadCSV = () => {
    const csv = generateCSVForBatchSend(winners)
    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${raffleName.replace(/\s+/g, "_")}_winners_lukso.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const downloadJSON = () => {
    const data = exportWinnersForLukso(winners)
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${raffleName.replace(/\s+/g, "_")}_batch_data.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const copyBatchData = async () => {
    const data = exportWinnersForLukso(winners)
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const openLuksoExplorer = () => {
    // Open LUKSO blockchain explorer
    window.open("https://explorer.execution.mainnet.lukso.network/", "_blank")
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-800">LUKSO NFT Distribution</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{winners.length}</div>
            <div className="text-sm text-gray-600">Total Winners</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-green-600">{validAddresses.length}</div>
            <div className="text-sm text-gray-600">Valid UP Addresses</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-yellow-600">{invalidAddresses.length}</div>
            <div className="text-sm text-gray-600">Invalid Addresses</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg shadow-sm">
            <div className="text-2xl font-bold text-red-600">{winnersWithoutAddresses.length}</div>
            <div className="text-sm text-gray-600">Missing Addresses</div>
          </div>
        </div>

        {invalidAddresses.length > 0 && (
          <Alert className="bg-yellow-50 border-yellow-200 mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ Invalid UP Addresses Found:</strong>
              <div className="mt-2 space-y-1">
                {invalidAddresses.map((winner, index) => (
                  <div key={index} className="text-sm">
                    • {winner.participant_name}: <code className="bg-yellow-100 px-1 rounded">{winner.up_address}</code>
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {winnersWithoutAddresses.length > 0 && (
          <Alert className="bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>❌ Winners without UP Addresses:</strong>
              <div className="mt-2 space-y-1">
                {winnersWithoutAddresses.map((winner, index) => (
                  <div key={index} className="text-sm">
                    • {winner.participant_name} - {winner.prize_name}
                  </div>
                ))}
              </div>
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col"
        >
          <Download className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">Download CSV</div>
            <div className="text-xs opacity-90">For batch tools</div>
          </div>
        </Button>

        <Button
          onClick={downloadJSON}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col"
        >
          <FileText className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">Download JSON</div>
            <div className="text-xs opacity-90">Structured data</div>
          </div>
        </Button>

        <Button
          onClick={copyBatchData}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col"
        >
          {copied ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
          <div className="text-center">
            <div className="font-semibold">{copied ? "Copied!" : "Copy Data"}</div>
            <div className="text-xs opacity-90">To clipboard</div>
          </div>
        </Button>

        <Button
          onClick={openLuksoExplorer}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex-col"
        >
          <ExternalLink className="w-6 h-6" />
          <div className="text-center">
            <div className="font-semibold">LUKSO Explorer</div>
            <div className="text-xs opacity-90">Track transactions</div>
          </div>
        </Button>
      </div>

      {/* Batch Data Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-800">Batch Transaction Preview</h4>
          <Button onClick={() => setShowBatchData(!showBatchData)} variant="outline" size="sm">
            {showBatchData ? "Hide" : "Show"} Data
          </Button>
        </div>

        <AnimatePresence>
          {showBatchData && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              {validAddresses.map((winner, index) => (
                <div key={winner.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{winner.participant_name}</div>
                    <div className="text-sm text-gray-600">{winner.prize_name}</div>
                    <div className="text-xs font-mono text-blue-600">{winner.up_address}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-600">Batch #{index + 1}</div>
                    <CheckCircle className="w-4 h-4 text-green-500 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Instructions */}
      <Card className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600" />
          How to Send NFTs on LUKSO
        </h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <div>
              <strong>Download the data:</strong> Use the CSV or JSON export to get all winner addresses and prize
              information.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <div>
              <strong>Prepare your NFTs:</strong> Make sure your NFT contract is deployed on LUKSO and you have the
              tokens ready to transfer.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <div>
              <strong>Use batch transfer:</strong> Use tools like LUKSO's Universal Profile browser extension or custom
              scripts to send multiple NFTs at once.
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <div>
              <strong>Track transactions:</strong> Use the LUKSO Explorer to monitor transaction status and
              confirmations.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
