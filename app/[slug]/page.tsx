import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Page from "@/models/Page";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function PublicPage({ params }: Props) {
  const { slug } = await params;

  const normalizedSlug = `/${slug.replace(/^\/+|\/+$/g, "")}`;

  await connectDB();

  const page = await Page.findOne({
    slug: normalizedSlug,
    status: "published",
  }).lean();

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <article className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="mb-8 text-4xl font-bold tracking-tight">
          {page.title}
        </h1>

        <div
          className="prose prose-lg max-w-none text-black"
          dangerouslySetInnerHTML={{
            __html: page.content || "",
          }}
        />
      </article>
    </main>
  );
}