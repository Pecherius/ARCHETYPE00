"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { CheckCircle, AlertTriangle, Edit3, Save, X } from "lucide-react"
import { useLanguage } from "../hooks/use-language"
import LuksoIntegration from "./lukso-integration"
import type { Winner } from "../lib/raffle-service"

interface WinnerManagementProps {
  winners: Winner[]
  raffleName: string
  onUpdateWinner?: (winnerId: string, updates: Partial<Winner>) => void
}

export default function WinnerManagement({ winners, raffleName, onUpdateWinner }: WinnerManagementProps) {
  const { t } = useLanguage()
  const [editingWinner, setEditingWinner] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ up_address: string }>({ up_address: "" })

  const handleEditWinner = (winner: Winner) => {
    setEditingWinner(winner.id)
    setEditData({ up_address: winner.up_address || "" })
  }

  const handleSaveEdit = (winnerId: string) => {
    if (onUpdateWinner) {
      onUpdateWinner(winnerId, { up_address: editData.up_address.trim() || undefined })
    }
    setEditingWinner(null)
  }

  const handleCancelEdit = () => {
    setEditingWinner(null)
    setEditData({ up_address: "" })
  }

  const getStatusIcon = (winner: Winner) => {
    if (!winner.up_address) {
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />
    }
    // You can extend this with actual transaction status from database
    return <CheckCircle className="w-4 h-4 text-green-500" />
  }

  const getStatusText = (winner: Winner) => {
    if (!winner.up_address) return "Missing UP Address"
    // You can extend this with actual transaction status
    return "Ready to Send"
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Winner Management</h2>
        <div className="text-sm text-gray-600">{winners.length} total winners</div>
      </div>

      <Tabs defaultValue="winners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="winners">Winners List</TabsTrigger>
          <TabsTrigger value="lukso">LUKSO Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="winners" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">All Winners</h3>
            <div className="space-y-3">
              {winners.map((winner) => (
                <motion.div
                  key={winner.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4"
                  style={{ borderLeftColor: winner.participant_color }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: winner.participant_color }} />
                      <span className="font-semibold text-gray-800">{winner.participant_name}</span>
                      <span className="text-sm bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
                        {winner.prize_name}
                      </span>
                    </div>

                    {editingWinner === winner.id ? (
                      <div className="flex items-center gap-2 ml-7">
                        <Input
                          value={editData.up_address}
                          onChange={(e) => setEditData({ up_address: e.target.value })}
                          placeholder="0x... Universal Profile Address"
                          className="text-xs font-mono"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(winner.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="ml-7">
                        {winner.up_address ? (
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              {winner.up_address}
                            </code>
                            <Button size="sm" variant="ghost" onClick={() => handleEditWinner(winner)}>
                              <Edit3 className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditWinner(winner)}
                            className="text-xs"
                          >
                            Add UP Address
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm">
                        {getStatusIcon(winner)}
                        {getStatusText(winner)}
                      </div>
                      <div className="text-xs text-gray-500">{new Date(winner.won_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="lukso">
          <LuksoIntegration winners={winners} raffleName={raffleName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
