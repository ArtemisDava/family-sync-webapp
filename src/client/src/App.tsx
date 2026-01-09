import HomePage from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/organisms/header";
import { UserProvider } from "./contexts/user.context";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ProfilePage from "./pages/profile";
import FamiliesPage from "./pages/families";
import InvitePage from "./pages/invite";
import CreateAChildPage from "./pages/add-child";
import ChildPage from "./pages/child";
import SchedulePage from "./pages/schedule";
import ScheduleXPage from "./pages/schedule-x";
import AdminDashboard from "./pages/admin-dashboard";
import { ModalProvider } from "./contexts/modal.context";
import { useUser } from "./contexts/user.context";

function App() {
  return (
    <UserProvider>
      <ModalProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/singup" element={<SignupPage />} />
            <Route path="/*" element={<ProtectedRoutes />} />
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
      <Route path="/admin/preview" element={<AdminDashboard />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/schedules" element={<ScheduleXPage />} />
      <Route path="/families/:id" element={<FamiliesPage />} />
      <Route path="/child/:id" element={<ChildPage />} />
      <Route path="/families/:id/add-child" element={<CreateAChildPage />} />
      <Route path="/invite/:code" element={<InvitePage />} />
    </Routes>
  );
}

export default App;
