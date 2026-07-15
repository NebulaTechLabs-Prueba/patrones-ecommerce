import styles from '../account.module.css';

export default function AccountProfilePage() {
  return (
    <div className={styles.placeholder}>
      <p className={styles.placeholderTitle}>Mis datos</p>
      <p className={styles.placeholderText}>
        Nombre, contacto, dirección y documento (cédula o RIF con validación venezolana).
      </p>
    </div>
  );
}
