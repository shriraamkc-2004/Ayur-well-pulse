import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useI18n } from "@/context/I18nContext";

export const HealthLogForm = () => {
    const { t } = useI18n();
    const [energy, setEnergy] = useState([7]);
    const [mood, setMood] = useState("Balanced");
    const [symptoms, setSymptoms] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
                },
                body: JSON.stringify({
                    energyLevel: energy[0],
                    mood,
                    symptoms: symptoms.split(",").map(s => s.trim()),
                    digestion: "Normal" // Simplified
                }),
            });
            if (response.ok) {
                toast.success(t('health_log_saved'));
                setSymptoms("");
            }
        } catch (error) {
            toast.error(t('health_log_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-earth/20 bg-earth/5">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg">{t('vitals_mood')}</CardTitle>
                <CardDescription>{t('feeling_today')}</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <Zap className="h-4 w-4 text-primary" /> {t('energy_level')} ({energy[0]}/10)
                            </Label>
                            <Slider
                                value={energy}
                                onValueChange={setEnergy}
                                max={10}
                                step={1}
                                className="py-4"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('mood')}</Label>
                                <Input value={mood} onChange={(e) => setMood(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('symptoms')}</Label>
                                <Input
                                    placeholder={t('symptoms_placeholder')}
                                    value={symptoms}
                                    onChange={(e) => setSymptoms(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <Button type="submit" className="w-full bg-gradient-earth text-white" disabled={loading}>
                        {t('save_log')}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
