import styles from '../account.module.css';

export default function AccountProfilePage() {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>Mis datos</p>
      <p className={styles.placeholderText}>
        Nombre, contacto, dirección y documento (cédula o RIF con validación venezolana). La
        edición con persistencia real llega en Fase 2; la validación del documento ya está
        implementada y testeada.
      </p>
    </div>
  );
}
