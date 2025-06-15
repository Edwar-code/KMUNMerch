'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImagePlus, Upload, Tag } from 'lucide-react';
import { toast } from 'sonner';
import {
    Input
} from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { Textarea } from "@/components/ui/textarea"

const CreateCategoryPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [uploadingImages, setUploadingImages] = useState(false);

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingImages(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setImage(data.url);
                toast.success('Image uploaded successfully!');
            } else {
                const errorData = await response.json();
                toast.error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Failed to upload image');
        } finally {
            setUploadingImages(false);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        const payload = {
            name: name,
            description: description,
            image: image,
        };

        try {
            const response = await fetch('/api/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
              const errorData = await response.json();
              toast.error(`Failed to upload image: ${errorData.error || 'Unknown error'}`);
                throw new Error('Failed to add category');
            }

            toast.success('Category added successfully! Redirecting...');
            setTimeout(() => {
                router.push('/categories');
            }, 2000);
        } catch (error) {
            console.error('Error submitting category:', error);
             toast.error('Category not created')
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-white dark:bg-gray-900 min-h-screen">
            <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Tag className="mr-2 text-primary-700" />
                    Add a new category
                </h2>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 sm:grid-cols-1 sm:gap-6">
                        <div>
                            <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category Name</Label>
                            <Input
                                type="text"
                                name="name"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Type category name"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Your description here"
                            ></Textarea>
                        </div>
                           {/* Image Upload */}
                            <div className="grid grid-cols-1 items-center gap-4">
                                <Label htmlFor="image" className="block text-sm font-medium text-gray-700">
                                    Upload Image
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="file"
                                        id="image"
                                        name="image"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />
                                    <motion.div
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="cursor-pointer"
                                    >
                                        <Label
                                            htmlFor="image"
                                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            {uploadingImages ? (
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-4 text-gray-500 animate-bounce" />
                                                    <p className="text-sm text-gray-500">Uploading...</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <ImagePlus className="w-8 h-8 mb-4 text-gray-500" />
                                                    <p className="mb-2 text-sm text-gray-500">
                                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                                    </p>
                                                    <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
                                                </div>
                                            )}
                                        </Label>
                                    </motion.div>
                                </div>
                                {image && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="relative w-full h-48 mt-4"
                                    >
                                        <Image
                                            src={image}
                                            alt={name || 'Category image'}
                                            fill
                                            className="rounded-lg object-cover"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                    </motion.div>
                                )}
                            </div>

                    </div>
                    <Button
                        type="submit"
                        disabled={loading}
                        className={`inline-flex items-center justify-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-primary-700'} rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800`}
                    >
                        {loading ? 'Adding...' : 'Add Category'}
                    </Button>
                </form>
            </div>
        </section>
    );
};

export default CreateCategoryPage;