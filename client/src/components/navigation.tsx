import { Link, useLocation } from "wouter";

export default function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <i className="fas fa-file-alt text-primary text-2xl mr-3"></i>
            <Link href="/">
              <h1 className="text-xl font-bold text-neutral-800 cursor-pointer">ResumeOptimizer Pro</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-neutral-500 hover:text-primary transition-colors">
              <i className="fas fa-question-circle"></i>
            </button>
            <button className="text-neutral-500 hover:text-primary transition-colors">
              <i className="fas fa-user-circle"></i>
            </button>
          </div>
        </div>
      </div>
      <a
  href="https://fileintelligence.onrender.com"
  target="_blank"
  rel="noopener noreferrer"
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300"
>
  File Intelligence
</a>
    </nav>
  );
}
