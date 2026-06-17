import { Link } from "react-router-dom";
import { LEGAL_DOCUMENTS } from "../content/legalContent.js";

const LEGAL_LINKS = [
  { slug: "mentions-legales", label: "Mentions légales" },
  { slug: "politique-confidentialite", label: "Confidentialité" },
  { slug: "conditions-utilisation", label: "CGU" },
  { slug: "cookies", label: "Cookies" },
].filter((item) => LEGAL_DOCUMENTS[item.slug]);

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-800 bg-zinc-900 py-2 text-zinc-400">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 sm:px-6">
        <p className="text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} Event Manager. Tous droits réservés.
        </p>
        <nav
          className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-xs"
          aria-label="Informations légales"
        >
          {LEGAL_LINKS.map(({ slug, label }) => (
            <Link
              key={slug}
              to={`/legal/${slug}`}
              className="text-zinc-500 transition hover:text-orange-400"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
