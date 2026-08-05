import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { env } from "@/lib/env";

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  authorName: string;
  publishedAt?: string;
};

async function getPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch(`${env.apiUrl}/content/blog`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return [];
    }

    const payload = await response.json();
    return payload.data ?? payload;
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <p className="text-muted-foreground mt-2">Product updates and procurement insights.</p>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {posts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No published posts yet.</p>
        ) : (
          posts.map((post) => (
            <Card key={post.slug}>
              <CardHeader>
                <CardTitle>
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <p className="text-muted-foreground text-xs">
                  {post.authorName}
                  {post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString()}` : ""}
                </p>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">{post.excerpt}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
}
