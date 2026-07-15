import styles from '../account.module.css';

export default function AccountWishlistPage() {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>Lista de deseados</p>
      <p className={styles.placeholderText}>
        Guardá prendas mientras están disponibles: si se agotan desaparecen del catálogo pero
        quedan en tu lista, y te avisamos cuando vuelven. Requiere cuenta real (Fase 2).
      </p>
    </div>
  );
}
