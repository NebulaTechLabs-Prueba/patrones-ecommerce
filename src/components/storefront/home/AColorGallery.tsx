'use client';

/**
 * Escena "A todo color" de la Home: copy editorial + carrusel circular. El copy y
 * las imágenes son editables desde el admin (content-context), no hardcodeados.
 */

import { Reveal } from '@/components/motion/Reveal';
import { ImageGallery } from '@/components/ui/carousel-circular-image-gallery';
import { useContent } from '@/lib/store/content-context';
import styles from '@/app/page.module.css';

export function AColorGallery() {
  const { content } = useContent();
  const { scene, items } = content.gallery;
  return (
    <section className={`${styles.section} ${styles.gallery}`}>
      <div className={styles.wrap}>
        <Reveal className={styles.headLight}>
          <p className={styles.eyebrowLight}>{scene.eyebrow}</p>
          <h2 className={styles.headingLight}>{scene.title}</h2>
          <p className={styles.subheadLight}>{scene.subhead}</p>
        </Reveal>
      </div>
      <ImageGallery items={items} />
    </section>
  );
}
