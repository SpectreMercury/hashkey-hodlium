import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-slate-800/30 backdrop-blur-sm border-t border-slate-700/50 fixed bottom-0 w-full z-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="text-slate-300">
              <div>© {new Date().getFullYear()} HashKey Chain hskhodlium.</div>
            </div>
            <div className="flex gap-6">
              <Link 
                href="https://x.com/HSKChain" 
                target="_blank"
                className="text-white hover:text-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Twitter
              </Link>
              <Link 
                href="https://discord.gg/b8KkHJsW" 
                target="_blank"
                className="text-white hover:text-primary flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.73-.4449 1.4871-.6083 2.2446a18.5318 18.5318 0 00-5.5972 0c-.1634-.7574-.3972-1.5146-.6083-2.2446a.0752.0752 0 00-.0785-.0371 19.7913 19.7913 0 00-4.8851 1.5152.0738.0738 0 00-.032.0276C.5339 8.5286-.319 12.5799.0991 16.58a.0824.0824 0 00.0312.0561 19.8731 19.8731 0 005.9902 3.0308.0776.0776 0 00.084-.0286c.4622-.6308.8836-1.2989 1.243-2.0169a.0762.0762 0 00-.0415-.1055 13.1353 13.1353 0 01-1.8757-.8948.0752.0752 0 01-.024-.0553.0738.0738 0 01.037-.0616c.1267-.0575.2584-.115 1.0257-.4239a.0752.0752 0 01.0921.0286c2.7908 2.028 5.8068 2.028 8.5671 0a.0752.0752 0 01.0921-.0286c.7673.3089.899.3664 1.0257.4239a.0738.0738 0 01.037.0616.0752.0752 0 01-.024.0553 13.1353 13.1353 0 01-1.8757.8948.0762.0762 0 00-.0415.1055c.3594.718 1.243 1.3861 1.243 2.0169a.0776.0776 0 00.084.0286 19.8731 19.8731 0 005.9902-3.0308.0824.0824 0 00.0312-.0561c.4772-4.3186-.5626-8.3526-3.7527-12.2072a.0738.0738 0 00-.032-.0276zM8.5218 15.6858c-.8397 0-1.5257-.7574-1.5257-1.6873s.6778-1.6873 1.5257-1.6873c.848 0 1.534 0.7574 1.5257 1.6873s-.6778 1.6873-1.5257 1.6873zm6.9565 0c-.8397 0-1.5257-.7574-1.5257-1.6873s.6778-1.6873 1.5257-1.6873c.848 0 1.534 0.7574 1.5257 1.6873s-.6778 1.6873-1.5257 1.6873z"/>
                </svg>
                Discord
              </Link>
            </div>
          </div>
        </div>
      </footer>
  );
}