import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./layout";
import Home from "./pages/Home/Home";
import LoginPage from "./pages/Login/Login";
import RegisterPage from "./pages/Register/Register";
import VerifyOTPPage from "./pages/VerifyOTP/VerifyOTP";
import UserDashboardLayout from "./pages/UserDashboard/UserDashboardLayout";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import ProtectedRoute from "../ProtectedRoute";
import NoPage from "./pages/NoPage";
import AssessmentsPage from "./pages/UserDashboard/AssessmentsPage";
import UpcomingAssessmentsPage from "./pages/UserDashboard/UpcomingAssessmentsPage";
import ProfilePage from "./pages/UserDashboard/ProfilePage";
import CertificateView from "./pages/CertificateView/CertificateView";
import AdminDashboardLayout from "./pages/AdminDashboard/AdminDashBoardLayout";
import { DashboardContent } from "./components/AdminDashboard/DashboardContent";
import { QuizReportPage } from "./pages/AdminDashboard/QuizReportPage";
import { IssueCertificatePage } from "./pages/AdminDashboard/IssueCertificatePage";
import { UserGroupPrivilegePage } from "./pages/AdminDashboard/UserGroupPrivilegePage";
// import { AddQuestionsPage } from "./pages/AdminDashboard/AddQuestionsPage";
import { SubjectMasterPage } from "./pages/AdminDashboard/SubjectMasterPage";
import AddSubjectPage from "./pages/AdminDashboard/AddSubject";
import { ContractorMasterPage } from "./pages/AdminDashboard/ContractorMasterPage";
import { MyAccountPage } from "./pages/AdminDashboard/AdminDashboardProfile/MyAccountPage";
import { UserLogsPage } from "./pages/AdminDashboard/UserLogsPage";
import { ModifyProfilePage } from "./pages/AdminDashboard/AdminDashboardProfile/ModifyProfilePage";
import { ChangePasswordPage } from "./pages/AdminDashboard/AdminDashboardProfile/ChangePasswordPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage/ForgotPasswordPage";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardContent />} />
            <Route path="quiz-report" element={<QuizReportPage />} />
            <Route
              path="issue-certificate"
              element={<IssueCertificatePage />}
            />
            <Route
              path="user-group-privilege"
              element={<UserGroupPrivilegePage />}
            />
            {/* <Route path="add-questions" element={<AddQuestionsPage/>} /> */}
            <Route path="subject-master" element={<SubjectMasterPage />} />
            <Route
              path="subject-master/add-subject"
              element={<AddSubjectPage />}
            />
            <Route
              path="contractor-master"
              element={<ContractorMasterPage />}
            />
            <Route path="my-account" element={<MyAccountPage />} />
            <Route path="user-logs" element={<UserLogsPage />} />
            <Route path="modify-profile" element={<ModifyProfilePage />} />
            
          </Route>
          <Route
            path="/certificate-view"
            element={
              <ProtectedRoute>
                <CertificateView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="upcoming" element={<UpcomingAssessmentsPage />} />
            <Route path="assessments" element={<AssessmentsPage />} />
          </Route>
          <Route path="*" element={<NoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
