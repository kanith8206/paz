
import React from 'react';
import { useStore } from '../store/useStore';
import { Language } from '../types';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button, buttonVariants } from './ui/button';
import { cn } from '../lib/utils';

const languages: { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "flex items-center gap-2 rounded-full px-4 hover:bg-[#6C5CE7]/10 text-[#636E72] hover:text-[#6C5CE7]")}>
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{languages.find(l => l.code === language)?.label}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl border-[#E2E8F0] shadow-xl">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer rounded-xl px-4 py-2 text-sm ${
              language === lang.code ? 'bg-[#6C5CE7] text-white' : 'text-[#636E72] hover:bg-[#6C5CE7]/10 hover:text-[#6C5CE7]'
            }`}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
