import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { RoleSelection } from "@/components/role-selection";
import { useI18n } from "@/context/I18nContext";

const Auth = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error(t('select_role_error'));
      return;
    }
    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName, role }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        toast.success(t('account_created_success'));
        redirectBasedOnRole(data.user.role);
      } else {
        toast.error(data.error || t('signup_failed'));
      }
    } catch (error) {
      toast.error(t('error_occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        login(data.token, data.user);
        toast.success(t('welcome'));
        redirectBasedOnRole(data.user.role);
      } else {
        toast.error(data.error || t('login_failed'));
      }
    } catch (error) {
      toast.error(t('error_occurred'));
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
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <RoleSelection onSelect={(id) => setRole(id)} />
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">{t('already_have_account')}</p>
          <Button variant="outline" onClick={() => setActiveTab("login")}>{t('sign_in_instead')}</Button>
        </div>
      </div>
    );
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
          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
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
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('creating_account') : t('create_account')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button variant="link" className="text-sm" onClick={() => { setRole(null); setActiveTab("login"); setEmail(""); setPassword(""); }}>
            {activeTab === "signup" ? t('change_role') : t('back_to_roles')}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
