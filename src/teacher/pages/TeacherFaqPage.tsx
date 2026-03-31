import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, ArrowLeft, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // General Platform Usage
  {
    question: 'How do I navigate the teacher dashboard?',
    answer: 'The teacher dashboard is organized into several sections: Dashboard (overview), Students, Resources, Assessments, and Reports. Use the sidebar menu to navigate between these sections. The main content area will update based on your selection.',
    category: 'General Platform Usage'
  },

  // Student Management
  {
    question: 'How can I track individual student progress?',
    answer: 'Navigate to the "Students" section and click on a specific student\'s name. You\'ll see their detailed progress, including completed assignments, assessment scores, and participation metrics.',
    category: 'Student Management'
  },
  {
    question: 'What should I do if a student is having trouble accessing resources?',
    answer: 'First, verify the student\'s login credentials. If they can log in but can\'t access specific resources, check the resource permissions. If issues persist, contact technical support with the student\'s details and the specific resource they\'re trying to access.',
    category: 'Student Management'
  },

  // Assessments & Grading
  {
    question: 'How do I create and assign assessments?',
    answer: 'Go to the "Assessments" section and click "Create New Assessment." Follow the wizard to set up questions, time limits, and grading criteria. Once created, you can assign it to specific classes or individual students.',
    category: 'Assessments & Grading'
  },
  {
    question: 'Can I customize assessment criteria?',
    answer: 'Yes, when creating or editing an assessment, you can customize the grading rubric, point values, and evaluation criteria to match your specific teaching objectives.',
    category: 'Assessments & Grading'
  },
  {
    question: 'How do I track and record student grades?',
    answer: 'The "Grades" tab in the Assessments section provides a comprehensive gradebook where you can view, edit, and export student grades. You can also generate progress reports from this section.',
    category: 'Assessments & Grading'
  },

  // Technical Support
  {
    question: 'What should I do if a resource won\'t load?',
    answer: 'First, try refreshing the page and clearing your browser cache. If the issue persists, check your internet connection. If the problem continues, note the resource name and any error messages, then report the issue to technical support.',
    category: 'Technical Support'
  },
  {
    question: 'How do I report a technical issue?',
    answer: 'Click the "Help" button in the bottom right corner and select "Report an Issue." Please include detailed information about the problem, any error messages, and steps to reproduce the issue.',
    category: 'Technical Support'
  },
  {
    question: 'Who should I contact for immediate assistance?',
    answer: 'For urgent issues during school hours, contact the IT helpdesk at it-support@school.edu or call (555) 123-4567. For non-urgent matters, please use the support ticket system.',
    category: 'Technical Support'
  },

  // Best Practices
  {
    question: 'How can I effectively use these resources in my lessons?',
    answer: 'Resources are designed to be flexible. You can use them as-is or adapt them to fit your teaching style. Look for the "Implementation Tips" section in each resource for specific suggestions on classroom integration.',
    category: 'Best Practices'
  },
  {
    question: 'Are there recommended ways to track student engagement?',
    answer: 'The platform provides engagement metrics in the Analytics section. Additionally, you can use the built-in participation tracking features during live lessons and review completion rates for assigned materials.',
    category: 'Best Practices'
  },

  // Training & Professional Development
  {
    question: 'Are there training sessions available for new features?',
    answer: 'Yes, we offer monthly webinars and in-person training sessions. Check the "Professional Development" section for upcoming events. Recordings of past sessions are also available.',
    category: 'Training & Professional Development'
  },
  {
    question: 'How can I provide feedback on resources?',
    answer: 'We value your input! Each resource has a feedback button where you can rate it and leave comments. You can also email resources@school.edu with your suggestions.',
    category: 'Training & Professional Development'
  },
  {
    question: 'Where can I find additional teaching resources?',
    answer: 'In addition to the resources section, check out the "Community" tab where teachers share their own materials. You can also find curated external resources in the "Recommended" section.',
    category: 'Training & Professional Development'
  }
];

const TeacherFaqPage: React.FC = () => {
  // Track an open index per category so only one opens per category
  const [openByCategory, setOpenByCategory] = useState<Record<string, number | null>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();

  const toggleAccordion = (category: string, index: number) => {
    setOpenByCategory(prev => ({
      ...prev,
      [category]: prev[category] === index ? null : index,
    }));
  };

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Category accents: color classes
  const categoryAccent: Record<string, { icon: string; headerBg: string; tagColor: string }> = {
    'Student Management': { icon: '', headerBg: 'bg-amber-50', tagColor: 'text-amber-700' },
    'Assessments & Grading': { icon: '', headerBg: 'bg-blue-50', tagColor: 'text-blue-700' },
    'Technical Support': { icon: '', headerBg: 'bg-rose-50', tagColor: 'text-rose-700' },
    'Best Practices': { icon: '', headerBg: 'bg-green-50', tagColor: 'text-green-700' },
    'Training & Professional Development': { icon: '', headerBg: 'bg-blue-50', tagColor: 'text-blue-700' },
    'General Platform Usage': { icon: '', headerBg: 'bg-slate-50', tagColor: 'text-slate-700' },
  };

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const highlight = (text: string, term: string) => {
    if (!term) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, 'ig'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === term.toLowerCase() ? (
            <mark key={i} className="bg-yellow-200 px-0.5 rounded">{part}</mark>
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          )
        )}
      </>
    );
  };

  // Group FAQs by category
  const faqByCategory = faqData.reduce<Record<string, FAQItem[]>>((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {});

  // Filter FAQs based on search term
  const filteredFaqs = Object.entries(faqByCategory)
    .map(([category, items]) => ({
      category,
      items: items.filter(item =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(category => category.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto p-6" id="teacher-tour-faq">
      <div className="mb-6 flex items-center">

        <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
      </div>

           

      <div className="space-y-8">
        {filteredFaqs.map(({ category, items }) => {
          const accent = categoryAccent[category] || { icon: '❓', headerBg: 'bg-gray-50', tagColor: 'text-gray-700' };
          return (
            <div key={category} className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-6">
              <div className={`${accent.headerBg} rounded-lg px-6 py-4 mb-2`}>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <span aria-hidden>{accent.icon}</span>
                  <span className={accent.tagColor}>{category}</span>
                </h2>
              </div>
              <div className="divide-y divide-gray-200">
                {items.map((faq, index) => {
                  const isOpen = openByCategory[category] === index;
                  return (
                    <div key={`${category}-${index}`} className="px-4 py-3 sm:px-6 sm:py-4">
                      <button
                        className="flex justify-between items-center w-full text-left focus:outline-none"
                        onClick={() => toggleAccordion(category, index)}
                        aria-expanded={isOpen}
                      >
                        <h3 className="text-lg font-medium text-gray-900">
                          {highlight(faq.question, searchTerm)}
                        </h3>
                        {isOpen ? (
                          <ChevronUp className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        )}
                      </button>
                      <div
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
                          }`}
                        aria-hidden={!isOpen}
                      >
                        <div className="text-gray-600">
                          <p>{highlight(faq.answer, searchTerm)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TeacherFaqPage;
