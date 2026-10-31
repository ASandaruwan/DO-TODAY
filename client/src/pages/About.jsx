import {
  Layout,
  Kanban,
  Calendar,
  Paperclip,
  Shield,
  Download,
  Palette,
  Layers,
  Server,
  Code2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const features = [
    {
      title: 'Multi-View Task Dashboard',
      desc: 'Seamlessly switch between List, interactive Kanban board, and Gantt-style Timeline views to visualize your workflow your way.',
      icon: Layout,
      color: 'text-primary bg-primary-soft dark:bg-primary/20',
    },
    {
      title: 'Drag & Drop Kanban',
      desc: 'Smooth task transitions across Pending, In Progress, and Completed columns powered by @hello-pangea/dnd with instant optimistic sync.',
      icon: Kanban,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
    },
    {
      title: 'Daily Agenda & Calendar',
      desc: 'Plan tasks for specific dates, track active days with indicator dots, and navigate upcoming schedules effortlessly.',
      icon: Calendar,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40',
    },
    {
      title: 'File Attachments',
      desc: 'Attach PDFs, PNGs, and JPGs (up to 5 MB each) directly to your tasks with cloud-ready storage integration.',
      icon: Paperclip,
      color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40',
    },
    {
      title: 'Secure Authentication & Recovery',
      desc: 'Bcrypt password hashing, route-level JWT authorization, and an answer-verified security question flow for password resets.',
      icon: Shield,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
    },
    {
      title: 'One-Click JSON Data Export',
      desc: 'Zero lock-in. Back up your full profile and task records into a clean, portable JSON format at any time.',
      icon: Download,
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40',
    },
    {
      title: 'Warm Light & Slate Dark Themes',
      desc: 'Carefully designed color schemes tailored for visual comfort during both day and night, persisted across devices.',
      icon: Palette,
      color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
    },
    {
      title: 'Responsive Mobile Experience',
      desc: 'Custom mobile drawer navigation, bottom quick-action FAB, and touch-optimized controls for phones and tablets.',
      icon: Layers,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
    },
  ];

  const frontendStack = [
    { name: 'React 19', role: 'Modern UI library with concurrent rendering' },
    { name: 'Tailwind CSS v3', role: 'Utility-first styling with custom tokens' },
    { name: 'React Router v7', role: 'Client-side routing and protected boundaries' },
    { name: '@hello-pangea/dnd', role: 'Accessible and fluid drag-and-drop mechanics' },
    { name: 'Lucide React', role: 'Consistent, modern icon system' },
    { name: 'Outfit & Inter Fonts', role: 'Geometric headings and high-legibility body' },
    { name: 'Axios', role: 'HTTP client with JWT request/response interceptors' },
  ];

  const backendStack = [
    { name: 'Node.js & Express', role: 'High-throughput RESTful API server' },
    { name: 'MongoDB & Mongoose', role: 'Document database with user-scoped indexes' },
    { name: 'JWT & Bcryptjs', role: 'Stateless auth and strong password hashing' },
    { name: 'Multer & Cloudinary', role: 'File upload processing and storage' },
    { name: 'Helmet & Rate Limit', role: 'HTTP security headers and brute-force protection' },
    { name: 'Morgan & Validator', role: 'Request logging and strict input validation' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10 animate-in fade-in duration-300">
      {/* Brand Hero Card */}
      <div className="bg-surface-light dark:bg-[#1A1D27] p-8 sm:p-12 rounded-card border border-border-light dark:border-border-dark shadow-card text-center transition-colors relative overflow-hidden">
        {/* Glow backdrop accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] bg-logo-gradient flex items-center justify-center mx-auto mb-5 shadow-logo-glow transition-transform hover:scale-105 duration-200">
          <span className="text-white font-outfit font-bold text-2xl sm:text-3xl tracking-tight">
            DO
          </span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-soft dark:bg-primary/20 text-primary mb-3">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>DO-TODAY v1.0.0</span>
        </div>

        <h1 className="font-outfit font-bold text-3xl sm:text-5xl text-content-strong dark:text-white tracking-tight">
          About DO-<span className="text-primary">TODAY</span>
        </h1>

        <p className="text-content-muted dark:text-gray-300 text-base sm:text-xl max-w-2xl mx-auto mt-3 leading-relaxed">
          A modern, high-performance personal task manager engineered to help you plan, prioritize, and conquer your goals day by day with zero clutter.
        </p>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm shadow-btn-red transition-all active:scale-95"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark text-content-strong dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold text-sm transition-all active:scale-95"
          >
            <span>View Today&apos;s Agenda</span>
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div>
        <div className="mb-5">
          <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-content-strong dark:text-white tracking-tight">
            Core Features
          </h2>
          <p className="text-content-muted dark:text-gray-400 text-sm sm:text-base mt-0.5">
            Everything you need to organize your daily productivity without unnecessary bloat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="bg-surface-light dark:bg-[#1A1D27] p-6 rounded-card border border-border-light dark:border-border-dark shadow-card flex items-start gap-4 transition-transform hover:-translate-y-0.5 duration-200"
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${feat.color}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white">
                    {feat.title}
                  </h3>
                  <p className="text-content-muted dark:text-gray-400 text-sm mt-1 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tech Stack & Architecture */}
      <div className="space-y-6">
        <div>
          <h2 className="font-outfit font-bold text-2xl sm:text-3xl text-content-strong dark:text-white tracking-tight">
            Tech Stack & Architecture
          </h2>
          <p className="text-content-muted dark:text-gray-400 text-sm sm:text-base mt-0.5">
            Built with a modern full-stack JavaScript architecture following modular MVC conventions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Frontend Stack */}
          <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-7 rounded-card border border-border-light dark:border-border-dark shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <Code2 className="w-5 h-5 text-primary" />
              <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
                Frontend Architecture
              </h3>
            </div>

            <div className="space-y-3">
              {frontendStack.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start justify-between gap-3 text-xs sm:text-sm py-1.5 border-b border-border-light/60 dark:border-border-dark/60 last:border-b-0"
                >
                  <span className="font-semibold text-content-strong dark:text-gray-200 flex-shrink-0">
                    {item.name}
                  </span>
                  <span className="text-content-muted dark:text-gray-400 text-right">
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Stack */}
          <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-7 rounded-card border border-border-light dark:border-border-dark shadow-card">
            <div className="flex items-center gap-2.5 mb-4">
              <Server className="w-5 h-5 text-primary" />
              <h3 className="font-outfit font-bold text-xl text-content-strong dark:text-white">
                Backend Architecture
              </h3>
            </div>

            <div className="space-y-3">
              {backendStack.map((item) => (
                <div
                  key={item.name}
                  className="flex items-start justify-between gap-3 text-xs sm:text-sm py-1.5 border-b border-border-light/60 dark:border-border-dark/60 last:border-b-0"
                >
                  <span className="font-semibold text-content-strong dark:text-gray-200 flex-shrink-0">
                    {item.name}
                  </span>
                  <span className="text-content-muted dark:text-gray-400 text-right">
                    {item.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Engineering Highlights */}
        <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
          <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white mb-4">
            Key Engineering Highlights
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark">
              <span className="font-bold text-primary block mb-1">Scoped Security</span>
              <p className="text-content-muted dark:text-gray-400">
                All task queries are strictly bound to the authenticated user ID on the server, guaranteeing tenant isolation.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark">
              <span className="font-bold text-primary block mb-1">Optimistic UI</span>
              <p className="text-content-muted dark:text-gray-400">
                Kanban card dragging updates instantly with seamless rollback handling if a network request fails.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-[#13151F] border border-border-light dark:border-border-dark">
              <span className="font-bold text-primary block mb-1">Universal Dark Mode</span>
              <p className="text-content-muted dark:text-gray-400">
                Zero styling compromises: bespoke color palettes for both light cream and deep slate dark modes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
