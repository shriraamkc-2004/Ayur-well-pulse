import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PatientIntakeForm } from "@/components/PatientIntakeForm";
import { useState, useEffect } from "react";
import { DoctorVerificationForm } from "@/components/DoctorVerificationForm";
import { MealLogger } from "@/components/MealLogger";
import { HealthLogForm } from "@/components/HealthLogForm";
import { DietPlanView } from "@/components/DietPlanView";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useI18n } from "@/context/I18nContext";
import { Globe } from "lucide-react";
import { toast } from "sonner";

export const PatientDashboard = () => {
    const { signOut, user } = useAuth();
    const { t, lang, setLang } = useI18n();
    const [record, setRecord] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch("/api/patients/record", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            })
                .then(res => res.json())
                .then(data => {
                    setRecord(data);
                    setLoading(false);
                });
        }
    }, [user]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading')}...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('wellness_dashboard')}</h1>
                    <p className="text-muted-foreground">{t('welcome')}, {user?.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={signOut}>{t('sign_out')}</Button>
                </div>
            </div>

            {!record ? (
                <div className="space-y-8">
                    <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                        <h2 className="text-xl font-semibold mb-2">{t('complete_health_profile')}</h2>
                        <p className="text-muted-foreground mb-4">{t('health_profile_desc')}</p>
                    </div>
                    <PatientIntakeForm />
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <DietPlanView />

                        <div className="grid md:grid-cols-2 gap-6">
                            <MealLogger />
                            <HealthLogForm />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <NotificationCenter />

                        <div className="p-6 bg-card border rounded-lg shadow-sm">
                            <h3 className="font-bold mb-2">{t('your_dosha_profile')}</h3>
                            <div className="mt-4 space-y-2">
                                <div className="flex justify-between text-sm"><span>{t('vata')}</span><span>{record.doshaProfile ? "30%" : t('pending')}</span></div>
                                <div className="bg-muted h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-400 h-full w-0"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DoctorDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [verification, setVerification] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetch("/api/doctors/status", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            })
                .then(res => res.json())
                .then(data => {
                    setVerification(data);
                    setLoading(false);
                });
        }
    }, [user]);

    if (loading) return <div className="p-8">{t('loading')}...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">{t('doctor_dashboard')}</h1>
                <Button variant="outline" onClick={signOut}>{t('sign_out')}</Button>
            </div>

            {!verification ? (
                <DoctorVerificationForm />
            ) : verification.verificationStatus === "pending" ? (
                <div className="bg-muted p-6 rounded-lg text-center">
                    <h2 className="text-xl font-semibold mb-2">{t('verification_pending')}</h2>
                    <p className="text-muted-foreground">{t('verification_desc')}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="bg-gradient-sage p-6 rounded-lg text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold">{t('welcome_dr')} {user?.fullName}</h2>
                            <p className="opacity-90">{t('verified_ayurvedic_doctor')}</p>
                        </div>
                        <div className="flex gap-4">
                            <Button onClick={() => toast.info(t('init_consultation'))} className="bg-white text-sage hover:bg-white/90 font-bold">
                                {t('start_consultation')} 📹
                            </Button>
                            <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium">
                                {t('verified_status')}: ✅
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const DietitianDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('dietitian_dashboard')}</h1>
                    <p className="text-muted-foreground">{t('welcome')}, {user?.fullName}</p>
                </div>
                <Button variant="outline" onClick={signOut}>{t('sign_out')}</Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-primary">{t('active_clients')}</h3>
                    <p className="text-3xl font-bold">12</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-secondary-foreground">{t('plans_sent')}</h3>
                    <p className="text-3xl font-bold">45</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-accent-foreground">{t('adherence_rate')}</h3>
                    <p className="text-3xl font-bold">82%</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-muted-foreground">{t('pending_reviews')}</h3>
                    <p className="text-3xl font-bold">3</p>
                </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-8">
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('client_monitoring')}</h3>
                    <div className="space-y-4">
                        {["Rahul S.", "Priya M.", "Amit K."].map((client) => (
                            <div key={client} className="flex items-center justify-between p-3 border-b last:border-0">
                                <span>{client}</span>
                                <Button variant="ghost" size="sm">{t('view_plan')}</Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('recent_health_logs')}</h3>
                    <p className="text-sm text-muted-foreground italic text-center py-8">{t('no_recent_logs')}</p>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [stats, setStats] = useState<any>(null);
    const [verifications, setVerifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    const fetchData = async () => {
        try {
            const [statsRes, verifRes] = await Promise.all([
                fetch("/api/admin/dashboard", { headers }),
                fetch("/api/admin/verifications", { headers })
            ]);
            setStats(await statsRes.json());
            setVerifications(await verifRes.json());
        } catch {
            toast.error(t('failed_load_admin'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleVerification = async (id: string, action: "approve" | "reject") => {
        try {
            await fetch(`/api/admin/verifications/${id}/${action}`, { method: "PUT", headers });
            toast.success(t('doctor_action_success'));
            fetchData();
        } catch {
            toast.error(t('action_failed'));
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading_admin_panel')}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('clinic_admin')}</h1>
                    <p className="text-muted-foreground">{t('system_overview')} — {t('logged_in_as')} {user?.fullName}</p>
                </div>
                <Button variant="outline" onClick={signOut}>{t('sign_out')}</Button>
            </div>

            <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('total_users')}</h3>
                        <p className="text-4xl">{stats?.totalUsers ?? "—"}</p>
                    </div>
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('verified_doctors')}</h3>
                        <p className="text-4xl">{stats?.verifiedDoctors ?? "—"}</p>
                    </div>
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('pending_verifications')}</h3>
                        <p className="text-4xl text-primary font-bold">{stats?.pendingVerifications ?? "—"}</p>
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('verification_queue')}</h3>
                    {verifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">{t('no_pending_verifications')}</p>
                    ) : (
                        <div className="space-y-3">
                            {verifications.map((v: any) => (
                                <div key={v._id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                    <div>
                                        <p className="font-semibold">{v.doctorId?.fullName || t('unknown')}</p>
                                        <p className="text-sm text-muted-foreground">{v.doctorId?.email} — {t('reg_num')} {v.registrationNumber}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleVerification(v._id, "approve")}>✅ {t('approve')}</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleVerification(v._id, "reject")}>❌ {t('reject')}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('recent_audit_log')}</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(stats?.recentAuditLogs || []).map((log: any) => (
                            <div key={log._id} className="flex items-center gap-3 text-sm p-2 border-b">
                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary">{log.action}</span>
                                <span className="text-muted-foreground">{log.resourceType}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-2">{t('blockchain_ledger')}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('blockchain_desc')}</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                        {(stats?.recentBlockchainEntries || []).map((entry: any) => (
                            <div key={entry._id} className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                                <span className="text-primary">{entry.resourceType}</span>
                                <span className="truncate text-muted-foreground">{entry.dataHash}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md text-destructive flex items-center gap-3">
                    <span className="font-bold">SYSTEM:</span> {t('system_notice')}
                </div>
            </div>
        </div>
    );
};

