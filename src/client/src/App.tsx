import HomePage from "./pages/home";
import { BrowserRouter, Routes, Route } from "react-router";
import Header from "./components/organisms/header";
import { UserProvider } from "./contexts/user.context";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import ProfilePage from "./pages/profile";
import FamiliesPage from "./pages/families";
import InvitePage from "./pages/invite";

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/singup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/families/:id" element={<FamiliesPage />} />
          <Route path="/invite/:code" element={<InvitePage />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
