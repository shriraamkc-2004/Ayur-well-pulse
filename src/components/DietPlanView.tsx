import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Calendar, RefreshCw, ChevronRight } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { dietPlansAPI } from "@/services/api";

interface DayPlan {
    day: string;
    breakfast?: { _id: string; name: string };
    lunch?: { _id: string; name: string };
    dinner?: { _id: string; name: string };
    snacks?: { _id: string; name: string }[];
}

interface DietPlan {
    title: string;
    theme: string;
    ayurvedicAdvice: string;
    weeklyPlan: DayPlan[];
}

export const DietPlanView = () => {
    const { t } = useI18n();
    const [plan, setPlan] = useState<DietPlan | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPlan = async () => {
        try {
            const { data } = await dietPlansAPI.getCurrentPlan();
            setPlan(data as DietPlan);
        } catch (error: unknown) {
            console.error("Failed to fetch diet plan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, []);

    const handleGeneratePlan = async () => {
        setLoading(true);
        try {
            const { data } = await dietPlansAPI.generatePlan();
            setPlan(data as DietPlan);
            toast.success(t('new_plan_generated'));
        } catch (error: unknown) {
            toast.error(t('failed_generate_plan'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-4 text-center">{t('loading_plan')}</div>;

    return (
        <Card className="border-sage/20 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-sage text-white pb-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        <CardTitle>{plan ? plan.title : t('no_plan')}</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={handleGeneratePlan}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        {t('new_plan')}
                    </Button>
                </div>
                <CardDescription className="text-white/80 mt-1">
                    {plan ? plan.theme : t('complete_profile_plan')}
                </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
                {plan ? (
                    <div className="space-y-6">
                        <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                            <p className="text-sm italic text-primary font-medium">✨ {t('pro_tip')}: {plan.ayurvedicAdvice}</p>
                        </div>

                        <div className="grid gap-4">
                            {plan.weeklyPlan.map((dayPlan: DayPlan) => (
                                <div key={dayPlan.day} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                            {dayPlan.day.substring(0, 3)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{dayPlan.day}{t('theme_suffix')}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {t('lunch')}: <span className="text-foreground">{dayPlan.lunch?.name || t('pending')}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">{t('no_active_plan_desc')}</p>
                        <Button onClick={handleGeneratePlan} variant="hero">{t('gen_first_plan_btn')}</Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
