import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Search, Shield, Users, Plus, Edit, Trash2 } from "lucide-react";

const mockUserGroups = [
  {
    id: 1,
    name: "Administrators",
    userCount: 5,
    permissions: {
      createQuiz: true,
      editQuiz: true,
      deleteQuiz: true,
      viewReports: true,
      manageUsers: true,
      issueCertificates: true,
    },
  },
  {
    id: 2,
    name: "Quiz Creators",
    userCount: 12,
    permissions: {
      createQuiz: true,
      editQuiz: true,
      deleteQuiz: false,
      viewReports: true,
      manageUsers: false,
      issueCertificates: true,
    },
  },
  {
    id: 3,
    name: "Viewers",
    userCount: 25,
    permissions: {
      createQuiz: false,
      editQuiz: false,
      deleteQuiz: false,
      viewReports: true,
      manageUsers: false,
      issueCertificates: false,
    },
  },
];

export function UserGroupPrivilegePage() {
  const [userGroups, setUserGroups] = useState(mockUserGroups);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");

  const filteredGroups = userGroups.filter((group) => group.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup = {
      id: Date.now(),
      name: newGroupName,
      userCount: 0,
      permissions: {
        createQuiz: false,
        editQuiz: false,
        deleteQuiz: false,
        viewReports: false,
        manageUsers: false,
        issueCertificates: false,
      },
    };

    setUserGroups([...userGroups, newGroup]);
    setNewGroupName("");
  };

  const handleDeleteGroup = (id) => {
    if (confirm("Are you sure you want to delete this user group?")) {
      setUserGroups(userGroups.filter((group) => group.id !== id));
      if (selectedGroup === id) setSelectedGroup(null);
    }
  };

  const handlePermissionChange = (groupId, permission, value) => {
    setUserGroups(
      userGroups.map((group) =>
        group.id === groupId ? { ...group, permissions: { ...group.permissions, [permission]: value } } : group,
      ),
    );
  };

  const selectedGroupData = userGroups.find((group) => group.id === selectedGroup);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">User Group Privileges</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Groups List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="New group name..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Button onClick={handleCreateGroup}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedGroup === group.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedGroup(group.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{group.name}</div>
                      <div className="text-sm text-muted-foreground">{group.userCount} users</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGroup(group.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedGroupData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedGroupData.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedGroupData.userCount} users in this group</p>
                </div>

                <div className="space-y-3">
                  {Object.entries(selectedGroupData.permissions).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <Label htmlFor={key} className="text-sm font-medium">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </Label>
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handlePermissionChange(selectedGroupData.id, key, checked)}
                      />
                    </div>
                  ))}
                </div>

                <Button className="w-full mt-4">Save Changes</Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">Select a user group to manage permissions</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}