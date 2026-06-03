import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { DoctorVerificationForm } from "@/components/DoctorVerificationForm";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";
import { ChatWindow } from "@/components/ChatWindow";
import { TelehealthVideo } from "@/components/TelehealthVideo";
import { doctorsAPI, patientsAPI } from "@/services/api";
import { DoctorVerification, PatientRecord } from "@/types";

export const DoctorDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [verification, setVerification] = useState<DoctorVerification | null>(null);
    const [loading, setLoading] = useState(true);

    // Consultation states
    const [patients, setPatients] = useState<PatientRecord[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);

    useEffect(() => {
        if (user) {
            doctorsAPI.getStatus()
                .then(({ data }) => {
                    setVerification(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Failed to load doctor status:", error);
                    setLoading(false);
                });
        }
    }, [user]);

    useEffect(() => {
        if (verification && verification.verificationStatus === "verified") {
            patientsAPI.getAllPatients()
                .then(({ data }) => {
                    const list = Array.isArray(data) ? data : (data.patients || []);
                    setPatients(list);
                })
                .catch(() => toast.error("Failed to load patients."));
        }
    }, [verification]);

    if (loading) return <div className="p-8">{t('loading')}...</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {isVideoActive && selectedPatient && (
                <TelehealthVideo 
                    participantName={selectedPatient.patientId?.fullName || "Patient"} 
                    onClose={() => setIsVideoActive(false)} 
                />
            )}

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
                <div className="space-y-8 animate-fade-in">
                    {/* Verified banner */}
                    <div className="bg-gradient-sage p-6 rounded-3xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-sage/10">
                        <div>
                            <h2 className="text-2xl font-bold">{t('welcome_dr')} {user?.fullName}</h2>
                            <p className="opacity-90 mt-1">{t('verified_ayurvedic_doctor')}</p>
                        </div>
                        <div className="bg-white/20 border border-white/10 px-4 py-2 rounded-2xl text-sm font-semibold self-start sm:self-center shrink-0">
                            Status: Verified ✅
                        </div>
                    </div>

                    {/* Main workspace */}
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Left column: Patients directory */}
                        <div className="md:col-span-1 space-y-4">
                            <h3 className="text-lg font-bold text-foreground">Active Patients</h3>
                            <p className="text-xs text-muted-foreground mb-4">View your assigned patients and start medical consultations.</p>
                            
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {patients.length === 0 ? (
                                    <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground text-sm bg-muted/20">
                                        No active patients in clinic record.
                                    </div>
                                ) : (
                                    patients.map((rec) => (
                                        <div 
                                            key={rec._id}
                                            onClick={() => setSelectedPatient(rec)}
                                            className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                                                selectedPatient?.patientId?._id === rec.patientId?._id 
                                                    ? "border-primary bg-primary/5 shadow-sm" 
                                                    : "border-muted bg-card hover:border-primary/40"
                                            }`}
                                        >
                                            <h4 className="font-bold text-sm text-foreground">{rec.patientId?.fullName || "Anonymous Patient"}</h4>
                                            <p className="text-xs text-muted-foreground mb-3">{rec.patientId?.email}</p>
                                            
                                            <div className="text-[10px] text-muted-foreground bg-muted/50 p-2.5 rounded-xl space-y-1">
                                                <div><span className="font-semibold">Gender:</span> {rec.gender}</div>
                                                <div><span className="font-semibold">Allergies:</span> {rec.allergies?.join(", ") || "None"}</div>
                                                <div><span className="font-semibold">Conditions:</span> {rec.conditions?.join(", ") || "None"}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Right column: Workspace chat/video */}
                        <div className="md:col-span-2">
                            {selectedPatient ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border rounded-2xl p-4 shadow-sm gap-3">
                                        <div>
                                            <h3 className="font-bold text-base text-foreground">Consulting Patient: {selectedPatient.patientId?.fullName}</h3>
                                            <p className="text-xs text-muted-foreground">Encrypted HIPAA compliant telehealth workspace</p>
                                        </div>
                                        <Button 
                                            onClick={() => setIsVideoActive(true)}
                                            className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-md shadow-primary/20"
                                        >
                                            📹 Start Secure Video Call
                                        </Button>
                                    </div>
                                    
                                    <ChatWindow 
                                        receiverId={selectedPatient.patientId?._id} 
                                        receiverName={selectedPatient.patientId?.fullName} 
                                    />
                                </div>
                            ) : (
                                <div className="h-[450px] border border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-8 text-center">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                                        🏥
                                    </div>
                                    <h3 className="font-bold text-base text-foreground mb-1">Select a Patient</h3>
                                    <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                        Select an active patient from the clinic list on the left to consult their health metrics, initiate message exchange, and conduct telehealth visits.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
