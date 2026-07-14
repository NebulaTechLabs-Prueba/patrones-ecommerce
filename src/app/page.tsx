/**
 * Pagina de sosten provisional (PLACEHOLDER).
 * Existe para que el proyecto compile y el export estatico tenga un artefacto.
 * Se reemplaza por la Home real (puertas de rubro + featured multi-rubro) en la
 * siguiente tanda. No es la Home definitiva.
 */
export default function HoldingPage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 'var(--ptr-space-6)',
        backgroundColor: 'var(--ptr-cream)',
        textAlign: 'center',
      }}
    >
      <div>
        <p
          style={{
            fontSize: 'var(--ptr-text-3xl)',
            fontWeight: 'var(--ptr-weight-regular)',
            letterSpacing: 'var(--ptr-tracking-wider)',
            color: 'var(--ptr-primary)',
          }}
        >
          PATRONES
        </p>
        <p
          style={{
            marginTop: 'var(--ptr-space-4)',
            fontSize: 'var(--ptr-text-base)',
            letterSpacing: 'var(--ptr-tracking-wide)',
            textTransform: 'uppercase',
            color: 'var(--ptr-primary-soft)',
          }}
        >
          Uniformes profesionales
        </p>
      </div>
    </main>
  );
}
