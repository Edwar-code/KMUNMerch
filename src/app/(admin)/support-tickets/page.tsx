'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Mail,
    Trash2,
    Edit2,
    Search,
    Check,
    X,
    ClipboardList
} from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type SupportTicket = {
    id: string;
    userId: string;
    subject: string;
    message: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        email: string;
    }
};

const SupportTicketPage = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [deleteTicketId, setDeleteTicketId] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                setLoading(true);
                let url = '/api/support-tickets';
                if (selectedStatus) url += `?status=${selectedStatus}`;

                const response = await fetch(url);
                const data = await response.json();
                setTickets(data);
            } catch (error) {
                console.error('Error fetching support tickets:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchTickets()
    }, [selectedStatus])

    const filteredTickets = tickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDeleteTicket = async (id: string) => {
        try {
            const response = await fetch(`/api/support-tickets?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== id))
                toast.success("Successfully deleted support ticket!")
            } else {
                toast.error("Failed to delete support ticket!")
                console.error('Failed to delete support ticket')
            }
        } catch (error) {
            toast.error("Error deleting support ticket!")
            console.error('Error deleting support ticket:', error)
        }
    }

    const confirmDeleteTicket = (ticketId: string) => {
        setDeleteTicketId(ticketId);
        setOpen(true);
    };

    const handleDeleteTicketConfirmed = async () => {
        setOpen(false);
        try {
            if (!deleteTicketId) {
                console.error('No ticket ID to delete.');
                return;
            }

            const response = await fetch(`/api/support-tickets?id=${deleteTicketId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setTickets(prevTickets => 
                    prevTickets.filter(ticket => ticket.id !== deleteTicketId)
                );
                toast.success('Support ticket deleted successfully!');
            } else {
                console.error('Failed to delete support ticket');
                toast.error('Failed to delete support ticket.');
            }
        } catch (error) {
            console.error('Error deleting support ticket:', error);
            toast.error('Error deleting support ticket.');
        } finally {
            setDeleteTicketId(null);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
            <div className="container mx-auto sm:ml-36 p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                    <div className="w-full md:w-1/2">
                        <form className="flex items-center">
                            <label htmlFor="simple-search" className="sr-only">Search</label>
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </div>
                                <Input 
                                    type="text" 
                                    id="simple-search" 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" 
                                    placeholder="Search support tickets" 
                                />
                            </div>
                        </form>
                    </div>
                    <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <Select onValueChange={setSelectedStatus}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Content Section */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 10 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded mr-3"></div>
                                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {[1, 2, 3].map((btn) => (
                                                <div
                                                    key={btn}
                                                    className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded"
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <AnimatePresence>
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: {
                                            delayChildren: 0.2,
                                            staggerChildren: 0.1,
                                        },
                                    },
                                }}
                            >
                                {filteredTickets.map((ticket) => (
                                    <motion.div
                                        key={ticket.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    <ClipboardList className="mr-3 text-gray-500" />
                                                    {ticket.subject}
                                                </h2>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={() => confirmDeleteTicket(ticket.id)}
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                    </div>
                                            </div>
                                            <AnimatePresence>
                                                 <div className="border-t pt-4 mt-4 dark:border-gray-700">
                                                    <h3 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">
                                                        Information
                                                    </h3>
                                                      <p className="text-sm text-gray-400 italic">
                                                      Email: {ticket.user.email}
                                                    </p>
                                                      <p className="text-sm text-gray-400 italic">
                                                      Status: {ticket.status}
                                                    </p>
                                                </div>
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        {filteredTickets.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No support tickets found.
                            </div>
                        )}
                    </>
                )}
            </div>
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Support Ticket</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this support ticket? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeleteTicketConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

    export default SupportTicketPage