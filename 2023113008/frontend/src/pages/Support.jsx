import { useState, useEffect, useRef } from 'react';
import Header from '../Header';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyBjpmPtTUJvAGiMTQ-w3zZr0Nod5yMgXRs');

export default function Support() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                role: 'assistant',
                content: 'Hello! Welcome to IIIT Buy/Sell Support. How can I help you today?'
            }]);
        }
    }, []);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const chat = model.startChat({
                generationConfig: {
                    maxOutputTokens: 200,
                }
            });

            const result = await chat.sendMessage(input);
            const response = await result.response;
            const responseText = await response.text();
            
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: responseText.replace(/\*/g, '')
            }]);
        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-200">
            <Header />
            <div className="container mx-auto px-4 py-8">
                <div className="bg-gray-800 rounded-2xl p-6 shadow-lg text-white min-h-[80vh] flex flex-col">
                    <h1 className="text-3xl font-serif mb-6">Support Chat</h1>
                    <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-700 rounded-lg">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[70%] rounded-lg p-3 ${
                                    msg.role === 'user' 
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-300 text-black'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-300 text-black rounded-lg p-3">
                                    Typing...
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <input
                            type="text"
                            className="flex-1 p-2 border border-gray-300 rounded-lg"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg disabled:bg-gray-400"
                            onClick={handleSendMessage}
                            disabled={isLoading || !input.trim()}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}