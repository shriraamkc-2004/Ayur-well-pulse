import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";
import { adminAPI } from "@/services/api";
import { AdminStats, DoctorVerification } from "@/types";

export const AdminDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [verifications, setVerifications] = useState<DoctorVerification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, verifRes] = await Promise.all([
                adminAPI.getDashboard(),
                adminAPI.getVerifications()
            ]);
            setStats(statsRes.data);
            setVerifications(verifRes.data);
        } catch {
            toast.error(t('failed_load_admin') || "Failed to load admin panel data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { 
        fetchData(); 
    }, []);

    const handleVerification = async (id: string, action: "approve" | "reject") => {
        try {
            await adminAPI.handleVerification(id, action);
            toast.success(t('doctor_action_success') || "Doctor verification processed successfully");
            fetchData();
        } catch {
            toast.error(t('action_failed') || "Action failed");
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading_admin_panel') || "Loading Admin Panel..."}</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('clinic_admin') || "Clinic Administration"}</h1>
                    <p className="text-muted-foreground">{t('system_overview') || "System Overview"} — {t('logged_in_as') || "Logged in as"} {user?.fullName}</p>
                </div>
                <Button variant="outline" onClick={signOut}>{t('sign_out') || "Sign Out"}</Button>
            </div>

            <div className="space-y-8">
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('total_users') || "Total Registered Users"}</h3>
                        <p className="text-4xl">{stats?.totalUsers ?? "—"}</p>
                    </div>
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('verified_doctors') || "Verified Doctors"}</h3>
                        <p className="text-4xl">{stats?.verifiedDoctors ?? "—"}</p>
                    </div>
                    <div className="p-6 bg-muted/50 border rounded-lg">
                        <h3 className="font-bold mb-2">{t('pending_verifications') || "Pending Verifications"}</h3>
                        <p className="text-4xl text-primary font-bold">{stats?.pendingVerifications ?? "—"}</p>
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('verification_queue') || "Doctor Verification Queue"}</h3>
                    {verifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">{t('no_pending_verifications') || "No pending doctor verifications."}</p>
                    ) : (
                        <div className="space-y-3">
                            {verifications.map((v) => (
                                <div key={v._id} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                                    <div>
                                        <p className="font-semibold">{v.doctorId?.fullName || t('unknown')}</p>
                                        <p className="text-sm text-muted-foreground">{v.doctorId?.email} — {t('reg_num') || "Registration ID"}: {v.registrationNumber}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => handleVerification(v._id, "approve")}>✅ {t('approve') || "Approve"}</Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleVerification(v._id, "reject")}>❌ {t('reject') || "Reject"}</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('recent_audit_log') || "System Audit Log"}</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {(stats?.recentAuditLogs || []).map((log) => (
                            <div key={log._id} className="flex items-center gap-3 text-sm p-2 border-b">
                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded text-primary">{log.action}</span>
                                <span className="text-muted-foreground">{log.resourceType}</span>
                                <span className="ml-auto text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-2">{t('blockchain_ledger') || "Auditable Blockchain Ledger"}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{t('blockchain_desc') || "Verified tamper-proof ledger entries for compliance auditing."}</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
                        {(stats?.recentBlockchainEntries || []).map((entry) => (
                            <div key={entry._id} className="flex items-center gap-2 p-2 border rounded bg-muted/30">
                                <span className="text-primary">{entry.resourceType}</span>
                                <span className="truncate text-muted-foreground">{entry.dataHash}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-md text-destructive flex items-center gap-3">
                    <span className="font-bold">SYSTEM:</span> {t('system_notice') || "All admin actions are cryptographically signed and logged for safety compliance."}
                </div>
            </div>
        </div>
    );
};
