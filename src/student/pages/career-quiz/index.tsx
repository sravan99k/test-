import React from 'react';
import { Helmet } from 'react-helmet';


const CareerQuizPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Career Explorer Quiz | Novo Wellness</title>
        <meta
          name="description"
          content="Take our career exploration quiz to discover your ideal career path based on your interests and strengths."
        />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Future Explorers Academy</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Embark on an adventure to discover your ideal career path. Complete all missions to reveal your top career clusters!
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
            {/* <CareerQuiz /> */}
            <div className="text-center p-8 bg-blue-50 rounded-lg">
              <p className="text-gray-600 italic">Career explorer modules are being updated. Please check back soon!</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CareerQuizPage;
