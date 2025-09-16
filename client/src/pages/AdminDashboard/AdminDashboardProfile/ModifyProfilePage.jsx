import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import { Edit, Save, Upload, Bell, Shield, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useToast from "../../../hooks/ToastContext";
import { updateUser } from "../../../redux/slices/authSlice";

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
};

export function ModifyProfilePage() {
  const { user, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(user);
  const [editData, setEditData] = useState(user);
  const [profile, setProfile] = useState(mockProfile);
  const [activeTab, setActiveTab] = useState("personal");
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setUserData(editData);
        dispatch(updateUser(editData));
        toast({
          title: "Profile Updated",
          description: "User updated successfully!",
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating profile data",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = () => {
    alert("Avatar upload functionality would be implemented here");
  };

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
                  <AvatarImage
                    src={userData.avatar || "/admin-avatar.png"}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {userData.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={editData.name}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={editData.role}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                          role: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={editData.phone}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={editData.department || "IT Department"}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        department: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={editData.position}
                    onChange={(e) =>
                      setEditData({
                        ...editData,
                        position: e.target.value,
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
                  value={editData.bio || "Experienced system administrator with 10+ years in IT management."}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      bio: e.target.value,
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
                      preferences: {
                        ...profile.preferences,
                        emailNotifications: checked,
                      },
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
                      preferences: {
                        ...profile.preferences,
                        smsNotifications: checked,
                      },
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
                      preferences: {
                        ...profile.preferences,
                        weeklyReports: checked,
                      },
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
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch
                  checked={profile.security.twoFactorEnabled}
                  onCheckedChange={(checked) =>
                    setProfile({
                      ...profile,
                      security: {
                        ...profile.security,
                        twoFactorEnabled: checked,
                      },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">
                  Session Timeout (minutes)
                </Label>
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
  );
}
