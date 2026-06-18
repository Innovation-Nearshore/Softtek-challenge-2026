import SolicitudDetalle from "@/components/solicitudes/SolicitudDetalle";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SolicitudDetallePage({ params }: PageProps) {
  const { id } = await params;
  const numericId = parseInt(id, 10);

  return <SolicitudDetalle id={numericId} />;
}
