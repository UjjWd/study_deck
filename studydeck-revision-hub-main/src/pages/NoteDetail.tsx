
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const NoteDetail = () => (
  <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 bg-background">
    <Card className="w-full max-w-lg shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle>Note Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">[Full markdown note view with metadata]</p>
      </CardContent>
    </Card>
  </main>
);
export default NoteDetail;
