import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Stethoscope, Utensils, Building2, CheckCircle } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { useNavigate } from "react-router-dom";

interface RoleSelectionProps {
  onSelect?: (role: string) => void;
}

export const RoleSelection = ({ onSelect }: RoleSelectionProps) => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const roles = [
    {
      id: "patient",
      title: t('patient'),
      description: t('patient_desc_short'),
      icon: Users,
      features: [
        t('role_pat_f_1'),
        t('role_pat_f_2'),
        t('role_pat_f_3'),
        t('role_pat_f_4'),
        t('role_pat_f_5')
      ],
      buttonText: t('role_pat_btn'),
      variant: "hero" as const,
      popular: true
    },
    {
      id: "doctor",
      title: t('doctor'),
      description: t('doctor_desc_short'),
      icon: Stethoscope,
      features: [
        t('role_doc_f_1'),
        t('role_doc_f_2'),
        t('role_doc_f_3'),
        t('role_doc_f_4'),
        t('role_doc_f_5')
      ],
      buttonText: t('role_doc_btn'),
      variant: "sage" as const,
      popular: false
    },
    {
      id: "dietitian",
      title: t('dietitian'),
      description: t('dietitian_desc_short'),
      icon: Utensils,
      features: [
        t('role_die_f_1'),
        t('role_die_f_2'),
        t('role_die_f_3'),
        t('role_die_f_4'),
        t('role_die_f_5')
      ],
      buttonText: t('role_die_btn'),
      variant: "earth" as const,
      popular: false
    },
    {
      id: "admin",
      title: t('admin'),
      description: t('admin_desc_short'),
      icon: Building2,
      features: [
        t('role_adm_f_1'),
        t('role_adm_f_2'),
        t('role_adm_f_3'),
        t('role_adm_f_4'),
        t('role_adm_f_5')
      ],
      buttonText: t('role_adm_btn'),
      variant: "outline" as const,
      popular: false
    }
  ];

  return (
    <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('choose_your_path')}{" "}
            <span className="bg-gradient-sunset bg-clip-text text-transparent">
              {t('wellness')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('role_selection_subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card
                key={role.id}
                className={`relative bg-card border-border hover:shadow-warm transition-all duration-300 hover:-translate-y-2 group ${role.popular ? 'ring-2 ring-primary ring-opacity-50' : ''
                  }`}
              >
                {role.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-sunset text-white px-4 py-1">
                    {t('most_popular')}
                  </Badge>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="mx-auto p-4 rounded-full bg-gradient-earth mb-4 w-fit group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold">{role.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {role.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={role.variant}
                    className="w-full"
                    size="lg"
                    onClick={() => onSelect?.(role.id)}
                  >
                    {role.buttonText}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            {t('already_have_account')}
          </p>
          <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" onClick={() => navigate('/auth', { state: { tab: 'login' } })}>
            {t('sign_in_instead')}
          </Button>
        </div>
      </div>
    </section>
  );
};