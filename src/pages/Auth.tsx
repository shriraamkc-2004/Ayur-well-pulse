import { useState, useMemo } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RoleSelection } from "@/components/role-selection";
import { useI18n } from "@/context/I18nContext";
import { authAPI } from "@/services/api";

// Password requirement checks (must match backend validation)
const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { label: "One special character", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const Auth = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string | null>(location.state?.role || null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">(location.state?.tab || "login");
  const { login } = useAuth();

  // Live password strength checklist
  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ label: rule.label, passed: rule.test(password) })),
    [password]
  );
  const passwordValid = passwordChecks.every((c) => c.passed);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error(t('select_role_error'));
      return;
    }
    if (!passwordValid) {
      toast.error("Please fix the password requirements before submitting.");
      return;
    }
    setLoading(true);

    try {
      const response = await authAPI.signup({ email, password, fullName, role });
      const data = response.data;
      login(data.accessToken, data.user);
      toast.success(t('account_created_success'));
      redirectBasedOnRole(data.user.role);
    } catch (error) {
      const axiosErr = error as AxiosError<{ error?: string; details?: Array<{ msg: string }> }>;
      const responseData = axiosErr?.response?.data;

      if (axiosErr?.response) {
        // Backend responded with an error — show consolidated message
        if (responseData?.details && responseData.details.length > 0) {
          toast.error(responseData.details.map((d) => d.msg).join(" | "));
        } else {
          toast.error(responseData?.error || 'Signup failed. Please try again.');
        }
      } else {
        // Network / backend unreachable — fall back to mock mode for UI testing
        toast.success("Mock account created (Backend disconnected)");
        const userRole = role || 'patient';
        login("mock-token-123", { id: '1', role: userRole, fullName: fullName || 'Test User', email });
        redirectBasedOnRole(userRole);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({ email, password });
      const data = response.data;
      login(data.accessToken, data.user);
      toast.success(t('welcome'));
      redirectBasedOnRole(data.user.role);
    } catch (error) {
      const axiosErr = error as AxiosError<{ error?: string }>;
      const responseData = axiosErr?.response?.data;

      if (axiosErr?.response) {
        // Backend responded with an error — show the actual message
        toast.error(responseData?.error || 'Login failed. Please try again.');
      } else {
        // Network / backend unreachable — fall back to mock mode for UI testing
        toast.success("Mock login successful (Backend disconnected)");
        const userRole = role || 'patient';
        login("mock-token-123", { id: '1', role: userRole, fullName: 'Test User', email });
        redirectBasedOnRole(userRole);
      }
    } finally {
      setLoading(false);
    }
  };

  const redirectBasedOnRole = (userRole: string) => {
    if (userRole === "doctor") navigate("/doctor-dashboard");
    else if (userRole === "dietitian") navigate("/dietitian-dashboard");
    else if (userRole === "admin") navigate("/admin-dashboard");
    else navigate("/dashboard");
  };

  if (!role && activeTab === "signup") {
    return <Navigate to="/role-selection" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{activeTab === "login" ? t('sigin_in_title') : t('sign_up_title')}</CardTitle>
          <CardDescription>
            {activeTab === "login" ? t('welcome_back_slogan') : `${t('join_as')} ${t(role || 'patient')}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(val: string) => setActiveTab(val as "login" | "signup")} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('login')}</TabsTrigger>
              <TabsTrigger value="signup">{t('sign_up')}</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleSignIn} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('email')}</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('password')}</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('signing_in') : t('sigin_in_title')}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t('full_name')}</Label>
                  <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-signup">{t('email')}</Label>
                  <Input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-signup">{t('password')}</Label>
                  <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  {/* Live password strength checklist */}
                  <ul className="space-y-1 mt-2">
                    {passwordChecks.map((check) => (
                      <li
                        key={check.label}
                        className={`text-xs flex items-center gap-1.5 ${
                          check.passed ? "text-green-600" : password ? "text-red-500" : "text-muted-foreground"
                        }`}
                      >
                        <span>{check.passed ? "✓" : "○"}</span>
                        <span>{check.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || (password.length > 0 && !passwordValid)}
                >
                  {loading ? t('creating_account') : t('create_account')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="link" className="text-sm" onClick={() => navigate('/role-selection')}>
            {activeTab === "signup" ? t('change_role') : t('back_to_roles')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
