import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Switch } from "../../components/ui/switch"
import { Edit, Save, Upload, Bell, Shield, Eye } from "lucide-react"

const mockProfile = {
  personalInfo: {
    firstName: "John",
    lastName: "Administrator",
    email: "john.admin@company.com",
    phone: "+1-555-0123",
    department: "IT Department",
    jobTitle: "System Administrator",
    bio: "Experienced system administrator with 10+ years in IT management.",
    avatar: "/admin-avatar.png",
  },
  preferences: {
    emailNotifications: true,
    smsNotifications: false,
    weeklyReports: true,
    theme: "system",
    language: "en",
    timezone: "UTC-5",
  },
  security: {
    twoFactorEnabled: true,
    lastPasswordChange: "2024-01-15",
    sessionTimeout: "30",
  },
}

export function ModifyProfilePage() {
  const [profile, setProfile] = useState(mockProfile)
  const [activeTab, setActiveTab] = useState("personal")

  const handleSave = () => {
    alert("Profile updated successfully!")
  }

  const handleAvatarUpload = () => {
    alert("Avatar upload functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Modify Profile</h1>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "personal" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("personal")}
        >
          Personal Info
        </Button>
        <Button
          variant={activeTab === "preferences" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("preferences")}
        >
          Preferences
        </Button>
        <Button
          variant={activeTab === "security" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("security")}
        >
          Security
        </Button>
      </div>

      {/* Personal Information Tab */}
      {activeTab === "personal" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="h-5 w-5 mr-2" />
                Profile Picture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profile.personalInfo.avatar || "/admin-avatar.png"} alt="Profile" />
                  <AvatarFallback>
                    {profile.personalInfo.firstName[0]}
                    {profile.personalInfo.lastName[0]}
                  </AvatarFallback>
                </Avatar>
                <Button onClick={handleAvatarUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Photo
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={profile.personalInfo.firstName}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, firstName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={profile.personalInfo.lastName}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, lastName: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.personalInfo.email}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, email: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profile.personalInfo.phone}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, phone: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={profile.personalInfo.department}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, department: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={profile.personalInfo.jobTitle}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        personalInfo: { ...profile.personalInfo, jobTitle: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  value={profile.personalInfo.bio}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      personalInfo: { ...profile.personalInfo, bio: e.target.value },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={profile.preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, emailNotifications: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="smsNotifications">SMS Notifications</Label>
                <Switch
                  id="smsNotifications"
                  checked={profile.preferences.smsNotifications}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, smsNotifications: checked },
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="weeklyReports">Weekly Reports</Label>
                <Switch
                  id="weeklyReports"
                  checked={profile.preferences.weeklyReports}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, weeklyReports: checked },
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Display Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={profile.preferences.theme}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, theme: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={profile.preferences.language}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, language: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  value={profile.preferences.timezone}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      preferences: { ...profile.preferences, timezone: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                    <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                    <SelectItem value="UTC+0">GMT (UTC+0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Switch
                  checked={profile.security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      security: { ...profile.security, twoFactorEnabled: checked },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Select
                  value={profile.security.sessionTimeout}
                  onValueChange={(value) =>
                    setProfile({
                      ...profile,
                      security: { ...profile.security, sessionTimeout: value },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-4">
                <p className="text-sm text-muted-foreground">
                  Last password change: {profile.security.lastPasswordChange}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Password Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-transparent" variant="outline">
                Change Password
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                Download Backup Codes
              </Button>
              <Button className="w-full bg-transparent" variant="outline">
                View Active Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}