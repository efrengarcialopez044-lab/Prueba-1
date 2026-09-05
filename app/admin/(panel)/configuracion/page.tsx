import { getProperty, getPropertyImages } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/Card";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { ImagesManager } from "@/components/admin/ImagesManager";

export default async function AdminSettingsPage() {
  const [property, images] = await Promise.all([getProperty(), getPropertyImages()]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-forest-800">Configuración</h1>
        <p className="mt-1 text-forest-800/60">
          Edita la información de la casa que se muestra en la web.
        </p>
      </div>

      <Card>
        <CardContent>
          <h2 className="mb-4 font-serif text-lg text-forest-800">Fotografías</h2>
          <ImagesManager images={images} />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <SettingsForm property={property} />
        </CardContent>
      </Card>
    </div>
  );
}
