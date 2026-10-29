import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TaskModal from '../tasks/TaskModal';

export default function PageShell() {
  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark text-content-strong dark:text-gray-100 flex flex-col transition-colors">
      <Navbar />
      <main className="flex-1 w-full max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>
      <TaskModal />
    </div>
  );
}
