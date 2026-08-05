import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-bold">Contact sales & support</h1>
      <p className="text-muted-foreground mt-2">
        Reach our team for enterprise plans, security reviews, or deployment assistance.
      </p>
      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Email <a href="mailto:sales@spendwise.app">sales@spendwise.app</a> for Enterprise pricing and AWS deployment support.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Support</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            Existing customers can open tickets from the in-app support center after signing in.
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
