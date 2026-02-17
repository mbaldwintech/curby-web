import { PrivacyPolicyService } from '@core/services';
import { createServerService } from '@supa/utils/server';
import { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import './page.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Read the latest Privacy Policy for Curby.'
};

export default async function PrivacyPage() {
  const privacyPolicyService = await createServerService(PrivacyPolicyService);
  const policy = await privacyPolicyService.getCurrent();

  if (!policy) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p>Privacy Policy content is not available.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="crby-markdown prose prose-neutral dark:prose-invert max-w-none">
        <ReactMarkdown>
          {policy?.content.replaceAll(/\\n/g, '\n') || 'Privacy Policy content is not available.'}
        </ReactMarkdown>
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Version {policy.version} – Effective {new Date(policy.effectiveDate).toLocaleDateString()}
      </p>
    </main>
  );
}
