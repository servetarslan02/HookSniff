import { Link } from '@/i18n/navigation';

const links = [
  { name: 'GitHub', href: 'https://github.com/hookrelay' },
  { name: 'Docs', href: '/docs' },
  { name: 'Status', href: '/status' },
  { name: 'Blog', href: '#' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-semibold text-gray-900 dark:text-white">Hookrelay</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-slate-400">
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-gray-900 dark:hover:text-white transition">
              {link.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-400 dark:text-slate-500">© {new Date().getFullYear()} Hookrelay. All rights reserved.</p>
      </div>
    </footer>
  );
}
