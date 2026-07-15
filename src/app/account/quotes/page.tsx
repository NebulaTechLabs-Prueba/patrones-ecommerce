import type { Metadata } from 'next';
import { Quotes } from '@/components/account/Quotes';

export const metadata: Metadata = {
  title: 'Cotizaciones — PATRONES',
};

export default function AccountQuotesPage() {
  return <Quotes />;
}
