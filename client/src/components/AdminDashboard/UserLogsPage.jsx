"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Badge } from "../../components/ui/badge"
import { Search, Filter, Download, Eye, Calendar } from "lucide-react"



const mockLogs = [
  {
    id: 1,
    user: "john.admin@company.com",
    action: "Login",
    details: "User logged in successfully",
    timestamp: "2024-01-30 14:30:25",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: 2,
    user: "jane.creator@company.com",
    action: "Quiz Created",
    details: "Created quiz: JavaScript Fundamentals",
    timestamp: "2024-01-30 13:45:12",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: 3,
    user: "mike.user@company.com",
    action: "Failed Login",
    details: "Invalid password attempt",
    timestamp: "2024-01-30 12:15:33",
    ipAddress: "192.168.1.102",
    status: "error",
  },
  {
    id: 4,
    user: "sarah.admin@company.com",
    action: "User Deleted",
    details: "Deleted user account: test.user@company.com",
    timestamp: "2024-01-30 11:20:45",
    ipAddress: "192.168.1.103",
    status: "warning",
  },
  {
    id: 5,
    user: "john.admin@company.com",
    action: "Certificate Issued",
    details: "Manual certificate issued to John Doe",
    timestamp: "2024-01-30 10:30:15",
    ipAddress: "192.168.1.100",
    status: "success",
  },
]

export function UserLogsPage() {
  const [logs, setLogs] = useState(mockLogs)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [actionFilter, setActionFilter] = useState("all")

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || log.status === statusFilter
    const matchesAction = actionFilter === "all" || log.action.toLowerCase().includes(actionFilter.toLowerCase())
    return matchesSearch && matchesStatus && matchesAction
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "default"
      case "warning":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleExportLogs = () => {
    alert("Exporting logs to CSV...")
  }

  const handleViewDetails = (id) => {
    alert(`Viewing detailed log for ID: ${id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">User Logs</h1>
        <Button onClick={handleExportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filter Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="certificate">Certificate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div key={log.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={getStatusColor(log.status)}>{log.status}</Badge>
                      <span className="font-medium">{log.action}</span>
                      <span className="text-sm text-muted-foreground">by {log.user}</span>
                    </div>
                    <p className="text-sm mb-2">{log.details}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {log.timestamp}
                      </div>
                      <div>IP: {log.ipAddress}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleViewDetails(log.id)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            ))}
            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No logs found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}