import Hero from "../Hero";
import Features from "./Features";
import Footer from "./Footer";
import TopicsGrid from "../TopicsGrid";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { OverviewView } from "../school-dashboard/management/overview/OverviewView";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isManagement = user?.role === 'management';

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.title = isManagement ? "Dashboard – Novo Wellness" : "Home – Novo Wellness";
  }, [isManagement]);

  if (isManagement) {
    return (
      <div className={cn(
        "flex flex-col min-h-[calc(100vh-64px)] bg-gray-50/30 transition-opacity duration-300",
        isReady ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex-1 container mx-auto px-6 py-6">
          <OverviewView
            onNavigate={(tab) => navigate(`/management?tab=${tab}`)}
            onLoaded={() => setIsReady(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Hero />
      {!isManagement && (
        <>
          <Features />
          {/* Onboarding / How to Use Section - Only for non-management users */}
          <section className="w-full flex justify-center py-10 px-2">
            <div className="max-w-3xl w-full bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 rounded-2xl shadow-lg p-8 flex flex-col items-center">
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-4">How to Use Novo Wellness</h2>
              <ol className="space-y-4 w-full">
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2z" />
                      <path d="M4 4h16v12H4z" />
                      <path d="M10 4v12" />
                      <path d="M14 8h2" />
                      <path d="M14 12h2" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">1. Explore Features:</span> Discover assessments, resources, support, and progress tracking tailored for you.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
                      <path d="m12 12 4 4 6-6" />
                      <path d="m16 5 3 3" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">2. Take Assessments:</span> Start a mental health check-in or browse wellness tips to begin your journey.
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <path d="M3 3v18h18" />
                      <path d="m19 9-5 5-4-4-3 3" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">3. Track Progress:</span> Monitor your wellbeing with easy-to-read dashboards and celebrate your growth!
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="4" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <path d="M12 17h.01" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-blue-800">4. Get Support:</span> Explore Buddy Safe for confidential reporting.
                  </div>
                </li>
              </ol>
            </div>
          </section>
          <Footer />
        </>
      )}
      {isManagement && <Footer />}
    </div>
  );
};

export default Index;
