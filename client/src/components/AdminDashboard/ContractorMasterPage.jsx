import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Search, Plus, Edit, Trash2, Building, Phone, Mail } from "lucide-react";

const mockContractors = [
  {
    id: 1,
    name: "Tech Solutions Inc.",
    email: "contact@techsolutions.com",
    phone: "+1-555-0123",
    company: "Tech Solutions Inc.",
    address: "123 Business Ave, Tech City, TC 12345",
    isActive: true,
    joinedDate: "2024-01-15",
    quizCount: 12,
  },
  {
    id: 2,
    name: "Digital Learning Corp",
    email: "info@digitallearning.com",
    phone: "+1-555-0456",
    company: "Digital Learning Corp",
    address: "456 Education Blvd, Learn City, LC 67890",
    isActive: true,
    joinedDate: "2024-01-20",
    quizCount: 8,
  },
  {
    id: 3,
    name: "Training Partners LLC",
    email: "hello@trainingpartners.com",
    phone: "+1-555-0789",
    company: "Training Partners LLC",
    address: "789 Training St, Skill Town, ST 54321",
    isActive: false,
    joinedDate: "2024-01-10",
    quizCount: 5,
  },
];

export function ContractorMasterPage() {
  const [contractors, setContractors] = useState(mockContractors);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(null);
  const [newContractor, setNewContractor] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
  });

  const filteredContractors = contractors.filter(
    (contractor) =>
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contractor.company.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddContractor = () => {
    if (!newContractor.name.trim() || !newContractor.email.trim()) return;

    const contractor = {
      id: Date.now(),
      ...newContractor,
      isActive: true,
      joinedDate: new Date().toISOString().split("T")[0],
      quizCount: 0,
    };

    setContractors([...contractors, contractor]);
    setNewContractor({ name: "", email: "", phone: "", company: "", address: "" });
  };

  const handleDeleteContractor = (id) => {
    if (confirm("Are you sure you want to delete this contractor?")) {
      setContractors(contractors.filter((contractor) => contractor.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setContractors(
      contractors.map((contractor) =>
        contractor.id === id ? { ...contractor, isActive: !contractor.isActive } : contractor,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Contractor Master</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Contractor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Contractor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-name">Contact Name</Label>
                <Input
                  id="contractor-name"
                  placeholder="Enter contact name..."
                  value={newContractor.name}
                  onChange={(e) => setNewContractor({ ...newContractor, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor-email">Email</Label>
                <Input
                  id="contractor-email"
                  type="email"
                  placeholder="Enter email..."
                  value={newContractor.email}
                  onChange={(e) => setNewContractor({ ...newContractor, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-phone">Phone</Label>
                <Input
                  id="contractor-phone"
                  placeholder="Enter phone number..."
                  value={newContractor.phone}
                  onChange={(e) => setNewContractor({ ...newContractor, phone: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor-company">Company</Label>
                <Input
                  id="contractor-company"
                  placeholder="Enter company name..."
                  value={newContractor.company}
                  onChange={(e) => setNewContractor({ ...newContractor, company: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor-address">Address</Label>
              <Textarea
                id="contractor-address"
                placeholder="Enter address..."
                value={newContractor.address}
                onChange={(e) => setNewContractor({ ...newContractor, address: e.target.value })}
                rows={2}
              />
            </div>

            <Button onClick={handleAddContractor} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Contractor
            </Button>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Contractor Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contractors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contractors List */}
      <Card>
        <CardHeader>
          <CardTitle>All Contractors ({filteredContractors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredContractors.map((contractor) => (
              <div key={contractor.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{contractor.name}</h3>
                      <Badge variant={contractor.isActive ? "default" : "secondary"}>
                        {contractor.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">{contractor.quizCount} quizzes</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {contractor.company}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contractor.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contractor.phone}
                      </div>
                      <div className="text-xs">Joined: {contractor.joinedDate}</div>
                    </div>
                    <p className="text-xs text-muted-foreground">{contractor.address}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(contractor.id)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={contractor.isActive ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(contractor.id)}
                    >
                      {contractor.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteContractor(contractor.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredContractors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No contractors found matching your criteria.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}