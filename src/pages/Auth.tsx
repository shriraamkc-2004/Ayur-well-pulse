import { useState, useMemo } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { AxiosError } from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { RoleSelection } from "@/components/role-selection";
import { useI18n } from "@/context/I18nContext";
import { authAPI } from "@/services/api";

// Password requirement checks (must match backend validation)
const PASSWORD_RULES = [
  { label: "At least 6 characters", test: (p: string) => p.length >= 6 },
];

// Separate component so useGoogleLogin hook only runs when GoogleOAuthProvider is present
const GoogleLoginButton = ({ role, redirectBasedOnRole }: { role: string | null; redirectBasedOnRole: (r: string) => void }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      const response = await authAPI.googleLogin(accessToken, role || 'patient');
      const data = response.data;
      login(data.accessToken, data.user);
      toast.success(`Welcome, ${data.user.fullName}!`);
      redirectBasedOnRole(data.user.role);
    } catch (error) {
      const axiosErr = error as AxiosError<{ error?: string }>;
      toast.error(axiosErr?.response?.data?.error || 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleLogin(tokenResponse.access_token),
    onError: () => toast.error('Google login was cancelled or failed.'),
  });

  return (
    <>
      <div className="relative my-4 flex items-center">
        <Separator className="flex-1" />
        <span className="mx-3 text-xs text-muted-foreground">or</span>
        <Separator className="flex-1" />
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={loading}
        onClick={() => googleLogin()}
      >
        <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Continue with Google
      </Button>
    </>
  );
};

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
              <GoogleLoginButton role={role} redirectBasedOnRole={redirectBasedOnRole} />
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
              <GoogleLoginButton role={role} redirectBasedOnRole={redirectBasedOnRole} />
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
