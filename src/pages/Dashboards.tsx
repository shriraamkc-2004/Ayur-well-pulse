import { PatientDashboard } from "./dashboards/PatientDashboard";
import { DoctorDashboard } from "./dashboards/DoctorDashboard";
import { DietitianDashboard } from "./dashboards/DietitianDashboard";
import { AdminDashboard } from "./dashboards/AdminDashboard";

const Dashboards = ({ type }: { type: "patient" | "doctor" | "dietitian" | "admin" }) => {
    switch (type) {
        case "patient": return <PatientDashboard />;
        case "doctor": return <DoctorDashboard />;
        case "dietitian": return <DietitianDashboard />;
        case "admin": return <AdminDashboard />;
        default: return <PatientDashboard />;
    }
};

export default Dashboards;
