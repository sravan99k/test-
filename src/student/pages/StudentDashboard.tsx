import React, { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import DashboardStats from "@/components/DashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { db } from "@/integrations/firebase";
import { doc, onSnapshot, collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";


const StudentDashboard = () => {
  const { user } = useAuth();
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high' | null>(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  // Fetch student risk level and alerts from Firestore
  useEffect(() => {
    if (!user) return;

    // FIX: Query by studentUserId instead of assuming doc ID matches Auth UID
    const studentsRef = collection(db, 'students');
    const q = query(studentsRef, where("studentUserId", "==", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setRiskLevel(data.riskLevel || 'low');
        setUnreadAlerts(data.unreadAlerts || 0);
      } else {
        // Default values if no document exists
        setRiskLevel('low');
        setUnreadAlerts(0);
      }
    }, (error) => {
      console.error('Error fetching student data:', error);
    });

    // Cleanup function
    return () => {
      unsubscribe();
    };
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Notification Banner for High Risk or Alerts - Now fetched from Firestore */}
          {(riskLevel === 'high' || unreadAlerts > 0) && (
            <div className="flex items-center gap-3 bg-red-100 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg mb-6 shadow-md" role="alert" aria-live="polite">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
              </svg>
              <span>
                <span className="font-bold">Important:</span> {riskLevel === 'high' ? 'You are currently flagged as high risk. Please reach out to a counselor or trusted adult.' : ''}
                {unreadAlerts > 0 ? ` You have ${unreadAlerts} unread alert(s) or interventions. Please review them.` : ''}
              </span>
            </div>
          )}

          {/* Main Content */}
          <div className="space-y-6">
            <DashboardStats />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default StudentDashboard;
