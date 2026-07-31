import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CourseOverview } from "@/components/course/CourseOverview";
import { courses, getCourseById } from "@/lib/content";

/** Every course is known at build time — pre-render all four. */
export function generateStaticParams() {
  return courses.map((course) => ({ courseId: course.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const course = getCourseById(courseId);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  if (!getCourseById(courseId)) notFound();
  return <CourseOverview courseId={courseId} />;
}
