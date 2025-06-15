'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FileText,
    Trash2,
    Edit2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
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

type Policy = {
    id: string;
    type: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
};

const PoliciesPage = () => {
    const [policies, setPolicies] = useState<Policy[]>([])
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [deletePolicyId, setDeletePolicyId] = useState<string | null>(null);
    const [open, setOpen] = React.useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                setLoading(true);
                let url = '/api/policies';
                if (selectedType) url += `?type=${selectedType}`;

                const response = await fetch(url);
                const data = await response.json();
                setPolicies(data);
            } catch (error) {
                console.error('Error fetching policies:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchPolicies()
    }, [selectedType])

    const handleDeletePolicy = async (id: string) => {
        try {
            const response = await fetch(`/api/policies?id=${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                setPolicies(prevPolicies => prevPolicies.filter(policy => policy.id !== id))
                toast.success("Successfully deleted policy!")
            } else {
                toast.error("Failed to delete policy!")
                console.error('Failed to delete policy')
            }
        } catch (error) {
            toast.error("Error deleting policy!")
            console.error('Error deleting policy:', error)
        }
    }

    const confirmDeletePolicy = (policyId: string) => {
        setDeletePolicyId(policyId);
        setOpen(true);
    };

    const handleDeletePolicyConfirmed = async () => {
        setOpen(false);
        try {
            if (!deletePolicyId) {
                console.error('No policy ID to delete.');
                return;
            }

            const response = await fetch(`/api/policies?id=${deletePolicyId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPolicies(prevPolicies => 
                    prevPolicies.filter(policy => policy.id !== deletePolicyId)
                );
                toast.success('Policy deleted successfully!');
            } else {
                console.error('Failed to delete policy');
                toast.error('Failed to delete policy.');
            }
        } catch (error) {
            console.error('Error deleting policy:', error);
            toast.error('Error deleting policy.');
        } finally {
            setDeletePolicyId(null);
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen max-w-full overflow-x-hidden">
            <div className="container mx-auto sm:ml-36 p-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                     <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                        <Button type="button" onClick={() => router.push('/policies/new')} className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-800">
                            <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 010-2h5V4a1 1 0 011-1z" />
                            </svg>
                            Add Policy
                        </Button>
                        <Select onValueChange={setSelectedType}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="terms">Terms</SelectItem>
                                <SelectItem value="return">Return</SelectItem>
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
                                {policies.map((policy) => (
                                    <motion.div
                                        key={policy.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 20 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
                                    >
                                        <div className="p-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
                                                    <FileText className="mr-3 text-gray-500" />
                                                    {policy.type}
                                                </h2>
                                                <div className="flex space-x-2">
                                                    <Link
                                                        href={`/policies/edit/${policy.id}`}
                                                        className="text-gray-500 hover:text-primary-600 transition"
                                                    >
                                                        <Edit2 size={20} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => confirmDeletePolicy(policy.id)}
                                                        variant="ghost"
                                                        className="text-red-500 hover:text-red-700 transition"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <AnimatePresence>
                                               
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                        {policies.length === 0 && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                No policies found.
                            </div>
                        )}
                    </>
                )}
            </div>
             <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Delete Policy</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this policy? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 flex justify-end space-x-2">
                        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="button" variant="destructive" onClick={handleDeletePolicyConfirmed}>
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default PoliciesPage