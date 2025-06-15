'use client'

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PolicyType } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    Heading1,
    Heading2,
    Heading3,
    Code,
    Quote
} from 'lucide-react';

const PoliciesPage = () => {
    const [type, setType] = useState<PolicyType | ''>('');
    const [content, setContent] = useState('');
    const [policies, setPolicies] = useState<any[]>([]);
    const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3, 4, 5, 6],
                },
            }),
            Underline,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            setContent(editor.getHTML())
        },
    })

    useEffect(() => {
        fetchPolicies();
    }, []);

    useEffect(() => {
        if (editor) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    const fetchPolicies = async () => {
        try {
            const response = await fetch('/api/policies');
            const data = await response.json();
            setPolicies(data);
        } catch (error) {
            console.error('Error fetching policies:', error);
            toast.error('Failed to fetch policies');
        }
    };

    const handleCreate = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/policies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, content }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create policy');
            }

            toast.success('Policy created successfully!');
            fetchPolicies();
            clearForm();
        } catch (error: any) {
            console.error('Error creating policy:', error);
            toast.error(error.message || 'Failed to create policy');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedPolicy?.id) {
            toast.error('No policy selected to update.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/policies?id=${selectedPolicy.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type, content }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update policy');
            }

            toast.success('Policy updated successfully!');
            fetchPolicies();
            clearForm();
        } catch (error: any) {
            console.error('Error updating policy:', error);
            toast.error(error.message || 'Failed to update policy');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this policy?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/policies?id=${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete policy');
            }

            toast.success('Policy deleted successfully!');
            fetchPolicies();
            clearForm();
        } catch (error: any) {
            console.error('Error deleting policy:', error);
            toast.error(error.message || 'Failed to delete policy');
        } finally {
            setLoading(false);
        }
    };

    const handlePolicySelect = (policy: any) => {
        setSelectedPolicy(policy);
        setType(policy.type);
        setContent(policy.content);
    };

    const clearForm = () => {
        setSelectedPolicy(null);
        setType('');
        setContent('');
    };

    const isAdmin = session?.user?.role === 'admin';

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h1 className="text-3xl font-semibold mb-4">Unauthorized</h1>
                    <p className="text-gray-600">You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <section className="bg-white dark:bg-gray-900 min-h-screen">
            <div className="py-8 px-4 mx-auto max-w-4xl lg:py-16">
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Package className="mr-2 text-primary-700" />
                    Manage Policies
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 sm:gap-6">
                    {/* Policy Form */}
                    <div className="sm:col-span-2">
                        <div className="mb-4">
                            <Label htmlFor="type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Policy Type</Label>
                            <Select onValueChange={(value: PolicyType) => setType(value)} value={type}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select policy type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="terms">Terms of Service</SelectItem>
                                    <SelectItem value="return">Return Policy</SelectItem>
                                    <SelectItem value="cookie">Cookie Policy</SelectItem>
                                    <SelectItem value="privacy">Privacy Policy</SelectItem>
                                    <SelectItem value="privacy">Disclaimer Policy</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="mb-4">
                            <Label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Policy Content</Label>
                            <div className="flex flex-wrap gap-1 mb-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleBold().run()}
                                    disabled={!editor}
                                >
                                    <Bold className="h-4 w-4" />
                                    <span className="sr-only">Toggle Bold</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                                    disabled={!editor}
                                >
                                    <Italic className="h-4 w-4" />
                                    <span className="sr-only">Toggle Italic</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                                    disabled={!editor}
                                >
                                    <UnderlineIcon className="h-4 w-4" />
                                    <span className="sr-only">Toggle Underline</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                                    disabled={!editor}
                                >
                                    <List className="h-4 w-4" />
                                    <span className="sr-only">Toggle Bullet List</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                                    disabled={!editor}
                                >
                                    <ListOrdered className="h-4 w-4" />
                                    <span className="sr-only">Toggle Ordered List</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                                    disabled={!editor}
                                >
                                    <Heading1 className="h-4 w-4" />
                                    <span className="sr-only">Toggle Heading 1</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                                    disabled={!editor}
                                >
                                    <Heading2 className="h-4 w-4" />
                                    <span className="sr-only">Toggle Heading 2</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                                    disabled={!editor}
                                >
                                    <Heading3 className="h-4 w-4" />
                                    <span className="sr-only">Toggle Heading 3</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                                    disabled={!editor}
                                >
                                    <Code className="h-4 w-4" />
                                    <span className="sr-only">Toggle Code Block</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                                    disabled={!editor}
                                >
                                    <Quote className="h-4 w-4" />
                                    <span className="sr-only">Toggle Blockquote</span>
                                </Button>
                            </div>
                            <EditorContent editor={editor} className="prose dark:prose-invert focus:outline-none rounded-md border border-gray-200 dark:border-gray-700 shadow-sm min-h-[150px]" />
                        </div>
                        <div className="flex justify-between">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={selectedPolicy ? handleUpdate : handleCreate}
                                disabled={loading || !type || !content}
                            >
                                {selectedPolicy ? (loading ? 'Updating...' : 'Update Policy') : (loading ? 'Creating...' : 'Create Policy')}
                            </Button>
                            {selectedPolicy && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleDelete(selectedPolicy.id)}
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Delete Policy'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Policy List */}
                    <div className="sm:col-span-2">
                        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Existing Policies</h3>
                        <ul>
                            {policies.map((policy) => (
                                <li
                                    key={policy.id}
                                    className="py-2 px-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                    onClick={() => handlePolicySelect(policy)}
                                >
                                    {policy.type}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PoliciesPage;