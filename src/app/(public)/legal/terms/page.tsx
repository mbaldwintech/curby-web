import { TermsAndConditionsService } from '@core/services/terms-and-conditions.service';
import { createServerService } from '@supa/utils/server';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import './page.module.css';

export const metadata: Metadata = {
  title: 'Terms and Conditions - Curby',
  description: 'Read the latest Terms and Conditions for Curby.'
};

export default async function TermsPage() {
  const termsAndConditionsService = await createServerService(TermsAndConditionsService);
  const terms = await termsAndConditionsService.getCurrent();

  if (!terms) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Terms and Conditions content is not available.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="crby-markdown prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown>
          {terms?.content.replaceAll(/\\n/g, '\n') || 'Terms and Conditions content is not available.'}
        </ReactMarkdown>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Version {terms.version} – Effective {new Date(terms.effectiveDate).toLocaleDateString()}
      </p>
    </main>
  );
}
