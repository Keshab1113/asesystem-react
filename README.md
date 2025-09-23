# asesystem-react

├── .gitignore
├── README.md
├── client
    ├── .gitignore
    ├── ProtectedRoute.jsx
    ├── README.md
    ├── components.json
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── public
    │   ├── Images
    │   │   ├── alert.mp3
    │   │   ├── fevi.webp
    │   │   ├── logo-dark-removebg-preview.webp
    │   │   ├── logo-dark.webp
    │   │   ├── logo-removebg-preview.webp
    │   │   ├── logo.webp
    │   │   └── page_not_found.svg
    │   ├── translations.js
    │   └── vite.svg
    ├── src
    │   ├── App.css
    │   ├── App.jsx
    │   ├── assets
    │   │   └── react.svg
    │   ├── components
    │   │   ├── AdminDashboard
    │   │   │   ├── AdminHeader.jsx
    │   │   │   ├── AdminSidebar.jsx
    │   │   │   ├── AdvancedSearchFilters.jsx
    │   │   │   ├── AlertDialog.jsx
    │   │   │   ├── AssignQuizModal.jsx
    │   │   │   ├── BulkActionsToolbar.jsx
    │   │   │   ├── ConfirmationDialog.jsx
    │   │   │   ├── DashboardContent.jsx
    │   │   │   ├── EditQuestionModal.jsx
    │   │   │   ├── QuizDetailsModal.jsx
    │   │   │   ├── QuizFormModal.jsx
    │   │   │   └── ViewQuestionsModal.jsx
    │   │   ├── ProfilePicture
    │   │   │   └── ProfilePicture.jsx
    │   │   ├── SearchableSelect.jsx
    │   │   ├── ToggleTheme.jsx
    │   │   ├── UserDashboard
    │   │   │   ├── DashboardNav.jsx
    │   │   │   └── NavItems.jsx
    │   │   └── ui
    │   │   │   ├── alert-dialog.tsx
    │   │   │   ├── alert.tsx
    │   │   │   ├── avatar.tsx
    │   │   │   ├── badge.tsx
    │   │   │   ├── button.tsx
    │   │   │   ├── calendar.tsx
    │   │   │   ├── card.tsx
    │   │   │   ├── checkbox.tsx
    │   │   │   ├── collapsible.tsx
    │   │   │   ├── command.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── label.tsx
    │   │   │   ├── popover.tsx
    │   │   │   ├── progress.tsx
    │   │   │   ├── radio-group.tsx
    │   │   │   ├── scroll-area.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── separator.tsx
    │   │   │   ├── sheet.tsx
    │   │   │   ├── slider.tsx
    │   │   │   ├── switch.tsx
    │   │   │   ├── table.tsx
    │   │   │   ├── tabs.tsx
    │   │   │   └── textarea.tsx
    │   ├── hooks
    │   │   ├── ToastContext.tsx
    │   │   └── use-debounced-value.js
    │   ├── index.css
    │   ├── layout.jsx
    │   ├── lib
    │   │   ├── checkTokenExpiry.jsx
    │   │   ├── language-context.tsx
    │   │   └── utils.ts
    │   ├── main.jsx
    │   ├── pages
    │   │   ├── AdminDashboard
    │   │   │   ├── AddQuestionsPage.jsx
    │   │   │   ├── AddSubject.jsx
    │   │   │   ├── AdminDashBoardLayout.jsx
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminDashboardProfile
    │   │   │   │   ├── ChangePasswordPage.jsx
    │   │   │   │   ├── ModifyProfilePage.jsx
    │   │   │   │   └── MyAccountPage.jsx
    │   │   │   ├── ContractorMasterPage.jsx
    │   │   │   ├── IssueCertificatePage.jsx
    │   │   │   ├── QuizReportDetailsPage.jsx
    │   │   │   ├── QuizReportPage.jsx
    │   │   │   ├── SubjectMasterPage.jsx
    │   │   │   ├── UserGroupPrivilegePage.jsx
    │   │   │   └── UserLogsPage.jsx
    │   │   ├── CertificateView
    │   │   │   └── CertificateView.jsx
    │   │   ├── ForgotPasswordPage
    │   │   │   └── ForgotPasswordPage.jsx
    │   │   ├── Home
    │   │   │   └── Home.jsx
    │   │   ├── Login
    │   │   │   └── Login.jsx
    │   │   ├── NoPage.jsx
    │   │   ├── Register
    │   │   │   └── Register.jsx
    │   │   ├── UserDashboard
    │   │   │   ├── AssessmentsPage.jsx
    │   │   │   ├── ProfilePage.jsx
    │   │   │   ├── QuestionsPage.jsx
    │   │   │   ├── ResultsPage.jsx
    │   │   │   ├── UpcomingAssessmentsPage.jsx
    │   │   │   ├── UserDashboard.jsx
    │   │   │   └── UserDashboardLayout.jsx
    │   │   └── VerifyOTP
    │   │   │   └── VerifyOTP.jsx
    │   └── redux
    │   │   ├── slices
    │   │       ├── authSlice.js
    │   │       ├── quizSlice.js
    │   │       └── userSlice.js
    │   │   └── store.js
    ├── tsconfig.json
    ├── vercel.json
    └── vite.config.js
└── server
    ├── config
        ├── database.js
        └── uploadToFTP.js
    ├── controllers
        ├── aiQuestionsController.js
        ├── authController.js
        ├── certificateController.js
        ├── companyController.js
        ├── contractorController.js
        ├── fileController.js
        ├── quizAssignmentsController.js
        ├── quizController.js
        └── resultController.js
    ├── middleware
        └── authMiddleware.js
    ├── package-lock.json
    ├── package.json
    ├── routes
        ├── aiQuestionsRoutes.js
        ├── auth.js
        ├── certificateRoutes.js
        ├── companyRoutes.js
        ├── contractorRoutes.js
        ├── fileRoutes.js
        ├── quizAssignmentsRoutes.js
        ├── quizRoutes.js
        └── resultRoutes.js
    ├── server.js
    ├── templates
        └── certificate-template.png
    └── utils
        ├── ftpUploader.js
        ├── mailer.js
        └── textExtractor.js
