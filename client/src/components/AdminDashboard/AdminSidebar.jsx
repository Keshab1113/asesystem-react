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



const navigationItems = [
  {
    title: "Dashboard",
    icon: Home,
    page: "dashboard",
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
      { title: "Add Questions", icon: Plus, page: "add-questions" },
      { title: "Subject Master", icon: FileText, page: "subject-master" },
      { title: "Contractor Master", icon: Building, page: "contractor-master" },
    ],
  },
  {
    title: "Users",
    icon: Users,
    items: [
      { title: "My Account", icon: UserCircle, page: "my-account" },
      { title: "User Logs", icon: History, page: "user-logs" },
      { title: "Modify Profile", icon: Edit, page: "modify-profile" },
      { title: "Change Password", icon: Key, page: "change-password" },
    ],
  },
];

export function AdminSidebar({
  isOpen,
  onClose,
  currentPage,
  onPageChange,
}) {
  const [openSections, setOpenSections] = useState(["Reports"]);

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
                      "w-full justify-start text-sidebar-foreground hover:bg-[#6366f1] hover:text-white",
                      currentPage === section.page && "bg-[#6366f1] text-white"
                    )}
                    onClick={() => onPageChange(section.page)}
                  >
                    <section.icon className="mr-2 h-4 w-4" />
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
                            "w-full justify-start pl-8 text-sm text-muted-foreground hover:bg-[#6366f1]/80 hover:text-white rounded-md",
                            currentPage === item.page &&
                              "bg-[#6366f1] text-white"
                          )}
                          onClick={() => onPageChange(item.page)}
                        >
                          <item.icon className="mr-2 h-3 w-3" />
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