import Link from 'next/link';

const links = [
  { name: 'GitHub', href: 'https://github.com/hookrelay' },
  { name: 'Docs', href: '/docs' },
  { name: 'Status', href: '#' },
  { name: 'Blog', href: '#' },
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🪝</span>
          <span className="font-semibold text-gray-900">Hookrelay</span>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-gray-500">
          {links.map((link) => (
            <Link key={link.name} href={link.href} className="hover:text-gray-900 transition">
              {link.name}
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-400">© {new Date().getFullYear()} Hookrelay. All rights reserved.</p>
      </div>
    </footer>
  );
}
