import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User, X, MessageCircle, Mic, MicOff, ArrowUp } from 'lucide-react';
import { generateResponse } from '@/services/geminiService';
import { analyzeMessage } from '@/services/triggerAnalysisService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase';

// SpeechRecognition types for TS
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): ISpeechRecognition;
      prototype: ISpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): ISpeechRecognition;
      prototype: ISpeechRecognition;
    };
  }
}

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'sent' | 'error';
};

// Utility function to convert text URLs to clickable links
const parseMessageContent = (content: string) => {
  // Split content by URLs and non-URLs
  const parts = content.split(/(\/teacher\/resources\/[\w-]+|\/resources\/[\w-]+|\/games\/[\w-]+)/g);

  return parts.map((part, index) => {
    // Check if this part is a URL
    if ((part.startsWith('/teacher/resources/') || part.startsWith('/resources/') || part.startsWith('/games/')) && part.length > 1) {
      // Extract the last part of the URL for display and format it nicely
      const parts = part.split('/').filter(Boolean);
      let displayText = parts[parts.length - 1].replace(/-/g, ' ');

      // Capitalize first letter of each word for better display
      displayText = displayText.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      return (
        <a
          key={index}
          href={part}
          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          target="_blank"
          rel="noopener noreferrer"
        >
          {displayText}
        </a>
      );
    }
    return part;
  });
};

// Chat message UI
const ChatMessage = memo(({ message }: { message: Message }) => {
  return (
    <div className={`flex mb-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full flex-shrink-0 
          ${message.role === 'user' ? 'bg-teal-500 ml-2' : 'bg-transparent mr-2'}`}>
          {message.role === 'user'
            ? <User className="w-5 h-5 text-white" />
            : <img src="/you.png" alt="BuddyBot" className="w-10 h-10 rounded-full object-cover" />}
        </div>
        <div
          className={`p-3 rounded-lg
          ${message.role === 'user'
              ? 'bg-teal-100 text-gray-800 rounded-tr-none'
              : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
            }`}>
          <p className="whitespace-pre-wrap">
            {parseMessageContent(message.content)}
          </p>
          {message.status === 'error' && (
            <p className="text-xs text-red-500 mt-1">Failed to send. Please try again.</p>
          )}
        </div>
      </div>
    </div>
  );
});

// Animated loading indicator for bot
const LoadingDots = () => (
  <div className="flex space-x-2">
    {[0, 150, 300].map((delay) => (
      <div
        key={delay}
        className="w-2 h-2 rounded-full bg-gray-300 animate-bounce"
        style={{ animationDelay: `${delay}ms` }}
      />
    ))}
  </div>
);

interface GeminiChatProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const GeminiChat = ({ isOpen: externalIsOpen, onOpenChange }: GeminiChatProps = {}) => {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([{
    id: `welcome-${Date.now()}`,
    role: 'assistant',
    content: "Hi! I'm here to help. How can I assist you today?",
    timestamp: Date.now(),
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise internal
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

  const { user } = useAuth();

  // Speech recognition/refs
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);

  // Speech recognition support check
  useEffect(() => {
    setHasSpeechRecognition('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }, []);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [messages]);

  // Focus input when chat is opened or when messages change
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Use setTimeout to ensure the chat is fully rendered before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = '32px';
      inputRef.current.style.height = `${Math.max(32, Math.min(inputRef.current.scrollHeight, 200))}px`;
    }
  }, [input]);

  // Speech recognition effect
  useEffect(() => {
    if (!hasSpeechRecognition) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    let recognition: ISpeechRecognition;
    try {
      recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) setInput(prev => (prev ? prev + ' ' : '') + finalTranscript.trim());
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied.');
        }
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    } catch {
      setHasSpeechRecognition(false);
    }
    return () => recognition && recognition.stop();
  }, [hasSpeechRecognition]);

  // Voice input toggle
  const toggleVoiceInput = useCallback(() => {
    if (!recognitionRef.current || !hasSpeechRecognition) {
      alert('Speech recognition not supported in your browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      // Add a small delay before focusing to ensure the input is ready
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
      inputRef.current?.focus();
    }
  }, [isListening, hasSpeechRecognition]);

  // Send chat message
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: Date.now(),
      status: 'sending'
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Analyze message for triggers (students only, runs async in background)
    if (user?.role === 'student' && user?.uid) {
      analyzeStudentMessage(messageContent, user.uid).catch(err => {
        console.error('[GeminiChat] Trigger analysis failed:', err);
      });
    }

    try {
      // Update user message status to sent and add loading assistant message
      const assistantMessageId = `msg-${Date.now()}-assistant`;
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        { ...userMessage, status: 'sent' },
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '...',
          timestamp: Date.now(),
        }
      ]);

      // Stream the response
      const stream = generateResponse(
        messageContent,
        messages.map(msg => ({ role: msg.role, content: msg.content })),
        user?.role === 'teacher' ? 'teacher' : 'student'
      );

      let fullResponse = '';
      let isFirstChunk = true;
      let displayedText = '';
      let bufferQueue = '';
      let isStreaming = false;

      // Function to display text letter by letter
      const displayNextChar = () => {
        if (bufferQueue.length > 0) {
          const char = bufferQueue[0];
          bufferQueue = bufferQueue.slice(1);
          displayedText += char;

          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: displayedText }
                : msg
            )
          );

          // Continue displaying if there's more in the buffer
          if (bufferQueue.length > 0 || isStreaming) {
            setTimeout(displayNextChar, 20); // 20ms per character for smooth effect
          }
        } else if (isStreaming) {
          // Wait a bit and check again if still streaming
          setTimeout(displayNextChar, 50);
        }
      };

      // Consume the stream and buffer chunks
      (async () => {
        isStreaming = true;

        for await (const chunk of stream) {
          // On first chunk: replace loading message with actual content
          if (isFirstChunk) {
            setIsLoading(false);
            isFirstChunk = false;

            // Start displaying characters
            bufferQueue = chunk;
            displayNextChar();
          } else {
            // Add chunk to buffer
            bufferQueue += chunk;
          }

          fullResponse += chunk;
        }

        isStreaming = false;
      })();
    } catch (error) {
      setMessages(prev => [
        ...prev.filter(msg => msg.id !== userMessage.id),
        {
          ...userMessage,
          status: 'error',
          content: "I'm sorry, I encountered an error processing your message. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, user?.role]);

  // Analyze student message for concerning content
  const analyzeStudentMessage = async (message: string, userId: string) => {
    try {
      // Get user document to extract student metadata
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        console.warn('[GeminiChat] User document not found for trigger analysis');
        return;
      }

      const userData = userDocSnap.data();
      const studentId = userData.studentId;
      const schoolId = userData.schoolId;
      const adminId = userData.parentAdminId;
      const organizationId = userData.organizationId;

      // Need at least studentId, schoolId, and adminId to log triggers
      if (!studentId || !schoolId || !adminId) {
        console.warn('[GeminiChat] Missing student metadata for trigger analysis');
        return;
      }

      // Get student name from demographics or user data
      const studentName = userData.name ||
        `${userData.firstName || ''} ${userData.lastName || ''}`.trim() ||
        'Unknown Student';

      // Analyze the message
      const result = await analyzeMessage(message, {
        studentId,
        studentName,
        userId,
        schoolId,
        organizationId,
        adminId,
      });

      if (result.isTrigger) {
        console.log('[GeminiChat] Trigger detected:', {
          severity: result.severity,
          category: result.category,
          reason: result.reason
        });
      }
    } catch (error) {
      console.error('[GeminiChat] Error in trigger analysis:', error);
    }
  };

  // Floating open chat button
  if (!isOpen) {
    return (
      <button
        id="onboarding-buddybot"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-teal-600 text-white p-4 rounded-full shadow-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        aria-label="Open chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 cursor-pointer"
        onClick={() => setIsOpen(false)}
        aria-label="Close chat overlay"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Escape' && setIsOpen(false)}
      />
      {/* Chat Box */}
      <div
        id="onboarding-buddybot-chat"
        className="fixed bottom-6 right-6 left-6 sm:left-auto z-50 sm:w-96 w-auto max-w-md h-[500px] max-h-[calc(100vh-3rem)] flex flex-col bg-white rounded-lg shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">BuddyBot</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-teal-700 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-600"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col" aria-live="polite">
          <div className="flex-1 min-h-0">
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-transparent mr-2 flex items-center justify-center flex-shrink-0">
                    <img src="/you.png" alt="BuddyBot" className="w-8 h-8 rounded-full object-cover" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg rounded-tl-none p-3">
                    <LoadingDots />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        </div>
        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 bg-white" aria-label="Chat input form">
          <div className="relative flex items-center gap-2 bg-gray-100 p-1.5 rounded-[26px] border border-gray-200 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
              }}
              placeholder={hasSpeechRecognition
                ? (isListening ? 'Listening...' : 'Message BuddyBot...')
                : 'Message BuddyBot...'
              }
              className="flex-1 max-h-[200px] min-h-[24px] py-2 px-4 bg-transparent border-none focus:outline-none focus:ring-0 resize-none text-gray-800 placeholder:text-gray-500 leading-normal text-sm overflow-hidden"
              rows={1}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
              disabled={isLoading}
              style={{ height: '32px' }} // Initial height
            />

            <div className="flex items-center gap-1 pr-1">
              {hasSpeechRecognition && (
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2 rounded-full hover:bg-gray-200 transition-colors
                  ${isListening ? 'text-red-500 animate-pulse bg-red-50' : 'text-gray-500'}`}
                  title={isListening ? 'Stop listening' : 'Start voice input'}
                  aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                  disabled={isLoading}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-full transition-all duration-200 flex items-center justify-center
                  ${input.trim()
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                aria-label="Send message"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              BuddyBot can make mistakes. Check important info.
            </p>
          </div>
        </form>
      </div>
    </>
  );
};
