import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/context/I18nContext";
import { doctorsAPI } from "@/services/api";

export const DoctorVerificationForm = () => {
    const { t } = useI18n();
    const { user } = useAuth();
    const [regNumber, setRegNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);

        try {
            await doctorsAPI.submitVerification({
                registrationNumber: regNumber,
                certificateUrl: "placeholder_url",
                govtIdUrl: "placeholder_url"
            });
            toast.success(t('verif_success'));
            window.location.reload();
        } catch (error: unknown) {
            const axiosErr = error as { response?: { data?: { error?: string } } };
            toast.error(axiosErr.response?.data?.error || t('submission_error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>{t('doctor_verification')}</CardTitle>
                <CardDescription>
                    {t('doctor_verification_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="regNumber">{t('govt_registration_number')}</Label>
                        <Input
                            id="regNumber"
                            type="text"
                            placeholder={t('reg_number_placeholder')}
                            value={regNumber}
                            onChange={(e) => setRegNumber(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('reg_cert_govt_id')}</Label>
                        <p className="text-xs text-muted-foreground italic">{t('file_upload_restriction')}</p>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-sage text-white" disabled={loading}>
                        {loading ? t('submitting') : t('submit_verification')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
