import Link from "next/link";

import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

const links = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg text-sm">
            PA
          </span>
          {siteConfig.name}
        </Link>
        <nav className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
          <Link
            href="http://localhost:3002"
            className="text-muted-foreground hover:text-foreground transition-colors">
            Docs
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Start free trial</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <p className="font-semibold">{siteConfig.name}</p>
          <p className="text-muted-foreground mt-2 text-sm">
            Multi-tenant procurement SaaS for modern enterprises.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">Product</p>
          <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/blog">Blog</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Company</p>
          <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/dashboard/support">Support</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">Legal</p>
          <ul className="text-muted-foreground mt-2 space-y-2 text-sm">
            <li>Privacy Policy</li>
            <li>Terms of Service</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
