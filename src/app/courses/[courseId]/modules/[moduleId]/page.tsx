import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ModuleOverview } from "@/components/course/ModuleOverview";
import { courses, getModuleById, getModulesForCourse } from "@/lib/content";

export function generateStaticParams() {
  return courses.flatMap((course) =>
    getModulesForCourse(course.id).map((module) => ({
      courseId: course.id,
      moduleId: module.id,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}): Promise<Metadata> {
  const { moduleId } = await params;
  const courseModule = getModuleById(moduleId);
  if (!courseModule) return { title: "Module not found" };
  return { title: courseModule.title, description: courseModule.summary };
}

export default async function ModulePage({
  params,
}: {
  params: Promise<{ courseId: string; moduleId: string }>;
}) {
  const { courseId, moduleId } = await params;
  const courseModule = getModuleById(moduleId);
  if (!courseModule || courseModule.courseId !== courseId) notFound();
  return <ModuleOverview courseId={courseId} moduleId={moduleId} />;
}
