import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { PatientIntakeForm } from "@/components/PatientIntakeForm";
import { useState, useEffect } from "react";
import { MealLogger } from "@/components/MealLogger";
import { HealthLogForm } from "@/components/HealthLogForm";
import { DietPlanView } from "@/components/DietPlanView";
import { NotificationCenter } from "@/components/NotificationCenter";
import { useI18n } from "@/context/I18nContext";
import { toast } from "sonner";
import { ChatWindow } from "@/components/ChatWindow";
import { TelehealthVideo } from "@/components/TelehealthVideo";
import { patientsAPI, doctorsAPI } from "@/services/api";
import { PatientRecord, DoctorVerification } from "@/types";

export const PatientDashboard = () => {
    const { signOut, user } = useAuth();
    const { t } = useI18n();
    const [record, setRecord] = useState<PatientRecord | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Consultation states
    const [activeTab, setActiveTab] = useState<"journey" | "consult">("journey");
    const [doctors, setDoctors] = useState<DoctorVerification[]>([]);
    const [selectedDoc, setSelectedDoc] = useState<DoctorVerification | null>(null);
    const [isVideoActive, setIsVideoActive] = useState(false);

    useEffect(() => {
        if (user) {
            patientsAPI.getRecord()
                .then(({ data }) => {
                    setRecord(data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Failed to load patient record:", error);
                    setLoading(false);
                });
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === "consult") {
            doctorsAPI.getVerified()
                .then(({ data }) => setDoctors(data))
                .catch(() => toast.error("Failed to load verified doctors."));
        }
    }, [activeTab]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">{t('loading')}...</div>;

    // Compute dosha percentages from actual data
    const dosha = record?.doshaProfile;
    const doshaTotal = dosha ? (dosha.vata + dosha.pitta + dosha.kapha) : 0;
    const vataPct = dosha && doshaTotal > 0 ? Math.round((dosha.vata / doshaTotal) * 100) : 0;
    const pittaPct = dosha && doshaTotal > 0 ? Math.round((dosha.pitta / doshaTotal) * 100) : 0;
    const kaphaPct = dosha && doshaTotal > 0 ? Math.round((dosha.kapha / doshaTotal) * 100) : 0;

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {isVideoActive && selectedDoc && (
                <TelehealthVideo 
                    participantName={selectedDoc.doctorId?.fullName || "Doctor"} 
                    onClose={() => setIsVideoActive(false)} 
                />
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('wellness_dashboard')}</h1>
                    <p className="text-muted-foreground">{t('welcome')}, {user?.fullName}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={signOut}>{t('sign_out')}</Button>
                </div>
            </div>

            {/* Navigation Tabs */}
            {record && (
                <div className="flex gap-2 mb-8 border-b pb-4">
                    <Button 
                        variant={activeTab === "journey" ? "default" : "ghost"}
                        onClick={() => setActiveTab("journey")}
                        className="text-sm font-semibold"
                    >
                        🌿 My Health Journey
                    </Button>
                    <Button 
                        variant={activeTab === "consult" ? "default" : "ghost"}
                        onClick={() => setActiveTab("consult")}
                        className="text-sm font-semibold"
                    >
                        👨‍⚕️ Consult Doctor
                    </Button>
                </div>
            )}

            {!record ? (
                <div className="space-y-8">
                    <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                        <h2 className="text-xl font-semibold mb-2">{t('complete_health_profile')}</h2>
                        <p className="text-muted-foreground mb-4">{t('health_profile_desc')}</p>
                    </div>
                    <PatientIntakeForm />
                </div>
            ) : activeTab === "journey" ? (
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
                            {dosha && doshaTotal > 0 ? (
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{t('vata')}</span><span>{vataPct}%</span>
                                        </div>
                                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                                            <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${vataPct}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{t('pitta')}</span><span>{pittaPct}%</span>
                                        </div>
                                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                                            <div className="bg-orange-400 h-full rounded-full transition-all" style={{ width: `${pittaPct}%` }}></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span>{t('kapha')}</span><span>{kaphaPct}%</span>
                                        </div>
                                        <div className="bg-muted h-2 rounded-full overflow-hidden">
                                            <div className="bg-green-400 h-full rounded-full transition-all" style={{ width: `${kaphaPct}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground mt-2">{t('pending')}</p>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-8 animate-fade-in">
                    {/* Left Panel: Verified Doctors List */}
                    <div className="md:col-span-1 space-y-4">
                        <h2 className="text-xl font-bold mb-2">Verified Doctors</h2>
                        <p className="text-xs text-muted-foreground mb-4">Choose a credential-verified Ayurvedic practitioner below to begin consultation.</p>
                        
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                            {doctors.length === 0 ? (
                                <div className="p-8 border border-dashed rounded-2xl text-center text-muted-foreground text-sm bg-muted/20">
                                    No verified doctors available at the moment.
                                </div>
                            ) : (
                                doctors.map((doc) => (
                                    <div 
                                        key={doc._id}
                                        onClick={() => setSelectedDoc(doc)}
                                        className={`p-4 border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                                            selectedDoc?.doctorId?._id === doc.doctorId?._id 
                                                ? "border-primary bg-primary/5 shadow-sm" 
                                                : "border-muted bg-card hover:border-primary/40"
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-sm text-foreground">{doc.doctorId?.fullName}</h3>
                                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-600 px-2.5 py-0.5 rounded-full">
                                                Verified
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3">{doc.doctorId?.email}</p>
                                        <div className="text-[10px] text-muted-foreground border-t pt-2 mt-2 flex justify-between">
                                            <span>Reg: {doc.registrationNumber}</span>
                                            <span className="text-primary font-semibold">Consult Now →</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Panel: Active Chat & Video Controls */}
                    <div className="md:col-span-2">
                        {selectedDoc ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card border rounded-2xl p-4 shadow-sm gap-3">
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">Consulting {selectedDoc.doctorId?.fullName}</h3>
                                        <p className="text-xs text-muted-foreground">Goverment Registration Certificate Number: {selectedDoc.registrationNumber}</p>
                                    </div>
                                    <Button 
                                        onClick={() => setIsVideoActive(true)}
                                        className="bg-primary text-white hover:bg-primary/95 text-xs font-semibold flex items-center gap-1.5 self-start sm:self-center shrink-0 shadow-md shadow-primary/20"
                                    >
                                        📹 Start Secure Video Call
                                    </Button>
                                </div>
                                
                                <ChatWindow 
                                    receiverId={selectedDoc.doctorId?._id} 
                                    receiverName={selectedDoc.doctorId?.fullName} 
                                />
                            </div>
                        ) : (
                            <div className="h-[450px] border border-dashed rounded-3xl flex flex-col items-center justify-center text-muted-foreground bg-muted/10 p-8 text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl mb-4">
                                    💬
                                </div>
                                <h3 className="font-bold text-base text-foreground mb-1">Select a Doctor</h3>
                                <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                                    Click on any verified Ayurvedic doctor from the directory on the left to start a secure consultation session.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
