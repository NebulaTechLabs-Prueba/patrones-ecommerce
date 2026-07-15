import styles from '../account.module.css';

export default function AccountQuotesPage() {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>Cotizaciones</p>
      <p className={styles.placeholderText}>
        Acá verás tus cotizaciones con precios, promociones y tasa congelados, y podrás
        convertirlas en pedido revalidando la disponibilidad.
      </p>
    </div>
  );
}
