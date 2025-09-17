import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "../../components/ui/button";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../components/ui/collapsible";
import {
  FileText,
  Award,
  Shield,
  Database,
  Users,
  ChevronDown,
  ChevronRight,
  BarChart3,
  UserCheck,
  Plus,
  Building,
  UserCircle,
  History,
  Edit,
  Key,
  Home,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    page: "",
    items: [],
  },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Quiz Report", icon: FileText, page: "quiz-report" },
      {
        title: "Issue Manual Certificate",
        icon: Award,
        page: "issue-certificate",
      },
    ],
  },
  {
    title: "Privileges",
    icon: Shield,
    items: [
      {
        title: "User Group Privilege",
        icon: UserCheck,
        page: "user-group-privilege",
      },
    ],
  },
  {
    title: "Master",
    icon: Database,
    items: [
      // { title: "Add Questions", icon: Plus, page: "add-questions" },
      { title: "Assessment Master", icon: FileText, page: "subject-master" },
      { title: "Group Master", icon: Building, page: "contractor-master" },
    ],
  },
  {
    title: "My Profile",
    icon: Users,
    items: [
      { title: "My Account", icon: UserCircle, page: "my-account" },
      { title: "User Logs", icon: History, page: "user-logs" },
      { title: "Modify Profile", icon: Edit, page: "modify-profile" },
    ],
  },
];

export function AdminSidebar({ isOpen, onClose }) {
  const [openSections, setOpenSections] = useState(["Reports"]);
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split("/").pop();
  const toggleSection = (title) => {
    setOpenSections((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };


  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] w-72 transform bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out xl:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
        )}
      >
        <ScrollArea className="h-full py-4">
          <nav className="space-y-2 px-3">
            {navigationItems.map((section) => (
              <div key={section.title}>
                {section.items.length === 0 ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start rounded-lg px-3 py-2 font-medium transition-colors",
                      "hover:bg-primary hover:text-white",
                      currentPath === section.page || currentPath === "admin-dashboard"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-muted-foreground"
                    )}
                    onClick={() => navigate(section.page)}
                  >
                    <section.icon className="mr-3 h-5 w-5" />
                    {section.title}
                  </Button>
                ) : (
                  <Collapsible
                    open={openSections.includes(section.title)}
                    onOpenChange={() => toggleSection(section.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sidebar-foreground hover:bg-[#6366f1] hover:text-white"
                      >
                        <section.icon className="mr-2 h-4 w-4" />
                        {section.title}
                        {openSections.includes(section.title) ? (
                          <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                          <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1 ml-4 border-l border-sidebar-border pl-2 mt-1">
                      {section.items.map((item) => (
                        <Button
                          key={item.title}
                          variant="ghost"
                          className={cn(
                            "w-full justify-start pl-10 rounded-md text-sm font-normal transition-colors",
                            "hover:bg-primary/90 hover:text-white",
                            currentPath === item.page
                              ? "bg-slate-800 text-white shadow-sm"
                              : "text-muted-foreground"
                          )}
                          onClick={() => navigate(item.page)}
                        >
                          <item.icon className="mr-2 h-4 w-4" />
                          {item.title}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}
