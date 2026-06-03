import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/ayurwell-hero.jpg";
import { Users, Shield, Stethoscope, Leaf } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { Link, useNavigate } from "react-router-dom";

export const HeroSection = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/95" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Column - Main Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <Badge className="bg-gradient-earth text-white px-4 py-2 text-sm font-medium">
                {t('now_live_beta')}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                {t('welcome')}{" "}{t('to')}{" "}
                <span className="bg-gradient-sunset bg-clip-text text-transparent">
                  AyurWell
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {t('hero_subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="group" asChild>
                <Link to="/role-selection" state={{ tab: 'signup' }}>
                  {t('get_started')}
                  <Leaf className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                {t('learn_more')}
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Stethoscope className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('verified_doctors_indicator')}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{t('users_indicator')}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Feature Cards */}
          <div className="grid gap-6">
            <Card 
              className="bg-card/90 backdrop-blur-sm border-border shadow-earth hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/role-selection', { state: { tab: 'signup' } })}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-earth">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('patient')}</h3>
                    <p className="text-muted-foreground">{t('hero_patient_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/90 backdrop-blur-sm border-border shadow-earth hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/role-selection', { state: { tab: 'signup' } })}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-sage">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('doctor')}</h3>
                    <p className="text-muted-foreground">{t('hero_doctor_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="bg-card/90 backdrop-blur-sm border-border shadow-earth hover:shadow-warm transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              onClick={() => navigate('/role-selection', { state: { tab: 'signup' } })}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-sunset">
                    <Leaf className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{t('dietitian')}</h3>
                    <p className="text-muted-foreground">{t('hero_dietitian_desc')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </section>
  );
};