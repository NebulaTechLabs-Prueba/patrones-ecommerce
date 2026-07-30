/**
 * Admin - Anuncios y captación. La barra de anuncio superior y el popup de
 * incentivo para crear cuenta. Se separó de Portada (que es solo el hero de la
 * Home): son cosas distintas y no deben mezclarse.
 */

import { AdminPromos } from '@/components/admin/AdminPromos';

export default function AdminMarketingPage() {
  return <AdminPromos />;
}
