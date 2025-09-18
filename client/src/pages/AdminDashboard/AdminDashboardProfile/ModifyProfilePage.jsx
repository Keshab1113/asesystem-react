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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

import { Switch } from "../../../components/ui/switch";
import { Save, Bell, Shield, Eye } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import useToast from "../../../hooks/ToastContext";
import { updateUser } from "../../../redux/slices/authSlice";
import ProfilePicture from "../../../components/ProfilePicture/ProfilePicture";

export function ModifyProfilePage() {
  const { user, token } = useSelector((state) => state.auth);
  const [editData, setEditData] = useState(user);
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
        dispatch(updateUser(editData));
        toast({
          title: "Profile Updated",
          description: "User updated successfully!",
          variant: "success"
        });
      } else {
        toast({
          title: "Update Failed",
          description: data.message || "Unknown error",
          variant: "error"
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Error",
        description: "An error occurred while updating profile data",
        variant: "error"
      });
    }
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
          <ProfilePicture />
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
                  value={
                    editData.bio ||
                    "Experienced system administrator with 10+ years in IT management."
                  }
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
    </div>
  );
}
