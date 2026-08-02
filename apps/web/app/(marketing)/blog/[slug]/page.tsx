import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  authorName: string;
  publishedAt?: string;
};

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`${env.apiUrl}/content/blog/${slug}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } catch {
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <Button variant="ghost" asChild>
        <Link href="/blog">← Back to blog</Link>
      </Button>
      <h1 className="mt-6 text-4xl font-bold">{post.title}</h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {post.authorName}
        {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString()}` : ""}
      </p>
      <div className="prose prose-neutral dark:prose-invert mt-8 max-w-none whitespace-pre-wrap">
        {post.content}
      </div>
    </article>
  );
}
