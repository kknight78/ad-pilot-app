import Header from "@/components/Header";
import Chat from "@/components/Chat";
import { getClientConfig } from "@/lib/client-config";

export default function Home() {
  const config = getClientConfig();

  return (
    <main className="min-h-screen flex flex-col">
      <Header clientName={config.clientName} />
      <Chat />
    </main>
  );
}
