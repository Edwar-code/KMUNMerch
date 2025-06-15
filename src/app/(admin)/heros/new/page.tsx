'use client'

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Upload, ImagePlus, X } from 'lucide-react';

// Define Zod schema for form validation
import * as z from "zod";
const heroSchema = z.object({
    title: z.string().min(3, { message: "Title must be at least 3 characters." }),
    subtitle: z.string().optional(),
    images: z.array(z.string()).min(1, { message: "At least one image is required." }),
    link: z.string().url({ message: "Link must be a valid URL." }).optional(),
    isActive: z.boolean().default(true),
});

type HeroSchemaType = z.infer<typeof heroSchema>;

const HeroNewPage = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [images, setImages] = useState<string[]>([]); // Store image URLs
    const [uploadingImages, setUploadingImages] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [link, setLink] = useState('');
    const [isActive, setIsActive] = useState(true);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []); // Ensure files is always an array
        if (!files || files.length === 0) return;

        setUploadingImages(true);

        try {
            const uploadedImageUrls: string[] = [];

            for (const file of files) {
                if (!file.type.startsWith('image/')) {
                    toast.error(`File ${file.name} is not an image.`);
                    continue; // Skip non-image files, but continue processing others
                }

                if (file.size > 5 * 1024 * 1024) {
                    toast.error(`File ${file.name} is too large. Max size is 5MB.`);
                    continue; // Skip large files, but continue processing others
                }

                const formData = new FormData();
                formData.append('file', file);

                const uploadResponse = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    toast.error(`Failed to upload ${file.name}: ${errorData.error || 'Unknown error'}`);
                    continue; // Skip failed uploads, but continue processing others
                }

                const uploadData = await uploadResponse.json();
                uploadedImageUrls.push(uploadData.url);
            }

            // Update state with new image URLs, appending to existing ones
            setImages(prevImages => [...prevImages, ...uploadedImageUrls]);
            toast.success('Images uploaded successfully!');

        } catch (error: any) {
            console.error('Error uploading images:', error);
            toast.error(error.message || 'Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset the file input to allow re-uploading the same file
            }
        }
    };

    const removeImage = (index: number) => {
        setImages(prevImages => prevImages.filter((_, i) => i !== index));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            heroSchema.parse({ title, subtitle, images, link, isActive }); // Validate form data

            const heroData = {
                title,
                subtitle,
                image: images[0], //take the first image as the image
                images: images,
                link,
                isActive,
            };

            const response = await fetch('/api/heros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(heroData),
            });

            if (response.ok) {
                toast.success('Hero created successfully!');
                router.push('/heros'); // Redirect to the heros list page
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || 'Failed to create hero.');
            }
        } catch (error: any) {
            console.error('Error creating hero:', error);
            if (error instanceof z.ZodError) {
                // If it's a ZodError, display the first error message
                toast.error(error.errors[0].message);
            } else {
                // For other errors, display a generic message
                toast.error(error.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
            <div className="mx-auto max-w-screen-md px-4 lg:px-12">
                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <h2 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                            Create New Hero
                        </h2>

                        <form onSubmit={onSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Hero Title"
                                />
                            </div>

                            <div>
                                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Subtitle
                                </label>
                                <Textarea
                                    id="subtitle"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    rows={3}
                                    className="mt-1 p-2 w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm resize-none dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Hero Subtitle (Optional)"
                                />
                            </div>


                            <div className="sm:col-span-2">
                                <label htmlFor="images" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white flex items-center">
                                    <Upload className="mr-2 text-primary-700" />
                                    Upload Images
                                </label>
                                <motion.label
                                    htmlFor="images"
                                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-300 group"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImagePlus
                                            className="w-10 h-10 mb-3 text-gray-400 group-hover:text-primary-600 transition-colors"
                                        />
                                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="font-semibold">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            PNG or JPG (MAX. 5MB)
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        id="images"
                                        ref={fileInputRef}
                                        multiple
                                        accept="image/png, image/jpeg"
                                        onChange={handleImageUpload}
                                        disabled={uploadingImages}
                                        className="hidden"
                                    />
                                </motion.label>

                                {uploadingImages && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 text-sm text-gray-500 flex items-center"
                                    >
                                        <Upload className="mr-2 animate-spin" />
                                        Uploading images...
                                    </motion.div>
                                )}

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {images.map((image, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="relative group"
                                        >
                                            <Image
                                                width={200}
                                                height={200}
                                                src={image}
                                                alt={`Uploaded preview ${index + 1}`}
                                                className="w-full h-auto rounded-lg object-cover"
                                            />
                                            <motion.button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                whileHover={{ rotate: 90 }}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                                                aria-label="Remove image"
                                            >
                                                <X className="w-4 h-4" />
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>



                            <div>
                                <label htmlFor="link" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Link URL (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="link"
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="mt-1 p-2 w-full border rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    placeholder="Link URL"
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <label htmlFor="isActive" className="text-base font-medium text-gray-700 dark:text-gray-300">Active</label>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Should this hero be displayed?
                                    </p>
                                </div>
                                <Switch
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                    id="isActive"
                                />
                            </div>


                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Hero"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroNewPage;