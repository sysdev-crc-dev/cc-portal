import type { Metadata } from "next";
import EditMaterial from "./page-content";
import { getServerTranslation } from "@/services/i18n";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "admin-panel-materials-edit"
  );

  return {
    title: t("title"),
  };
}

export default EditMaterial;
