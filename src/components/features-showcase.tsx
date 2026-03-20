import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import doshaImage from "@/assets/dosha-symbols.jpg";
import { useI18n } from "@/context/I18nContext";
import {
  Brain,
  Shield,
  Smartphone,
  Globe,
  Zap,
  Heart,
  TrendingUp,
  Award,
  Video
} from "lucide-react";

export const FeaturesShowcase = () => {
  const { t } = useI18n();

  const features = [
    {
      category: t('ai_intelligence'),
      icon: Brain,
      gradient: "bg-gradient-sunset",
      items: [
        t('feature_ai_1'),
        t('feature_ai_2'),
        t('feature_ai_3'),
        t('feature_ai_4')
      ]
    },
    {
      category: t('security_compliance'),
      icon: Shield,
      gradient: "bg-gradient-earth",
      items: [
        t('feature_sec_1'),
        t('feature_sec_2'),
        t('feature_sec_3'),
        t('feature_sec_4')
      ]
    },
    {
      category: t('mobile_experience'),
      icon: Smartphone,
      gradient: "bg-gradient-sage",
      items: [
        t('feature_mob_1'),
        t('feature_mob_2'),
        t('feature_mob_3'),
        t('feature_mob_4')
      ]
    },
    {
      category: t('telehealth_platform'),
      icon: Video,
      gradient: "bg-gradient-sunset",
      items: [
        t('feature_tele_1'),
        t('feature_tele_2'),
        t('feature_tele_3'),
        t('feature_tele_4')
      ]
    },
    {
      category: t('analytics_insights'),
      icon: TrendingUp,
      gradient: "bg-gradient-earth",
      items: [
        t('feature_ana_1'),
        t('feature_ana_2'),
        t('feature_ana_3'),
        t('feature_ana_4')
      ]
    },
    {
      category: t('global_accessibility'),
      icon: Globe,
      gradient: "bg-gradient-sage",
      items: [
        t('feature_glob_1'),
        t('feature_glob_2'),
        t('feature_glob_3'),
        t('feature_glob_4')
      ]
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-earth text-white px-4 py-2 mb-4">
            🚀 {t('cutting_edge')}
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('built_for_future')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('features_subtitle')}
          </p>
        </div>

        {/* Dosha Assessment Highlight */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-card/50 to-card border-border shadow-warm">
            <CardContent className="p-8 lg:p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <Badge className="bg-primary text-primary-foreground mb-4">
                    ✨ {t('featured_tech')}
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold mb-4">
                    {t('ai_dosha_title')}
                  </h3>
                  <p className="text-muted-foreground mb-6 text-lg">
                    {t('ai_dosha_desc')}
                  </p>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3">
                      <Heart className="h-5 w-5 text-primary" />
                      <span>{t('personal_rec')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Zap className="h-5 w-5 text-primary" />
                      <span>{t('realtime_adjust')}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Award className="h-5 w-5 text-primary" />
                      <span>{t('validated_by')}</span>
                    </div>
                  </div>
                  <Button variant="hero" size="lg">
                    {t('take_dosha')}
                  </Button>
                </div>
                <div className="relative">
                  <img
                    src={doshaImage}
                    alt="Dosha Assessment Interface"
                    className="rounded-lg shadow-earth w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-lg" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="bg-card border-border hover:shadow-warm transition-all duration-300 hover:-translate-y-1 group"
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {feature.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-sunset text-white border-0 shadow-warm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                {t('ready_transform')}
              </h3>
              <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                {t('join_thousands')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                  {t('start_free')}
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">
                  {t('schedule_demo')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
};