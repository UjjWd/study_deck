
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const Settings = () => (
  <main className="flex min-h-[80vh] flex-col items-center justify-center p-8 bg-background">
    <Card className="w-full max-w-lg shadow-md animate-fade-in">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">[Profile, password, AI features, etc]</p>
      </CardContent>
    </Card>
  </main>
);
export default Settings;
