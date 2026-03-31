import React from "react";

const ComingSoon = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-3xl font-bold text-blue-700 mb-4">Coming Soon</h1>
        <p className="text-lg text-gray-700 mb-4">AI Therapy will be available soon. Stay tuned for updates!</p>
        <img src="/waiting-illustration.svg" alt="Coming Soon" className="w-48 mx-auto mb-4" />
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition">Go Back</button>
      </div>
    </div>
  );
};

export default ComingSoon;
