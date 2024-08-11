import type { Metadata } from "next";
import { getServerTranslation } from "@/services/i18n";
import Projects from "./page-content";

type Props = {
  params: { language: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { t } = await getServerTranslation(
    params.language,
    "operation-panel-projects"
  );

  return {
    title: t("title"),
  };
}

export default Projects;
