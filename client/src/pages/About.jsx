import { CheckCircle2, Shield, Layout, Palette } from 'lucide-react';

export default function About() {
  const features = [
    {
      title: 'Multi-View Task Management',
      desc: 'Seamlessly switch between List, Kanban board, and Gantt-style Timeline views.',
      icon: Layout,
    },
    {
      title: 'Interactive Kanban Drag & Drop',
      desc: 'Organize tasks across Pending, In Progress, and Completed columns with smooth transitions.',
      icon: CheckCircle2,
    },
    {
      title: 'Reliable Security & Recovery',
      desc: 'Industry-standard JWT authentication and custom security question recovery flow.',
      icon: Shield,
    },
    {
      title: 'Light & Dark Interface',
      desc: 'Clean, pixel-perfect UI with theme persistence and modern aesthetics.',
      icon: Palette,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Brand Hero */}
      <div className="bg-surface-light dark:bg-[#1A1D27] p-8 sm:p-12 rounded-card border border-border-light dark:border-border-dark shadow-card text-center">
        <div className="w-16 h-16 rounded-[18px] bg-logo-gradient flex items-center justify-center mx-auto mb-5 shadow-logo-glow">
          <span className="text-white font-outfit font-bold text-2xl tracking-tight">DO</span>
        </div>
        <h1 className="font-outfit font-bold text-3xl sm:text-4xl text-content-strong dark:text-white">
          About DO-<span className="text-primary">TODAY</span>
        </h1>
        <p className="text-content-muted dark:text-gray-300 text-lg max-w-2xl mx-auto mt-3">
          A modern, high-performance personal task manager built to help you track, prioritize, and conquer your goals day by day.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <div
              key={feat.title}
              className="bg-surface-light dark:bg-[#1A1D27] p-6 rounded-card border border-border-light dark:border-border-dark shadow-card flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-primary-soft dark:bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-outfit font-bold text-lg text-content-strong dark:text-white">
                  {feat.title}
                </h3>
                <p className="text-content-muted dark:text-gray-400 text-sm mt-1">
                  {feat.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tech Stack Details */}
      <div className="bg-surface-light dark:bg-[#1A1D27] p-6 sm:p-8 rounded-card border border-border-light dark:border-border-dark shadow-card">
        <h2 className="font-outfit font-bold text-xl text-content-strong dark:text-white mb-4">
          Tech Stack & Architecture
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-content-muted dark:text-gray-300">
          <div>
            <span className="font-semibold text-content-strong dark:text-white block">Frontend</span>
            React 19, Tailwind CSS v3, React Router v7, @hello-pangea/dnd, Axios, Lucide Icons, Outfit & Inter Google Fonts.
          </div>
          <div>
            <span className="font-semibold text-content-strong dark:text-white block">Backend</span>
            Node.js, Express, MongoDB & Mongoose, JWT & bcrypt, Cloudinary, Helmet, Rate Limiter.
          </div>
        </div>
      </div>
    </div>
  );
}
