
"use client";

import Link from "next/link";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { getAllServices } from "@/lib/service-service";
import { useEffect, useState } from "react";

const NavLink = ({ href, children, onLinkClick, isDesktop }: { href: string; children: React.ReactNode, onLinkClick?: () => void, isDesktop?: boolean }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button asChild variant="ghost" className={cn(
      "justify-start text-base transition-colors",
      isDesktop ? "hover:text-white" : "hover:text-primary",
      isActive ? "font-bold text-primary" : "text-muted-foreground",
    )}>
      <Link href={href} onClick={onLinkClick}>{children}</Link>
    </Button>
  );
};

interface HeaderNavLinksProps {
  onLinkClick?: () => void;
  isDesktop?: boolean;
}

export default function HeaderNavLinks({ onLinkClick, isDesktop }: HeaderNavLinksProps) {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasServices, setHasServices] = useState(true);

  useEffect(() => {
    setIsClient(true);
    if (status === "authenticated" && session?.user?.isAdmin) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    const checkServices = async () => {
      try {
        const services = await getAllServices();
        setHasServices(services && services.length > 0);
      } catch (error) {
        setHasServices(false);
      }
    };
    checkServices();
  }, [session, status]);

  const navLinks = [
    { href: "/", label: t("Home") },
    { href: "/products", label: t("Products") },
  ];

  if (hasServices) {
    navLinks.push({ href: "/#services", label: t("Services") });
  }

  // { href: "/about", label: t("About_Us") },
  navLinks.push({ href: "/#contact", label: t("Contact") });

  if (isClient && isAdmin) {
    navLinks.push({ href: "/admin", label: t("Admin") });
  }

  return (
    <>
      {navLinks.map((link) => (
        <NavLink key={link.href} href={link.href} onLinkClick={onLinkClick} isDesktop={isDesktop}>
          {link.label}
        </NavLink>
      ))}
    </>
  );
}
