import { useState } from "react";
import { AdminHeader } from "../../components/AdminDashboard/AdminHeader";
import { AdminSidebar } from "../../components/AdminDashboard/AdminSidebar";
import { DashboardContent } from "../../components/AdminDashboard/DashboardContent";
import { QuizReportPage } from "./QuizReportPage";
import { IssueCertificatePage } from "../../components/AdminDashboard/IssueCertificatePage";
import { UserGroupPrivilegePage } from "../../components/AdminDashboard/UserGroupPrivilegePage";
import { AddQuestionsPage } from "../../components/AdminDashboard/AddQuestionsPage";
import { SubjectMasterPage } from "./SubjectMasterPage";
import { ContractorMasterPage } from "../../components/AdminDashboard/ContractorMasterPage";
import { MyAccountPage } from "../../components/AdminDashboard/MyAccountPage";
import { UserLogsPage } from "./UserLogsPage";
import { ModifyProfilePage } from "../../components/AdminDashboard/ModifyProfilePage";
import { ChangePasswordPage } from "./AdminDashboardProfile/ChangePasswordPage";
import AddSubjectPage from "../../components/AdminDashboard/AddSubject";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    closeSidebar();
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "admin-dashboard":
        return <DashboardContent />;
      case "quiz-report":
        return <QuizReportPage />;
      case "issue-certificate":
        return <IssueCertificatePage />;
      case "user-group-privilege":
        return <UserGroupPrivilegePage />;
      case "add-questions":
        return <AddQuestionsPage />;
      case "subject-master":
        return <SubjectMasterPage onPageChange={handlePageChange} />;
      case "add-subject":
        return <AddSubjectPage onPageChange={handlePageChange} />;
      case "contractor-master":
        return <ContractorMasterPage />;
      case "my-account":
        return <MyAccountPage />;
      case "user-logs":
        return <UserLogsPage />;
      case "modify-profile":
        return <ModifyProfilePage />;
      case "change-password":
        return <ChangePasswordPage />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader onMenuClick={toggleSidebar} />
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      <main className="pt-16 xl:pl-72">
        <div className="p-4 sm:p-6">{renderCurrentPage()}</div>
      </main>
    </div>
  );
}
