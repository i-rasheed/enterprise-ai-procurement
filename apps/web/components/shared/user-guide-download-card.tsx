import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export function UserGuideDownloadCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="size-5" aria-hidden />
          User guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-muted-foreground text-sm">
          Read the guide in the repo as Markdown ({siteConfig.links.userGuideMarkdown}) or
          download the PDF for sharing.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <a href={siteConfig.links.userGuide} download="SpendWise-User-Guide.pdf">
              <Download className="size-4" aria-hidden />
              Download PDF
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
