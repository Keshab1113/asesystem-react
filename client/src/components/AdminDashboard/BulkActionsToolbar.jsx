"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Archive, Copy, Download, CheckCircle, XCircle, X, MoreHorizontal } from "lucide-react"
import { ConfirmationDialog } from "./ConfirmationDialog"
import useToast from "../../hooks/ToastContext"

export function BulkActionsToolbar({ selectedItems, onClearSelection, onBulkAction }) {
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    action: "",
  })
  const { toast } = useToast()

  if (selectedItems.length === 0) return null

  const handleBulkAction = (action) => {
    if (action === "delete" || action === "archive") {
      setConfirmDialog({ open: true, action })
    } else {
      onBulkAction(action, selectedItems)
      onClearSelection()

      toast({
        title: "Bulk Action Completed",
        description: `Successfully applied ${action} to ${selectedItems.length} items.`,
      })
    }
  }

  const confirmBulkAction = () => {
    onBulkAction(confirmDialog.action, selectedItems)
    onClearSelection()

    toast({
      title: "Bulk Action Completed",
      description: `Successfully ${confirmDialog.action}d ${selectedItems.length} items.`,
      variant: confirmDialog.action === "delete" ? "destructive" : "default",
    })
  }

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-muted/50 border rounded-lg mb-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{selectedItems.length} selected</Badge>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={handleBulkAction}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Bulk actions..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activate">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Activate Selected
                </div>
              </SelectItem>
              <SelectItem value="deactivate">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Deactivate Selected
                </div>
              </SelectItem>
              <SelectItem value="duplicate">
                <div className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicate Selected
                </div>
              </SelectItem>
              <SelectItem value="export">
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Selected
                </div>
              </SelectItem>
              <SelectItem value="archive">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Archive Selected
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open, action: "" })}
        title={`${confirmDialog.action === "delete" ? "Delete" : "Archive"} Selected Items`}
        description={`Are you sure you want to ${confirmDialog.action} ${selectedItems.length} selected items? This action cannot be undone.`}
        confirmText={`${confirmDialog.action === "delete" ? "Delete" : "Archive"} Items`}
        variant={confirmDialog.action === "delete" ? "destructive" : "default"}
        onConfirm={confirmBulkAction}
      />
    </>
  )
}