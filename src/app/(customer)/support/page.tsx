'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  userId: string;
}

const SupportPage = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [tickets]);


  useEffect(() => {
    const fetchTickets = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/support-tickets`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setTickets(data);
        } catch (error) {
          console.error('Failed to fetch support tickets', error);
          setResponseMessage('Failed to load previous support tickets.');
        }
      }
    };

    fetchTickets();
  }, [session?.user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/support-tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        setResponseMessage('Your message has been sent successfully!');
        setTickets((prevTickets) => [...prevTickets, result]);
        setFormData({ subject: '', message: '' }); // Reset form
      } else {
        setResponseMessage(result.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      setResponseMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <section className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="py-8 lg:py-16 px-4 mx-auto max-w-screen-md">
        <h2 className="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">
          Support Chat
        </h2>
        <p className="mb-8 lg:mb-16 font-light text-center text-gray-500 dark:text-gray-400 sm:text-xl">
          Have a question? Send us a message!
        </p>

        {/* Chat Display */}
        <div
          ref={chatContainerRef}
          className="h-96 overflow-y-auto mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md"
        >
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`mb-2 p-3 rounded-lg ${
                ticket.userId === session?.user?.id
                  ? 'bg-blue-100 dark:bg-blue-700 text-right'
                  : 'bg-gray-200 dark:bg-gray-700 text-left'
              }`}
            >
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {ticket.userId === session?.user?.id ? 'You' : 'Support Team'} -{' '}
                {formatDate(ticket.createdAt)}
              </div>
              <div className="font-semibold">{ticket.subject}</div>
              <div>{ticket.message}</div>
              {ticket.status === 'resolved' && (
                <div className="text-xs italic text-green-500 dark:text-green-400">Resolved</div>
              )}
            </div>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="subject"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500 dark:shadow-sm-light"
              placeholder="Enter subject"
              required
            />
          </div>
          <div>
            <label
              htmlFor="message"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400"
            >
              Your Message
            </label>
            <textarea
              id="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
              placeholder="Your message..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`py-3 px-5 text-sm font-medium text-center text-white rounded-lg ${
              isSubmitting ? 'bg-gray-500' : 'bg-primary-700 hover:bg-primary-800'
            } sm:w-fit focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800`}
          >
            {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
          {responseMessage && (
            <p
              className={`text-center text-sm mt-4 ${
                responseMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {responseMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default SupportPage;