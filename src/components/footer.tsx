import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Leaf, Mail, Phone, MapPin, Shield, Award, Globe } from "lucide-react";
import { useI18n } from "@/context/I18nContext";

export const Footer = () => {
  const { t } = useI18n();
  return (
    <footer id="contact" className="bg-muted/30 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-sunset">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">AyurWell</h3>
                <p className="text-xs text-muted-foreground">{t('brand_slogan')}</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer_brand_desc')}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">ISO Certified</span>
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground">{t('platform')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('features_overview')}
                </a>
              </li>
              <li>
                <a href="#dosha-assessment" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('ai_dosha_title')}
                </a>
              </li>
              <li>
                <a href="#meal-planning" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('diet_plan')}
                </a>
              </li>
              <li>
                <a href="#telehealth" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('telehealth')}
                </a>
              </li>
              <li>
                <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('wellness_dashboard')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground">{t('support')}</h4>
            <ul className="space-y-3">
              <li>
                <a href="#help" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('help_center')}
                </a>
              </li>
              <li>
                <a href="#docs" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('docs')}
                </a>
              </li>
              <li>
                <a href="#api" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('api_reference')}
                </a>
              </li>
              <li>
                <a href="#community" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('community_forum')}
                </a>
              </li>
              <li>
                <a href="#training" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  {t('training_resources')}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-6">
            <h4 className="font-semibold text-foreground">{t('get_in_touch')}</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('email')}</p>
                  <a href="mailto:support@ayurwell.com" className="text-sm text-foreground hover:text-primary transition-colors">
                    support@ayurwell.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('contact')}</p>
                  <a href="tel:+1-800-AYURWELL" className="text-sm text-foreground hover:text-primary transition-colors">
                    +1 (800) AYURWELL
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-primary mt-1" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('headquarters')}</p>
                  <p className="text-sm text-foreground">
                    San Francisco, CA<br />
                    Bangalore, India
                  </p>
                </div>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h5 className="font-medium text-foreground">{t('stay_updated')}</h5>
              <p className="text-xs text-muted-foreground">
                {t('newsletter_desc')}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t('email')}
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="sm" variant="hero">
                  {t('subscribe')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <p>© 2024 AyurWell. {t('all_rights_reserved')}</p>
            <div className="flex items-center gap-4">
              <a href="#privacy" className="hover:text-foreground transition-colors">
                {t('privacy_policy')}
              </a>
              <a href="#terms" className="hover:text-foreground transition-colors">
                {t('terms_service')}
              </a>
              <a href="#cookies" className="hover:text-foreground transition-colors">
                {t('cookie_policy')}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>{t('available_languages')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};