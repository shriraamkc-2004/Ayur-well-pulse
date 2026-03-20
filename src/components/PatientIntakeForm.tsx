import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/I18nContext";

export const PatientIntakeForm = () => {
    const { user } = useAuth();
    const { t } = useI18n();
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [lifestyle, setLifestyle] = useState("");
    const [allergies, setAllergies] = useState("");
    const [conditions, setConditions] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            const response = await fetch("/api/patients/record", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    dateOfBirth: dob,
                    gender: gender,
                    lifestyleNotes: lifestyle,
                    allergies: allergies.split(",").map(s => s.trim()),
                    conditions: conditions.split(",").map(s => s.trim()),
                }),
            });

            const data = await response.json();
            if (response.ok) {
                toast.success(t('profile_updated'));
                window.location.reload();
            } else {
                toast.error(data.error || t('update_failed'));
            }
        } catch (error: any) {
            toast.error(t('submission_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>{t('health_intake_form')}</CardTitle>
                <CardDescription>
                    {t('health_intake_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dob">{t('dob')}</Label>
                            <Input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gender">{t('gender')}</Label>
                            <Input id="gender" type="text" placeholder={t('gender_placeholder')} value={gender} onChange={(e) => setGender(e.target.value)} required />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="allergies">{t('allergies')}</Label>
                        <Input id="allergies" type="text" placeholder={t('allergies_placeholder')} value={allergies} onChange={(e) => setAllergies(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="conditions">{t('conditions')}</Label>
                        <Input id="conditions" type="text" placeholder={t('conditions_placeholder')} value={conditions} onChange={(e) => setConditions(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lifestyle">{t('lifestyle_diet_notes')}</Label>
                        <Textarea
                            id="lifestyle"
                            placeholder={t('lifestyle_placeholder')}
                            value={lifestyle}
                            onChange={(e) => setLifestyle(e.target.value)}
                            className="min-h-[100px]"
                        />
                    </div>
                    <Button type="submit" className="w-full bg-primary text-white" disabled={loading}>
                        {loading ? t('saving') : t('save_health_profile')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
