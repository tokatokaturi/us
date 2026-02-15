import { Link } from "react-router-dom";

const footerLinks = {
  help: [
    { label: "Customer Service", href: "#" },
    { label: "Shipping", href: "#" },
    { label: "Returns", href: "#" },
    { label: "Size Guide", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Sustainability", href: "#" },
    { label: "Press", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Use", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border">
      <div className="px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Newsletter */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-xs tracking-editorial font-body mb-4">NEWSLETTER</h3>
            <p className="text-xs text-muted-foreground font-body mb-4 leading-relaxed">
              Subscribe to receive updates on new collections, exclusive offers and our latest editorial content.
            </p>
            <div className="flex border-b border-foreground">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 py-2 text-xs font-body bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button className="text-xs tracking-editorial font-body px-2 py-2">
                →
              </button>
            </div>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs tracking-editorial font-body mb-4">HELP</h3>
            <ul className="space-y-2.5">
              {footerLinks.help.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground font-body hover:text-foreground transition-luxury"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-xs tracking-editorial font-body mb-4">COMPANY</h3>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground font-body hover:text-foreground transition-luxury"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs tracking-editorial font-body mb-4">LEGAL</h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-xs text-muted-foreground font-body hover:text-foreground transition-luxury"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-lg font-semibold tracking-wide">ATELIER</p>
          <p className="text-[10px] text-muted-foreground font-body tracking-editorial">
            © 2026 ATELIER. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
