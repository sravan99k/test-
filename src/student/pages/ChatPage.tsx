import { GeminiChat } from "@/components/chat/GeminiChat";
import Footer from "@/components/Footer";

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gray-50">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">NOVO</h1>
          <p className="mt-2 text-gray-600">
            Your personal mental health assistant for support and guidance.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <GeminiChat />
        </div>
      </main>
      <Footer />
    </div>
  );
}
