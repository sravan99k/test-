import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface AdultCSASlideshowProps {
  onClose: () => void;
}

const AdultCSASlideshow: React.FC<AdultCSASlideshowProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  interface Slide {
    id: number;
    image: string;
    title: string;
    content?: string[];
    customContent?: React.ReactNode;
  }

  const slides: Slide[] = [
    {
      id: 1,
      image: '/images/Adult CSA images/Adult CSA 1.jpg',
      title: 'Definition of CSA',
      content: [
        'Involves a child in sexual activity that is:',
        '• Beyond their understanding',
        '• Without informed consent',
        '• When developmentally unprepared',
        '• Violating laws or societal norms'
      ]
    },
    {
      id: 2,
      image: '/images/Adult CSA images/Adult CSA 2.jpg',
      title: 'Signs of CSA',
      customContent: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-red-700">Behavioral Signs</h3>
            <ul className="space-y-1">
              {['Sudden fears', 'Fear of touch', 'School issues', 'Substance abuse', 'Self-injury'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-red-600 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Physical Signs</h3>
            <ul className="space-y-1">
              {['Sleep disturbances', 'Bedwetting', 'Pain in stomach/genitals', 'UTI', 'Body odour/sores around mouth'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-green-700">Emotional Signs</h3>
            <ul className="space-y-1">
              {['Anger', 'Anxiety, depression', 'Low self-esteem', 'Tics, phobias, obsessions'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 3,
      image: '/images/Adult CSA images/Adult CSA 3.jpg',
      title: 'Types of CSA',
      customContent: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-purple-700">Contact Abuse</h3>
            <ul className="space-y-2">
              {['Penetrative (sexual intercourse)', 'Touching/fondling', 'Making children touch private parts', 'Forcing children to interact sexually'].map((item, i) => (
                <li key={i} className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-amber-700">Non-Contact Abuse</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Pornographic content</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Visual CSA: showing genitals, watching child undress</span>
              </li>
              <li className="flex items-start">
                <span className="text-amber-600 mr-2">•</span>
                <span>Verbal CSA: talking about sex, giving inappropriate information</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 4,
      image: '/images/Adult CSA images/Slide 4.PNG',
      title: 'Statistics: School-going Children',
      content: [
        'A study by Tulir: CPHCSA (2006) among 2,211 school children in Chennai:',
        '👦 Boys – 48%',
        '👧 Girls – 39%',
        '⚠️ Severe Abuse Cases – 15%',
        'These statistics highlight the urgent need for awareness and intervention.'
      ]
    },
    {
      id: 5,
      image: '/images/Adult CSA images/Slide 5.PNG',
      title: 'Statistics: School Girls Survey',
      content: [
        'Sakshi (1997) survey in New Delhi with 350 school girls:',
        '🏠 By Family (both genders) – 63%',
        '👧 Girls (Severe Abuse) – 25%',
        'These findings point to abuse within trusted environments.'
      ]
    },
    {
      id: 6,
      image: '/images/Adult CSA images/Slide 6.PNG',
      title: 'True or False: Gender and CSA',
      content: [
        '❌ FALSE: Only girls are victims of CSA',
        '✅ FACT: Both girls and boys are victims',
        'Survey Data:',
        '👧 Girls: 53%',
        '👦 Boys: 47%',
        'Abuse does not discriminate by gender.'
      ]
    },
    {
      id: 7,
      image: '/images/Adult CSA images/Slide 7.PNG',
      title: 'True or False: CSA Perpetrators',
      content: [
        '❌ FALSE: CSA is committed by strangers in unfamiliar places',
        '✅ FACT: CSA generally occurs:',
        '• In known surroundings (home/school)',
        '• By known people (family/relatives/friends)',
        '85% of cases involve a known perpetrator',
        '📊 63% involve a family member'
      ]
    },
    {
      id: 8,
      image: '/images/Adult CSA images/Adult CSA 3.jpg',
      title: 'Breaking the Silence: Women and Child Sexual Abuse',
      content: [
        '❌ FALSE: Women do not sexually abuse children',
        '✅ FACT:',
        '• Majority of abusers are men (95%)',
        '• A small number are women (5%)',
        '• Both genders can be perpetrators of CSA'
      ]
    },
    {
      id: 9,
      image: '/images/Adult CSA images/Adult CSA 4.jpg',
      title: 'CSA & Pornography',
      content: [
        'Children may be exposed:',
        '• Accidentally',
        '• Through peers or abusers',
        '• Intentional viewing',
        '• May include adult or child exploitation material'
      ]
    },
    {
      id: 10,
      image: '/images/Adult CSA images/Adult CSA 5.jpg',
      title: 'Grooming',
      content: [
        'Abusers gain access by:',
        '• Befriending family',
        '• Building trust with child',
        '• Seeking time alone',
        '• Includes online and in-person interaction',
        '• Often uses threats to maintain secrecy'
      ]
    },
    {
      id: 11,
      image: '/images/Adult CSA images/Adult CSA 6.jpg',
      title: 'Who Is Vulnerable?',
      content: [
        '• Trusting nature of children',
        '• Lack of sex education',
        '• Dysfunctional families, low SES',
        '• Disability',
        '• Social norms: obedience, family honor',
        '• Social isolation'
      ]
    },
    {
      id: 7,
      image: '/images/Adult CSA images/Adult CSA 7.jpg',
      title: 'Why Address CSA?',
      customContent: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-red-700">Long-term psychological effects:</h3>
            <ul className="space-y-1">
              <li>• PTSD (30–50%)</li>
              <li>• Depression (30–40%)</li>
              <li>• Conduct disorder (27%)</li>
              <li>• ADHD (4.3%), OCD (5–8%)</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2 text-blue-700">Can lead to:</h3>
            <ul className="space-y-1">
              <li>• Suicidal thoughts</li>
              <li>• Shame, rage, helplessness</li>
              <li>• Risk of abusive adult relationships</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 8,
      image: '/images/Adult CSA images/Adult CSA 8.PNG',
      title: 'Legal Protection - POCSO Act (2012)',
      customContent: (
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="mb-2"><strong>Applies to all under 18</strong></p>
            <p className="mb-2"><strong>Covers:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Sexual assault</li>
              <li>Sexual harassment</li>
              <li>Use of children in pornography</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Child-friendly procedures:</p>
            <ul className="space-y-1">
              <li>• FIR cannot be refused</li>
              <li>• Media must protect identity</li>
              <li>• Police must file FIR, use neutral locations</li>
              <li>• False case: punishment applies</li>
              <li>• Aggravated offences: when committed by those in authority</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 9,
      image: '/images/Adult CSA images/Adult CSA 9.PNG',
      title: 'Punishments under POCSO',
      customContent: (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b text-left">Offence</th>
                <th className="py-2 px-4 border-b text-left">Sections</th>
                <th className="py-2 px-4 border-b text-left">Punishment</th>
              </tr>
            </thead>
            <tbody>
              {[
                { offence: 'Penetrative Sexual Assault', sections: 'Sec. 3/4', punishment: '7 yrs – Life' },
                { offence: 'Aggravated Penetrative Sexual Assault', sections: 'Sec. 5/6', punishment: '10 yrs – Life' },
                { offence: 'Sexual Assault', sections: 'Sec. 7/8', punishment: '3 – 5 yrs' },
                { offence: 'Aggravated Sexual Assault', sections: 'Sec. 9/10', punishment: '5 – 7 yrs' },
                { offence: 'Sexual Harassment', sections: 'Sec. 11/12', punishment: '3 yrs' },
                { offence: 'Child Pornography', sections: 'Sec. 13/14', punishment: '5 – 7 yrs' },
                { offence: 'Storage of Pornographic Material', sections: 'Sec. 15', punishment: '3 yrs' }
              ].map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{row.offence}</td>
                  <td className="py-2 px-4 border-b">{row.sections}</td>
                  <td className="py-2 px-4 border-b">{row.punishment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    },
    {
      id: 10,
      image: '/images/Adult CSA images/Adult CSA 10.jpg',
      title: 'What Can We Do?',
      content: [
        'Teach children:',
        '• That abuse is never their fault',
        '• That they can say no',
        '• That they will be believed and protected',
        '• Refer to trained professionals in case of abuse'
      ]
    },
    {
      id: 11,
      image: '/images/Adult CSA images/Adult CSA 11.png',
      title: 'Role of Teachers & Schools',
      customContent: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-700">What Can Teachers Do?</h3>
            <p className="font-semibold mb-2">Watch for:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Friend circles</li>
              <li>After-school activities</li>
              <li>Online behavior</li>
              <li>Recognize warning signs and behavior changes</li>
            </ul>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-green-700">What Can Schools Do?</h3>
            <ul className="space-y-2">
              <li>• Create age-appropriate CSA education programs</li>
              <li>• Teach: consent, boundaries, safety</li>
              <li>• Train: students, staff, parents</li>
              <li>• Establish:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>CSA policy</li>
                  <li>Action plan</li>
                  <li>Chain of reporting</li>
                </ul>
              </li>
              <li>• Legal awareness on mandatory reporting</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 12,
      image: '/images/Adult CSA images/Adult CSA 13.jpg',
      title: 'What Not to Do',
      customContent: (
        <div className="space-y-4">
          {[
            '❌ Don\'t blame the child',
            '❌ Don\'t be aggressive',
            '❌ Don\'t ask them to repeat',
            '❌ Don\'t ignore or trivialize',
            '❌ Don\'t disclose publicly',
            '❌ Don\'t confront the abuser in front of child'
          ].map((item, i) => (
            <div key={i} className="flex items-center p-3 bg-red-50 rounded-lg">
              <span className="text-red-600 mr-3 text-xl">❌</span>
              <span className="text-gray-800">{item}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 13,
      image: '/images/Adult CSA images/Adult CSA 13.jpg',
      title: 'PLEDGE',
      customContent: (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg">
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              src="/images/Adult CSA images/Adult CSA 13.jpg" 
              alt="Child safety" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative z-10 p-8">
            <h3 className="text-2xl font-bold mb-6 text-center">I PLEDGE TO KEEP CHILDREN SAFE BY:</h3>
            <div className="space-y-4 text-lg bg-white/10 backdrop-blur-sm p-6 rounded-lg">
              <p className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Learning about child personal safety</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Talking to children about safety</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Ensuring a safe environment</span>
              </p>
              <p className="flex items-start">
                <span className="mr-3 mt-1">•</span>
                <span>Supporting any victim I come across</span>
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const handleClose = () => {
    onClose();
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const { title, content, customContent } = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="relative bg-white rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2 flex-shrink-0">
          <h2 className="text-2xl font-bold text-center text-gray-800">{title}</h2>
        </div>
        
        {/* Main Content Container */}
        <div className="relative flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Navigation Arrow */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 pl-2 md:pl-4">
            <Button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`rounded-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all ${
                currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 md:px-16">
            {customContent ? (
              <div className="w-full">
                {customContent}
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 h-full">
                {/* Image Column */}
                <div className="md:w-1/2 flex-shrink-0 flex items-center justify-center">
                  <div className="w-full h-full max-h-[40vh] md:max-h-[60vh] flex items-center justify-center bg-gray-50 rounded-lg p-4 shadow-inner">
                    <img
                      src={slides[currentSlide].image}
                      alt={title}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        console.error('Image failed to load:', slides[currentSlide].image);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                </div>

                {/* Text Content Column */}
                <div className="md:w-1/2 overflow-y-auto pr-1">
                  <div className="space-y-4 text-gray-700">
                    {content?.map((text, index) => {
                      // Check if the text contains a URL
                      const urlMatch = typeof text === 'string' ? text.match(/https?:\/\/[^\s)]+/) : null;
                      // Only check for phone numbers if not in statistics slides (id: 4 or 5)
                      const isStatisticsSlide = [4, 5].includes(slides[currentSlide].id);
                      const phoneMatch = !isStatisticsSlide && typeof text === 'string' ? text.match(/(\d{3,})/) : null;
                      
                      if (urlMatch) {
                        const url = urlMatch[0];
                        const displayText = text.replace(url, '').trim() || url;
                        return (
                          <p key={index} className="break-words">
                            {text.split(url)[0]}
                            <a 
                              href={url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline break-all"
                            >
                              {displayText}
                            </a>
                          </p>
                        );
                      } else if (phoneMatch) {
                        const phoneNumber = phoneMatch[0];
                        return (
                          <p key={index}>
                            {text.split(phoneNumber)[0]}
                            <a 
                              href={`tel:${phoneNumber}`}
                              className="text-blue-600 hover:underline whitespace-nowrap"
                            >
                              {phoneNumber}
                            </a>
                          </p>
                        );
                      }
                      return <p key={index}>{text}</p>;
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Navigation Arrow */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pr-2 md:pr-4">
            <Button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`rounded-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition-all ${
                currentSlide === slides.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
              }`}
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Footer with slide counter and controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gray-50 border-t gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>Slide {currentSlide + 1} of {slides.length}</span>
            <div className="hidden sm:flex items-center gap-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-indigo-600 scale-125' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
          
          <Button 
            onClick={handleClose} 
            variant="outline" 
            size="sm"
            className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdultCSASlideshow;
