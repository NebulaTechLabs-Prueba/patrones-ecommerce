/**
 * "Nosotros" quedó fusionado dentro de Esencia (predominio de Esencia). Esta ruta
 * se conserva por compatibilidad y redirige a /esencia.
 */

import { redirect } from 'next/navigation';

export default function AboutPage() {
  redirect('/esencia/');
}
