"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, Clock, Award, BarChart3, FileText, Edit, Copy, Share2, Download } from "lucide-react"





export function QuizDetailsModal({ quiz, open, onOpenChange, onEdit, onDuplicate }) {
  if (!quiz) return null

  const mockStats = {
    completionRate: 78,
    averageScore: 82.5,
    averageTime: "12 minutes",
    topScore: 98,
    questionsCount: 25,
    passRate: 85,
  }

  const mockRecentActivity = [
    { user: "John Doe", action: "Completed", score: 95, time: "2 hours ago" },
    { user: "Jane Smith", action: "Started", score: null, time: "3 hours ago" },
    { user: "Mike Johnson", action: "Completed", score: 78, time: "5 hours ago" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {quiz.name}
          </DialogTitle>
          <DialogDescription>Detailed information and statistics for this quiz</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => onEdit(quiz)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Quiz
            </Button>
            <Button variant="outline" onClick={() => onDuplicate(quiz)}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="participants">Participants</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quiz Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={quiz.status === "Active" ? "default" : "secondary"}>{quiz.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Subject:</span>
                      <span className="text-sm font-medium">{quiz.subject}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Difficulty:</span>
                      <Badge
                        variant={
                          quiz.difficulty === "easy"
                            ? "default"
                            : quiz.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm font-medium">{quiz.createdDate}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Questions:</span>
                      <span className="text-sm font-medium">{mockStats.questionsCount}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Participants:</span>
                      <span className="text-sm font-medium">{quiz.participants}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Average Score:</span>
                      <span className="text-sm font-medium">{mockStats.averageScore}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Average Time:</span>
                      <span className="text-sm font-medium">{mockStats.averageTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Pass Rate:</span>
                      <span className="text-sm font-medium">{mockStats.passRate}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completed</span>
                        <span>{mockStats.completionRate}%</span>
                      </div>
                      <Progress value={mockStats.completionRate} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Pass Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Passed</span>
                        <span>{mockStats.passRate}%</span>
                      </div>
                      <Progress value={mockStats.passRate} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Score Distribution</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Score:</span>
                      <span className="font-medium">{mockStats.averageScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Highest Score:</span>
                      <span className="font-medium">{mockStats.topScore}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Attempts:</span>
                      <span className="font-medium">{quiz.participants}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Time Analytics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Average Time:</span>
                      <span className="font-medium">{mockStats.averageTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Fastest Completion:</span>
                      <span className="font-medium">8 minutes</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Slowest Completion:</span>
                      <span className="font-medium">25 minutes</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="participants" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockRecentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{activity.user}</div>
                          <div className="text-sm text-muted-foreground">{activity.time}</div>
                        </div>
                        <div className="text-right">
                          <Badge variant={activity.action === "Completed" ? "default" : "secondary"}>
                            {activity.action}
                          </Badge>
                          {activity.score && <div className="text-sm font-medium mt-1">Score: {activity.score}%</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">Quiz created</div>
                        <div className="text-xs text-muted-foreground">{quiz.createdDate}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">First participant joined</div>
                        <div className="text-xs text-muted-foreground">2 days ago</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 border rounded-lg">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">100th completion milestone reached</div>
                        <div className="text-xs text-muted-foreground">1 day ago</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}