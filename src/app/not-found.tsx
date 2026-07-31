import Link from "next/link";
import { BrandMark } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <span className="text-primary">
        <BrandMark className="h-6 w-6" />
      </span>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight text-ink">
        We couldn’t find that page.
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The course or module you’re looking for doesn’t exist. It may have been
        renamed, or the lesson may not be available yet.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex h-11 items-center rounded-control bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary-strong"
      >
        Back to all courses
      </Link>
    </div>
  );
}
