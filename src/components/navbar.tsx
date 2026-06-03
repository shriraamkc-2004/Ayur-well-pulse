import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Menu, X, Leaf, Globe, ChevronDown } from "lucide-react";
import { useI18n, Lang } from "@/context/I18nContext";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, lang, setLang } = useI18n();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const languages: { code: Lang; name: string }[] = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "mr", name: "मराठी" },
    { code: "ta", name: "தமிழ்" },
    { code: "es", name: "Español" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-sunset">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AyurWell</h1>
              <Badge variant="secondary" className="text-xs px-2 py-0">Beta</Badge>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('features')}
            </a>
            <a href="#roles" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('roles')}
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              {t('contact')}
            </a>
          </div>

          {/* Desktop CTA & Lang */}
          <div className="hidden md:flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
                  <Globe className="h-4 w-4" />
                  {languages.find(l => l.code === lang)?.name}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                    {l.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="h-6 w-px bg-border mx-2" />

            <Button variant="ghost" className="text-muted-foreground" asChild>
              <Link to="/role-selection" state={{ tab: 'login' }}>{t('login')}</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/role-selection" state={{ tab: 'signup' }}>{t('get_started')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {languages.map((l) => (
                  <DropdownMenuItem key={l.code} onClick={() => setLang(l.code)}>
                    {l.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-foreground" />
              ) : (
                <Menu className="h-6 w-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
            <div className="px-4 py-6 space-y-4">
              <a
                href="#features"
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                {t('features')}
              </a>
              <a
                href="#roles"
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                {t('roles')}
              </a>
              <a
                href="#contact"
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={toggleMenu}
              >
                {t('contact')}
              </a>

              <div className="border-t border-border pt-4 space-y-3">
                <Button variant="ghost" className="w-full justify-start text-muted-foreground" asChild>
                  <Link to="/role-selection" state={{ tab: 'login' }}>{t('login')}</Link>
                </Button>
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/role-selection" state={{ tab: 'signup' }}>{t('get_started')}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};