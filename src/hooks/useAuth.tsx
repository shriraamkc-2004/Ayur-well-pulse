import { useEffect, useState, createContext, useContext } from "react";
import { authAPI } from "../services/api";
import api from "../services/api";
import { toast } from "sonner";

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    role: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const savedUser = localStorage.getItem("user");
            const token = localStorage.getItem("accessToken");

            if (!savedUser || !token) {
                setLoading(false);
                return;
            }

            try {
                const parsedUser = JSON.parse(savedUser);
                // Optimistically set user so UI doesn't flash
                setUser(parsedUser);
                setRole(parsedUser.role);

                // Validate session by calling the refresh endpoint with the token
                // The API interceptor will auto-refresh if token is expired
                await api.post('/auth/refresh');
            } catch {
                // Session invalid — clean up
                console.warn("Session validation failed, clearing auth");
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                setUser(null);
                setRole(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        setRole(userData.role);
    };

    const signOut = async () => {
        try {
            await authAPI.logout();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setUser(null);
            setRole(null);
            toast.success("Logged out successfully");
        }
    };

    return (
        <AuthContext.Provider value={{ user, role, loading, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
