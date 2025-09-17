import React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Calendar } from "../../components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Separator } from "../../components/ui/separator"
import { Search, Filter, CalendarIcon, X, Save, RotateCcw, SlidersHorizontal } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"



export function AdvancedSearchFilters({
  filters,
  onFiltersChange,
  onSavePreset,
  savedPresets = [],
  onLoadPreset,
  showDateFilters = true,
  showDifficultyFilter = true,
  customFilters,
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [presetName, setPresetName] = useState("")
  const [showPresetInput, setShowPresetInput] = useState(false)

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: "",
      status: "all",
      subject: "all",
      difficulty: "all",
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: "name",
      sortOrder: "asc",
    })
  }

  const saveCurrentPreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), filters)
      setPresetName("")
      setShowPresetInput(false)
    }
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.status !== "all") count++
    if (filters.subject !== "all") count++
    if (filters.difficulty !== "all") count++
    if (filters.dateFrom || filters.dateTo) count++
    return count
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filters
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {isExpanded ? "Simple" : "Advanced"}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.status} onValueChange={(value) => updateFilter("status", value)}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Not Active">Not Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* <Select value={filters.subject} onValueChange={(value) => updateFilter("subject", value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="Programming">Programming</SelectItem>
              <SelectItem value="Database">Database</SelectItem>
              <SelectItem value="Security">Security</SelectItem>
              <SelectItem value="Networking">Networking</SelectItem>
            </SelectContent>
          </Select> */}

          {showDifficultyFilter && (
            <Select value={filters.difficulty} onValueChange={(value) => updateFilter("difficulty", value)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Advanced Filters */}
        {isExpanded && (
          <div className="space-y-4 pt-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date Range Filters */}
              {showDateFilters && (
                <>
                  <div className="space-y-2">
                    <Label>From Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateFrom && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom}
                          onSelect={(date) => updateFilter("dateFrom", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>To Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !filters.dateTo && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo}
                          onSelect={(date) => updateFilter("dateTo", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </>
              )}

              {/* Sort Options */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <div className="flex gap-2">
                  <Select value={filters.sortBy} onValueChange={(value) => updateFilter("sortBy", value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="participants">Participants</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder}
                    onValueChange={(value) => updateFilter("sortOrder", value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">↑</SelectItem>
                      <SelectItem value="desc">↓</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Custom Filters */}
            {customFilters && (
              <>
                <Separator />
                {customFilters}
              </>
            )}

            {/* Saved Presets */}
            {(savedPresets.length > 0 || onSavePreset) && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label>Filter Presets</Label>

                  {savedPresets.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {savedPresets.map((preset, index) => (
                        <Button key={index} variant="outline" size="sm" onClick={() => onLoadPreset?.(preset.filters)}>
                          {preset.name}
                        </Button>
                      ))}
                    </div>
                  )}

                  {onSavePreset && (
                    <div className="flex gap-2">
                      {!showPresetInput ? (
                        <Button variant="outline" size="sm" onClick={() => setShowPresetInput(true)}>
                          <Save className="h-4 w-4 mr-2" />
                          Save Current Filters
                        </Button>
                      ) : (
                        <>
                          <Input
                            placeholder="Preset name..."
                            value={presetName}
                            onChange={(e) => setPresetName(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={saveCurrentPreset}>
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowPresetInput(false)
                              setPresetName("")
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}