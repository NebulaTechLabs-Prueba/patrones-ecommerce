/**
 * CatalogHero - encabezado de una landing (rubro, marca o faceta). Recibe la data;
 * no hardcodea nada. Cuando hay imagen, se presenta con uno de 3 estilos (como el
 * hero del Home) para que el contenedor POTENCIE la imagen, no solo un color de fondo:
 *  - split    : texto + imagen enmarcada al lado (editorial).
 *  - full     : imagen a sangre completa con velo; el texto va encima (inmersivo).
 *  - portrait : imagen vertical destacada sobre un panel de acento.
 * Sin imagen: encabezado de texto sobre el lavado cálido.
 */

import { PlaceholderImage } from '@/components/brand/PlaceholderImage';
import type { HeroImageStyle, ProductImage } from '@/lib/data/types';
import styles from './CatalogHero.module.css';

interface CatalogHeroProps {
  eyebrow: string;
  title: string;
  description: string;
  image?: ProductImage | null;
  /** Relacion de aspecto del media (solo split). */
  imageRatio?: string;
  style?: HeroImageStyle;
}

export function CatalogHero({ eyebrow, title, description, image, imageRatio = '16 / 10', style = 'split' }: CatalogHeroProps) {
  const hasImage = image !== undefined;

  const text = (
    <div className={styles.text}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </div>
  );

  // Sin imagen: encabezado de texto sobre el lavado.
  if (!hasImage) {
    return <section className={styles.hero}>{text}</section>;
  }

  // Inmersivo: imagen full-bleed + velo, texto claro encima.
  if (style === 'full') {
    return (
      <section className={`${styles.hero} ${styles.full}`}>
        <div className={styles.fullBg} aria-hidden="true">
          {image?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt="" className={styles.fullImg} />
          ) : (
            <div className={styles.fullTile}>
              <PlaceholderImage image={null} label={title} ratio="21 / 9" />
            </div>
          )}
          <div className={styles.fullVeil} />
        </div>
        <div className={styles.fullInner}>
          <div className={`${styles.text} ${styles.textLight}`}>
            <p className={styles.eyebrow}>{eyebrow}</p>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.description}>{description}</p>
          </div>
        </div>
      </section>
    );
  }

  // Retrato: imagen vertical destacada sobre panel de acento.
  if (style === 'portrait') {
    return (
      <section className={`${styles.hero} ${styles.portrait}`}>
        {text}
        <div className={styles.portraitMedia}>
          <span className={styles.portraitPanel} aria-hidden="true" />
          <div className={styles.portraitFrame}>
            <PlaceholderImage image={image ?? null} label={title} ratio="3 / 4" priority />
          </div>
        </div>
      </section>
    );
  }

  // Split (default): texto + imagen enmarcada al lado.
  return (
    <section className={styles.hero}>
      {text}
      <div className={styles.media}>
        <PlaceholderImage image={image ?? null} label={title} ratio={imageRatio} priority />
      </div>
    </section>
  );
}
