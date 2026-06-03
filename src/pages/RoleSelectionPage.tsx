import { useNavigate, useLocation } from "react-router-dom";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { RoleSelection } from "@/components/role-selection";

const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Optionally, we can know if the user came from 'login' or 'get started' via state
  const tab = location.state?.tab || 'signup';

  const handleRoleSelect = (roleId: string) => {
    navigate('/auth', { state: { role: roleId, tab } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <RoleSelection onSelect={handleRoleSelect} />
      </main>
      <Footer />
    </div>
  );
};

export default RoleSelectionPage;
