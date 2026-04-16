import { motion } from 'motion/react';
import { usePortfolioStore, PortfolioItem } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Briefcase, 
  FileText, 
  ShoppingBag, 
  Palette, 
  ArrowRight, 
  Mail, 
  CheckCircle2,
  Layout,
  Target,
  MessageSquare,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Portfolio() {
  const { items, siteContent, fetchData, initAuth, login, isAuthenticated, isInitialLoading } = usePortfolioStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const categories = [
    { id: 'all', label: '전체', icon: Layout },
    { id: 'gov', label: '정부지원사업 / 사업기획', icon: FileText },
    { id: 'ppt', label: 'PPT / 발표자료', icon: Palette },
    { id: 'op', label: '운영 / PM', icon: Zap },
    { id: 'md', label: 'MD / 이커머스 운영', icon: ShoppingBag },
  ];

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Portfolio', id: 'portfolio' },
    { name: 'Resume', id: 'resume' },
  ];

  return (
    <div className="min-h-screen bg-base-white text-text-main font-sans selection:bg-toss-blue selection:text-white">
      {isInitialLoading && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-toss-blue/20 border-t-toss-blue rounded-full animate-spin mb-4"></div>
          <p className="text-toss-gray-600 font-bold animate-pulse">포트폴리오를 불러오는 중...</p>
        </div>
      )}
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl py-4 border-b border-toss-gray-100' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button onClick={() => scrollToSection('home')} className="h-8 md:h-10 hover:scale-105 transition-transform active:scale-95">
            <img src="/logo.png" alt="Namjun_portfolio" className="h-full w-auto object-contain" onError={(e) => {
              // Fallback if image doesn't exist yet
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<span class="text-xl font-bold tracking-tighter text-toss-blue">Namjun_portfolio</span>';
            }} />
          </button>

            {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-[13px] font-medium text-toss-gray-600 hover:text-toss-blue transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-toss-blue transition-all group-hover:w-full"></span>
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden text-toss-gray-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 w-full bg-white border-b border-toss-gray-100 p-6 flex flex-col gap-4 md:hidden shadow-xl"
          >
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-left py-3 text-lg font-bold text-toss-gray-900"
              >
                {link.name}
              </button>
            ))}
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-white">
        {/* Wave Animation Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              x: ["-25%", "0%"],
              rotate: [0, 3, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-[40%] -left-[50%] w-[200%] h-[120%] bg-toss-blue/5 rounded-[40%] opacity-60"
            style={{ borderRadius: "38% 42% 40% 40%" }}
          />
          <motion.div
            animate={{
              x: ["0%", "-25%"],
              rotate: [0, -3, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-[45%] -left-[50%] w-[200%] h-[120%] bg-toss-blue/10 rounded-[40%] opacity-40"
            style={{ borderRadius: "42% 38% 44% 40%" }}
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Badge className="mb-6 px-4 py-1.5 bg-toss-blue-light text-toss-blue border-none rounded-full font-bold text-sm">
                {siteContent.hero.badge}
              </Badge>
              <h1 className="text-5xl md:text-[84px] font-bold tracking-tight mb-10 leading-[1.1] text-toss-gray-900 whitespace-pre-line">
                {siteContent.hero.title}
              </h1>
              <p className="text-xl md:text-2xl text-toss-gray-600 mb-14 max-w-2xl font-medium leading-relaxed whitespace-pre-line">
                {siteContent.hero.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-toss-blue text-white hover:bg-toss-blue/90 px-10 h-16 text-lg rounded-2xl group font-bold" 
                  onClick={() => scrollToSection('portfolio')}
                >
                  포트폴리오 보기 <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section id="portfolio" className="py-32 bg-toss-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8 text-toss-gray-900">Portfolio</h2>
            <p className="text-toss-gray-600 text-xl font-medium">실무에서 증명된 핵심 프로젝트들입니다.</p>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="flex justify-center mb-24 overflow-x-auto pb-4 custom-scrollbar">
              <TabsList className="bg-toss-gray-100 p-2 rounded-[24px] flex flex-nowrap md:flex-wrap justify-start md:justify-center h-auto relative gap-2 border border-toss-gray-200 min-w-max">
                {categories.map((cat) => (
                  <TabsTrigger 
                    key={cat.id} 
                    value={cat.id}
                    className="px-8 py-3 rounded-[14px] data-[state=active]:bg-toss-blue data-[state=active]:text-white data-[state=active]:shadow-[0_10px_20px_rgba(49,130,246,0.2)] data-[state=active]:scale-105 font-medium text-toss-gray-500 transition-all hover:text-toss-blue hover:bg-white relative group overflow-hidden active:scale-95 text-sm md:text-base cursor-pointer whitespace-nowrap"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <cat.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      {cat.label}
                    </span>
                    <motion.div 
                      layoutId="tab-glow"
                      className="absolute inset-0 bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  {items
                    .filter((item) => cat.id === 'all' || item.category === cat.id)
                    .map((item, idx) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1, duration: 0.5 }}
                        viewport={{ once: true }}
                        onClick={() => setSelectedItem(item)}
                        className="cursor-pointer"
                      >
                        <Card className="group overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all duration-500 bg-white rounded-[40px]">
                          <div className="aspect-[16/10] overflow-hidden bg-toss-gray-100 relative">
                            <img 
                              src={item.imageUrls[0]} 
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {item.imageUrls.length > 1 && (
                              <div className="absolute bottom-6 right-6 bg-toss-blue text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg flex items-center gap-2">
                                <Palette className="w-4 h-4" />
                                <span>+{item.imageUrls.length - 1}</span>
                              </div>
                            )}
                            <div className="absolute top-8 left-8">
                              <Badge className="bg-white/90 text-toss-blue backdrop-blur-md border-none px-5 py-2 rounded-full font-bold shadow-sm text-sm">
                                {categories.find(c => c.id === item.category)?.label}
                              </Badge>
                            </div>
                          </div>
                          <CardHeader className="p-12 pb-8">
                            <div className="flex justify-between items-start mb-6">
                              <CardTitle className="text-3xl font-bold group-hover:text-toss-blue transition-colors leading-tight text-toss-gray-900">
                                {item.title}
                              </CardTitle>
                              <span className="text-sm font-bold text-toss-gray-400 bg-toss-gray-50 px-4 py-1.5 rounded-full">{item.date}</span>
                            </div>
                            <p className="text-toss-gray-600 font-medium leading-relaxed mb-10 text-lg line-clamp-2">
                              {item.description}
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {item.tags.map(tag => (
                                <span key={tag} className="text-xs font-bold text-toss-gray-500 bg-toss-gray-100 px-5 py-2 rounded-full uppercase tracking-wider">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </CardHeader>
                        </Card>
                      </motion.div>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Image Gallery Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-toss-gray-900/90 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-6xl bg-white rounded-[48px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-8 border-b border-toss-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-toss-gray-900">{selectedItem.title}</h3>
                  <p className="text-toss-gray-500 font-medium">{selectedItem.description}</p>
                </div>
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="w-12 h-12 bg-toss-gray-100 rounded-full flex items-center justify-center hover:bg-toss-gray-200 transition-colors"
                >
                  <X className="w-6 h-6 text-toss-gray-900" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
                {/* Project Info Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-toss-gray-50 p-10 rounded-[40px]">
                  <div>
                    <h4 className="text-sm font-bold text-toss-blue uppercase tracking-widest mb-4">Tools Used</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedItem.toolsUsed?.map(tool => (
                        <span key={tool} className="bg-white border border-toss-gray-200 px-4 py-2 rounded-2xl text-sm font-bold text-toss-gray-700 shadow-sm">
                          {tool}
                        </span>
                      )) || <span className="text-toss-gray-400">등록된 툴이 없습니다.</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-toss-blue uppercase tracking-widest mb-4">Key Learnings & Results</h4>
                    <p className="text-toss-gray-700 font-medium leading-relaxed">
                      {selectedItem.learnings || "이 프로젝트를 통해 얻은 성과와 배운 점이 여기에 표시됩니다."}
                    </p>
                  </div>
                </div>

                <div className="space-y-8">
                  <h4 className="text-xl font-bold text-toss-gray-900 px-2">Project Assets</h4>
                  {selectedItem.imageUrls.map((url, i) => (
                    <div key={i} className="rounded-[32px] overflow-hidden border border-toss-gray-100 shadow-sm">
                      <img 
                        src={url} 
                        alt={`${selectedItem.title} - ${i + 1}`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </section>

      {/* Resume Section */}
      <section id="resume" className="py-32 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-24">
            {/* Profile Sidebar */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/3"
            >
              <div className="sticky top-32 space-y-10">
                <div className="relative w-full aspect-[3/4] rounded-[40px] overflow-hidden shadow-2xl shadow-toss-blue/10">
                  <img 
                    src={siteContent.resume.profileImage} 
                    alt={`${siteContent.resume.name} 프로필`} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://picsum.photos/seed/profile-fallback/400/400';
                    }}
                  />
                </div>
                <div className="space-y-6">
                  <h2 className="text-4xl font-bold text-toss-gray-900">{siteContent.resume.name}</h2>
                  <p className="text-toss-blue font-bold text-xl">Solution Marketer & Designer</p>
                  <div className="pt-8 space-y-5 border-t border-toss-gray-100">
                    <div className="flex items-center gap-4 text-toss-gray-600">
                      <div className="w-10 h-10 bg-toss-gray-50 rounded-full flex items-center justify-center">
                        <Briefcase className="w-5 h-5 text-toss-blue" />
                      </div>
                      <span className="font-bold">{siteContent.resume.phone}</span>
                    </div>
                    <div className="flex items-center gap-4 text-toss-gray-600">
                      <div className="w-10 h-10 bg-toss-gray-50 rounded-full flex items-center justify-center">
                        <Target className="w-5 h-5 text-toss-blue" />
                      </div>
                      <span className="font-bold">{siteContent.resume.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Experience Content */}
            <div className="lg:w-2/3 space-y-20">
              <div>
                <h3 className="text-3xl font-bold mb-12 text-toss-gray-900">{siteContent.experience?.title}</h3>
                <div className="space-y-16">
                  {siteContent.experience?.items?.map((exp, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      viewport={{ once: true }}
                      className="relative pl-10 border-l-2 border-toss-gray-100"
                    >
                      <div className="absolute left-[-9px] top-0 w-4 h-4 bg-toss-blue rounded-full ring-4 ring-toss-blue-light"></div>
                      <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-3">
                        <div>
                          <h4 className="text-2xl font-bold text-toss-gray-900">{exp.company}</h4>
                          <p className="text-toss-blue font-bold text-lg mt-1">{exp.role}</p>
                        </div>
                        <span className="text-sm font-bold text-toss-gray-500 bg-toss-gray-50 px-4 py-1.5 rounded-full">{exp.period}</span>
                      </div>
                      <p className="text-toss-gray-700 font-bold mb-6 text-lg">{exp.description}</p>
                      <ul className="space-y-4">
                        {exp.details?.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-toss-gray-600 font-medium leading-relaxed">
                            <div className="w-1.5 h-1.5 bg-toss-blue rounded-full mt-2.5 shrink-0"></div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-toss-gray-100 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-3">
            <button onClick={() => scrollToSection('home')} className="h-8 hover:scale-105 transition-transform active:scale-95">
              <img src="/logo.png" alt="Namjun_portfolio" className="h-full w-auto object-contain" onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<span class="text-xl font-bold tracking-tighter text-toss-blue">Namjun_portfolio</span>';
              }} />
            </button>
            <p className="text-toss-gray-400 text-sm font-medium mt-2">
              © 2024 Namjun_portfolio. All Rights Reserved.
            </p>
          </div>
          <div className="flex gap-8">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-toss-gray-400 hover:text-toss-blue text-xs uppercase tracking-widest font-bold" 
              onClick={() => window.location.href = '/admin'}
            >
              Admin Login
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Button({ className, variant, size, ...props }: any) {
  const variants: any = {
    default: "bg-toss-blue text-white hover:bg-toss-blue/90 shadow-sm",
    outline: "border border-toss-gray-200 text-toss-gray-700 hover:bg-toss-gray-50",
    ghost: "hover:bg-toss-gray-100 text-toss-gray-500",
  };
  const sizes: any = {
    default: "h-12 px-6 py-2",
    sm: "h-10 px-4 text-sm",
    lg: "h-16 px-10 text-lg",
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center font-bold transition-all active:scale-[0.98] focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 ${variants[variant || 'default']} ${sizes[size || 'default']} ${className}`}
      {...props}
    />
  );
}
