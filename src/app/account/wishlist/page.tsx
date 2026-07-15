import type { Metadata } from 'next';
import { Wishlist } from '@/components/account/Wishlist';

export const metadata: Metadata = {
  title: 'Lista de deseados — PATRONES',
};

export default function AccountWishlistPage() {
  return <Wishlist />;
}
