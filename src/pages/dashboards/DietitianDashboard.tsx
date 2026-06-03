import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useI18n } from "@/context/I18nContext";
import { patientsAPI } from "@/services/api";
import { PatientRecord } from "@/types";

export const DietitianDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        patientsAPI.getAllPatients()
            .then(({ data }) => {
                const list = Array.isArray(data) ? data : (data.patients || []);
                setPatients(list);
            })
            .catch(() => {
                // Silently handle — show empty state
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading')}...</div>;

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
                    <p className="text-3xl font-bold">{patients.length}</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-secondary-foreground">{t('plans_sent')}</h3>
                    <p className="text-3xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires backend integration</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-accent-foreground">{t('adherence_rate')}</h3>
                    <p className="text-3xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires backend integration</p>
                </div>
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="font-bold mb-2 text-muted-foreground">{t('pending_reviews')}</h3>
                    <p className="text-3xl font-bold">—</p>
                    <p className="text-xs text-muted-foreground mt-1">Requires backend integration</p>
                </div>
            </div>

            <div className="mt-8 grid lg:grid-cols-2 gap-8">
                <div className="p-6 bg-card border rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold mb-4">{t('client_monitoring')}</h3>
                    <div className="space-y-4">
                        {patients.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic text-center py-8">{t('no_recent_logs')}</p>
                        ) : (
                            patients.map((patient) => (
                                <div key={patient._id} className="flex items-center justify-between p-3 border-b last:border-0">
                                    <div>
                                        <span className="font-medium">{patient.patientId?.fullName || "Anonymous"}</span>
                                        <p className="text-xs text-muted-foreground">{patient.patientId?.email}</p>
                                    </div>
                                    <Button variant="ghost" size="sm">{t('view_plan')}</Button>
                                </div>
                            ))
                        )}
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
