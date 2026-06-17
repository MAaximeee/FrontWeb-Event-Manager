import { Link, useParams } from "react-router-dom";
import { LEGAL_DOCUMENTS } from "../content/legalContent.js";

export function LegalPage() {
  const { slug } = useParams();
  const doc = LEGAL_DOCUMENTS[slug];

  if (!doc) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-white">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-orange-500">Document introuvable</h1>
          <p className="mt-4 text-sm text-zinc-400">
            Cette page légale n&apos;existe pas.
          </p>
          <Link
            to="/"
            className="mt-6 inline-block text-sm text-orange-500 hover:text-orange-400"
          >
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 pt-24 pb-16 text-white">
      <article className="mx-auto max-w-2xl">
        <header className="mb-8 border-b border-zinc-700/80 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-500">
            {doc.title}
          </h1>
        </header>

        <div className="space-y-8 text-sm text-zinc-300 leading-relaxed">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-base font-semibold text-white mb-2">
                {section.heading}
              </h2>
              {section.paragraphs.map((text) => (
                <p key={text} className="mb-2 last:mb-0">
                  {text}
                </p>
              ))}
            </section>
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-500">
          Une question ?{" "}
          <Link to="/contact" className="text-orange-500 hover:text-orange-400">
            Contactez-nous
          </Link>
          .
        </p>
      </article>
    </div>
  );
}

export default LegalPage;
