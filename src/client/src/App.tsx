import HomePage from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/organisms/header";
import { UserProvider } from "./contexts/user.context";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ProfilePage from "./pages/profile";
import InvitePage from "./pages/invite";
import ScheduleXPage from "./pages/schedule-x";
import AdminDashboard from "./pages/admin-dashboard";
import { ModalProvider } from "./contexts/modal.context";
import { useUser } from "./contexts/user.context";
import AdminDashboardPreview from "./pages/admin-dashboard-preview";
import About from "./pages/about";

function App() {
  return (
    <UserProvider>
      <ModalProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
            <Route path="/invite/:code/:userId" element={<InvitePage />} />
          </Routes>
        </BrowserRouter>
      </ModalProvider>
    </UserProvider>
  );
}

function ProtectedRoutes() {
  const { user } = useUser();

  if (!user) {
    return <HomePage />;
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/preview" element={<AdminDashboardPreview />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/schedules" element={<ScheduleXPage />} />
    </Routes>
  );
}

export default App;
