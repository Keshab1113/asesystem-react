import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  Phone,
  Mail,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import useToast from "../../hooks/ToastContext";
import { useSelector } from "react-redux";

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
  const [companies, setCompanies] = useState([]);
  const { toast } = useToast();
  const { token, user } = useSelector((state) => state.auth);
  const [newContractor, setNewContractor] = useState({
    contractor_name: "",
    email: "",
    phone: "",
    company_name: "",
    address: "",
    specialization: "",
    license_number: "",
  });
  const [newCompany, setNewCompany] = useState({
    name: "",
    email: "",
    phone: "",
    active: true,
    address: "",
  });

  const filteredContractors = contractors.filter(
    (contractor) =>
      (contractor.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (contractor.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (contractor.company_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const fetchCompanies = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/companies`
      );
      const data = await res.json();
      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchContractor = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`
      );
      const data = await res.json();
      if (data.success) {
        setContractors(data.data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };
  useEffect(() => {
    fetchContractor();
  }, []);

  const handleAddCompany = async () => {
    if (!newCompany.name.trim() || !newCompany.email.trim()) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/companies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newCompany),
        }
      );

      const data = await response.json();

      if (data.success) {
        fetchCompanies();
        toast({
          title: "Company Added",
          description: "New Company added successfully",
        });
        setNewCompany({
          name: "",
          email: "",
          phone: "",
          active: true,
          address: "",
        });
      } else {
        toast({
          title: "Company added Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding contractor:", error);
      toast({
        title: "Company added Failed",
        description: "Failed to add Company",
        variant: "destructive",
      });
    }
  };

  const handleAddContractor = async () => {
    try {
      const selectedCompany = companies.find(
        (c) => c.name === newContractor.company_name
      );

      if (!selectedCompany) {
        toast({
          title: "Failed to add contractor",
          description: "Please select a valid company",
          variant: "destructive",
        });
        return;
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/contractors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newContractor,
            company_id: selectedCompany.id,
            created_by: user.id,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Contractor Added",
          description: "New Contractor added successfully",
        });
        setContractors([
          ...contractors,
          {
            id: data.contractorId,
            ...newContractor,
            isActive: true,
            created_at: new Date().toISOString().split("T")[0],
            quizCount: 0,
          },
        ]);
        setNewContractor({
          contractor_name: "",
          email: "",
          phone: "",
          company_name: "",
          address: "",
          specialization: "",
          license_number: "",
        });
      } else {
        toast({
          title: "Contractor added Failed",
          description: data.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error adding contractor:", error);
      toast({
        title: "Contractor added Failed",
        description: "Failed to add contractor",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContractor = (id) => {
    if (confirm("Are you sure you want to delete this contractor?")) {
      setContractors(contractors.filter((contractor) => contractor.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setContractors(
      contractors.map((contractor) =>
        contractor.id === id
          ? { ...contractor, isActive: !contractor.isActive }
          : contractor
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between ">
        <h1 className="text-3xl font-bold text-foreground">
          Contractor Master
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contractors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Contractor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Company
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-name">Company Name</Label>
                <Input
                  id="company-name"
                  placeholder="Enter Company name..."
                  value={newCompany.name}
                  onChange={(e) =>
                    setNewCompany({ ...newCompany, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contractor-email">Email</Label>
                <Input
                  id="contractor-email"
                  type="email"
                  placeholder="Enter email..."
                  value={newCompany.email}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor-phone">Phone</Label>
                <Input
                  id="contractor-phone"
                  placeholder="Enter phone number..."
                  value={newCompany.phone}
                  onChange={(e) =>
                    setNewCompany({
                      ...newCompany,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="active">Active</Label>
                <Select
                  value={newCompany.active}
                  onValueChange={(value) =>
                    setNewCompany({
                      ...newCompany,
                      active: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={true}>Active</SelectItem>
                    <SelectItem value={false}>Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-pic">Company Logo (URL)</Label>
              <Input
                id="profile-pic"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    profile_pic_url: e.target.files[0],
                  })
                }
              />
              {newCompany.profile_pic && (
                <img
                  src={URL.createObjectURL(newCompany.profile_pic)}
                  alt="Preview"
                  className="h-16 w-16 rounded-full object-cover mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor-address">Address</Label>
              <Textarea
                id="contractor-address"
                placeholder="Enter address..."
                value={newCompany.address}
                onChange={(e) =>
                  setNewCompany({
                    ...newCompany,
                    address: e.target.value,
                  })
                }
                rows={2}
              />
            </div>

            <Button onClick={handleAddCompany} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Add New Contractor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contractor_name">Contact Name</Label>
                <Input
                  id="contractor_name"
                  placeholder="Enter contact name..."
                  value={newContractor.contractor_name}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      contractor_name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email..."
                  value={newContractor.email}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      email: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company</Label>
                <Select
                  value={setNewContractor.company_name}
                  onValueChange={(value) =>
                    setNewContractor({
                      ...newContractor,
                      company_name: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="license_number">License Number</Label>
                <Input
                  id="license_number"
                  placeholder="Enter license number..."
                  value={newContractor.license_number}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      license_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  placeholder="Enter Your Specialization"
                  value={newContractor.specialization}
                  onChange={(e) =>
                    setNewContractor({
                      ...newContractor,
                      specialization: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractor-address">Address</Label>
              <Textarea
                id="contractor-address"
                placeholder="Enter address..."
                value={newContractor.address}
                onChange={(e) =>
                  setNewContractor({
                    ...newContractor,
                    address: e.target.value,
                  })
                }
                rows={2}
              />
            </div>

            <Button onClick={handleAddContractor} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Contractor
            </Button>
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
                      <Badge
                        variant={contractor.isActive ? "default" : "secondary"}
                      >
                        {contractor.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {contractor.quizCount} quizzes
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {contractor.company_name}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-3 w-3 mr-1" />
                        {contractor.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contractor.phone}
                      </div>
                      <div className="text-xs">
                        Joined: {" "}
                        {contractor.created_at
                          ? new Date(contractor.created_at).toLocaleString()
                          : "Never"}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {contractor.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditing(contractor.id)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant={contractor.isActive ? "destructive" : "default"}
                      onClick={() => handleToggleStatus(contractor.id)}
                    >
                      {contractor.isActive ? "Deactivate" : "Activate"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteContractor(contractor.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {filteredContractors.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No contractors found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
