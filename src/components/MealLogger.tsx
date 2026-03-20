import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Utensils, Sparkles, Plus } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export const MealLogger = () => {
    const { t } = useI18n();
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(false);
    const [detectedFoods, setDetectedFoods] = useState<any[]>([]);
    const [suggestedPortion, setSuggestedPortion] = useState("1 bowl");

    const handleAiParse = async () => {
        if (!text) return;
        setLoading(true);
        try {
            const response = await fetch("/api/logs/ai-parse", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ text }),
            });
            const data = await response.json();
            setDetectedFoods(data.detectedFoods);
            if (data.detectedFoods.length > 0) {
                toast.success(data.suggestion);
            } else {
                toast.info(data.suggestion);
            }
        } catch (error) {
            toast.error(t('ai_assistant_unavailable'));
        } finally {
            setLoading(false);
        }
    };

    const handleLogMeal = async (food: any) => {
        try {
            const response = await fetch("/api/logs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    meals: [{
                        foodId: food._id,
                        foodName: food.name,
                        portion: suggestedPortion,
                        time: 'lunch', // Simplified
                        nutrients: food.nutrients
                    }]
                }),
            });
            if (response.ok) {
                toast.success(`${t('logged_food')} ${food.name}!`);
                setDetectedFoods([]);
                setText("");
            }
        } catch (error) {
            toast.error(t('meal_log_failed'));
        }
    };

    return (
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t('meal_log')}</CardTitle>
                </div>
                <CardDescription>
                    {t('meal_log_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Textarea
                        placeholder={t('meal_placeholder')}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="bg-white border-primary/20 min-h-[100px]"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2 border-primary/40 text-primary" onClick={handleAiParse} disabled={loading}>
                        <Sparkles className="h-4 w-4" /> {loading ? t('analyzing') : t('ai_analyze')}
                    </Button>
                    <Button variant="outline" className="flex-1 gap-2 border-primary/40 text-primary">
                        <Plus className="h-4 w-4" /> {t('photo_log')}
                    </Button>
                </div>

                {detectedFoods.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-primary/10">
                        <p className="text-sm font-semibold text-primary">{t('detected_items')}</p>
                        <div className="space-y-2">
                            {detectedFoods.map((food) => (
                                <div key={food._id} className="bg-white p-3 rounded-lg border border-primary/10 flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm">{food.name}</p>
                                        <p className="text-xs text-muted-foreground italic">Virya: {food.ayurvedicAttributes.virya} | Vipaka: {food.ayurvedicAttributes.vipaka}</p>
                                    </div>
                                    <Button size="sm" onClick={() => handleLogMeal(food)} className="bg-primary text-white">{t('log_btn')}</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
