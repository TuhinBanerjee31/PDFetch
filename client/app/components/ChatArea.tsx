'use client';
import React, { useState, useEffect, useRef, FormEvent, KeyboardEvent } from 'react';
import { SendHorizontal, Bot, User, BrainCircuit, LoaderCircle } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

interface ChatAreaProps {}

// --- SUB-COMPONENTS ---

/**
 * Renders the header of the chat interface.
 */
const ChatHeader: React.FC = () => (
  <header className="bg-slate-900/50 backdrop-blur-sm p-4 border-b border-slate-700/50 sticky top-0 z-10">
    <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
      <BrainCircuit className="h-8 w-8 text-sky-400" />
      <div>
        <h1 className="text-xl font-medium text-slate-100 tracking-wider">PDFetch</h1>
        <p className="text-xs text-slate-400 tracking-widest">Powered by LangChain & Qdrant</p>
      </div>
    </div>
  </header>
);

/**
 * Renders a single message bubble with an avatar and animation.
 */
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  return (
    <div
      className={`flex items-start gap-3 animate-fade-in-up ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
          <Bot className="h-5 w-5 text-sky-400" />
        </div>
      )}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-2xl rounded-2xl px-4 py-3 shadow-lg ${
          isUser
            ? 'bg-sky-600 text-white rounded-br-none'
            : 'bg-slate-800 text-slate-200 rounded-bl-none'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.text}</p>
      </div>
        {isUser && (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
          <User className="h-5 w-5 text-slate-300" />
        </div>
      )}
    </div>
  );
};

/**
 * Renders the "Bot is typing..." indicator.
 */
const TypingIndicator: React.FC = () => (
    <div className="flex items-start gap-3 animate-fade-in-up">
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
          <Bot className="h-5 w-5 text-sky-400" />
        </div>
        <div className="bg-slate-800 rounded-2xl rounded-bl-none px-4 py-3 shadow-lg">
             <div className="flex items-center space-x-1.5">
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                 <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
        </div>
    </div>
);


/**
 * Renders the message input area with an auto-resizing textarea.
 */
const ChatInput: React.FC<{
  input: string;
  setInput: (value: string) => void;
  handleSendMessage: (e: FormEvent) => void;
  isLoading: boolean;
}> = ({ input, setInput, handleSendMessage, isLoading }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea height based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);
  
  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as FormEvent);
    }
  };

  return (
    <footer className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-700/50 p-4 sticky bottom-0">
      <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask a question about your documents..."
          className="flex-1 bg-slate-800 text-slate-200 resize-none border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border-slate-700 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all duration-300"
          rows={1}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-sky-600 text-white rounded-full h-12 w-12 flex items-center justify-center flex-shrink-0 hover:bg-sky-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <LoaderCircle className="h-6 w-6 animate-spin" />
          ) : (
            <SendHorizontal className="h-6 w-6" />
          )}
        </button>
      </form>
    </footer>
  );
};

// --- MAIN CHAT COMPONENT ---
const ChatArea: React.FC<ChatAreaProps> = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      text: "Hello! I'm a NO-ONE. Ask me anything about the documents you've provided.",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages, isLoading]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const botMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          text: data.ans || "Sorry, I couldn't get a response.", 
          sender: 'bot' 
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: Message = { 
          id: (Date.now() + 1).toString(), 
          text: "Oops! Something went wrong. Please try again.", 
          sender: 'bot' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 font-sans text-slate-200">
      <ChatHeader />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isLoading && <TypingIndicator />}
      </main>
      <ChatInput
        input={input}
        setInput={setInput}
        handleSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChatArea;