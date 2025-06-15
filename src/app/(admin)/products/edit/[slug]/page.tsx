'use client'

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ImagePlus, X, Upload, Package, Layers, Plus, Minus, Ruler, Box } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Variation {
    id?: string; 
    name: string;
    options: string[];
    productId?: string;
    stock: { [key: string]: number }; 
}

interface Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    categoryId: string;
    images: string[];
    stock: number;
    variations: Variation[];
}

interface Category {
    id: string;
    name: string;
}

// Skeleton UI Component
const Skeleton = () => (
    <div className="animate-pulse">
        <div className="h-6 bg-gray-300 rounded-md mb-4"></div> {/* Product Name */}
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-6">
            <div className="h-6 bg-gray-300 rounded-md"></div> {/* Price */}
            <div className="h-6 bg-gray-300 rounded-md"></div> {/* Category */}
            <div className="sm:col-span-2 h-24 bg-gray-300 rounded-md"></div> {/* Description */}
            <div className="sm:col-span-2 h-12 bg-gray-300 rounded-md"></div> {/* Variations Header */}
            <div className="sm:col-span-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-transparent dark:border-dashed">
                        <div className="h-6 bg-gray-300 rounded-md mb-4"></div> {/* Variation Name */}
                        {[...Array(2)].map((_, j) => (
                            <div key={j} className="flex items-center gap-2 mb-2">
                                <div className="h-6 bg-gray-300 rounded-md w-1/2"></div> {/* Option Value */}
                                <div className="h-6 bg-gray-300 rounded-md w-1/4"></div> {/* Stock */}
                            </div>
                        ))}
                        <div className="h-6 bg-gray-300 rounded-md mt-3"></div> {/* Add Option Button */}
                    </div>
                ))}
                <div className="h-6 bg-gray-300 rounded-md"></div> {/* Add Variation Button */}
            </div>
            <div className="sm:col-span-2 h-6 bg-gray-300 rounded-md"></div> {/* Standalone Stock */}
            <div className="sm:col-span-2 h-24 bg-gray-300 rounded-md"></div> {/* Image Upload Area */}
        </div>
        <div className="h-10 bg-gray-300 rounded-md mt-4"></div> {/* Submit Button */}
    </div>
);


const EditProductPage = () => {
    const [variations, setVariations] = useState<Variation[]>([]);
    const [initialProductVariations, setInitialProductVariations] = useState<Variation[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [name, setProductName] = useState('');
    const [price, setPrice] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [images, setImages] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [standaloneStock, setStandaloneStock] = useState<number | ''>('');
    const [productId, setProductId] = useState<string | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); 

    const pathname = usePathname();
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/api/categories');
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const categoryData = await response.json();
                setCategories(categoryData);
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                toast.error('Failed to fetch categories.');
            }
        };


        const slug = pathname.split('/').pop() || null;

        const fetchProduct = async (slug: string | null) => {
            if (!slug) return;
            try {
                const response = await fetch(`/api/products?slug=${slug}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                if (data.products && data.products.length > 0) {
                    const product = data.products[0] as Product; // Type assertion
                    setProductId(product.id);
                    setProductName(product.name);
                    setDescription(product.description);
                    setPrice(product.price);
                    setCategoryId(product.categoryId);
                    setImages(product.images);

                    if (product.variations && product.variations.length > 0) {
                        setVariations(product.variations.map(v => ({
                            id: v.id,
                            name: v.name,
                            options: v.options || [''], 
                            stock: v.stock || {}, 
                            productId: v.productId,
                        })));
                        setInitialProductVariations(product.variations)
                    } else {
                        setStandaloneStock(product.stock);
                    }
                    setIsDataLoaded(true); 
                } else {
                    toast.error('Product not found.');
                    router.push('/products');
                }
            } catch (error) {
                console.error('Failed to fetch product:', error);
                toast.error('Failed to fetch product.');
            }
        };
        fetchCategories();
        fetchProduct(slug);
    }, [router, pathname]);


    const addVariation = () => {
        setVariations([...variations, { name: '', options: [''], stock: {} }]);
    };

    const removeVariation = (variationIndex: number) => {
        const updatedVariations = [...variations];
        const variationToRemove = updatedVariations[variationIndex];

        setVariations(updatedVariations.filter((_, index) => index !== variationIndex));
    };

    const updateVariationName = (variationIndex: number, name: string) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].name = name;
        setVariations(updatedVariations);
    };

    const addOption = (variationIndex: number) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].options.push('');
        setVariations(updatedVariations);
    };

    const removeOption = (variationIndex: number, optionIndex: number) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].options = updatedVariations[variationIndex].options.filter((_, index) => index !== optionIndex);
        setVariations(updatedVariations);
    };

    const updateOption = (variationIndex: number, optionIndex: number, value: string) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].options[optionIndex] = value;
        setVariations(updatedVariations);
    };

    const updateStock = (variationIndex: number, option: string, value: number) => {
        const updatedVariations = [...variations];
        updatedVariations[variationIndex].stock[option] = value;
        setVariations(updatedVariations);
    };

    const getTotalStock = (): number => {
        return variations.reduce((total, variation) => {
            if (!variation.stock) return total; 
            return total + Object.values(variation.stock).reduce((sum, value) => sum + value, 0);
        }, 0);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setUploadingImages(true);

        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                if (!file.type.startsWith('image/')) {
                    throw new Error(`${file.name} is not an image file`);
                }

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(`${file.name} is too large (max 5MB)`);
                }

                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Upload failed');
                }

                const data = await response.json();
                return data.url;
            });

            const results = await Promise.all(uploadPromises);
            setImages([...images, ...results]);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Upload failed');
        } finally {
            setUploadingImages(false);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Validation checks
        if (images.length === 0) {
            toast.error('At least one image is required.');
            return;
        }

        if (!categoryId) {
            toast.error('Category is required.');
            return;
        }

        if (variations.length === 0 && (standaloneStock === '' || standaloneStock === null)) {
            toast.error('Stock is required when there are no variations.');
            return;
        }

        if(variations.length > 0) {
           for (const variation of variations) {
               if (!variation.name) {
                   toast.error('Variation name is required.');
                   return;
               }
               if (variation.options.some(option => !option)) {
                   toast.error('All variation options are required.');
                   return;
               }
               for (const option in variation.stock) {
                   if (variation.stock[option] === null || variation.stock[option] === undefined) {
                       toast.error('All variation stock values are required.');
                       return;
                   }
               }

           }
        }
        setLoading(true);

         // Transform variations to match Prisma schema
         const transformedVariations = variations.map(variation => ({
            id: variation.id, // Keep the ID
            name: variation.name,
            options: variation.options.filter(option => option.trim() !== ''),
            productId: productId || undefined,
            stock: variation.stock // Include stock data in the transformed variations
        }));

        const payload: any = { // Use 'any' for now, will define a more specific type if needed
            name,
            slug: name.toLowerCase().replace(/ /g, '-'),
            description,
            price: Number(price),
            categoryId,
            images,
            stock: variations.length > 0 ? getTotalStock() : Number(standaloneStock), // Use variation stock if variations exist, else use standalone stock.
        };

         if (transformedVariations.length > 0) {
            payload.variations = {
                create: transformedVariations
                    .filter(v => !v.id) // Create new variations
                    .map(variation => ({
                        name: variation.name,
                        options: variation.options,
                    })),
                update: transformedVariations
                    .filter(v => v.id) // Update existing variations
                    .map(variation => ({
                        where: { id: variation.id },
                        data: {
                            name: variation.name,
                            options: variation.options,
                        },
                    })),
                delete: [],
            };

             // Delete variations if product originally had variations and it wasn't edited
            if (initialProductVariations.length > variations.length) {
                const variationsToDelete = initialProductVariations.filter(
                    (initialVariation) => !variations.find((editedVariation) => editedVariation.id === initialVariation.id)
                );

                payload.variations.delete = variationsToDelete.map((variation) => ({ id: variation.id }));
            }
        } else {
            //Delete all variations from the product if there are no variations in the product
            if (initialProductVariations.length) {
                payload.variations = {
                    delete: initialProductVariations.map((variation) => ({ id: variation.id })),
                };
            }
        }

        try {
            if (!productId) {
                toast.error('Product ID is missing. Cannot update.');
                return;
            }

            const response = await fetch(`/api/products?id=${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to update product');
            }

            toast.success('Product updated successfully! Redirecting...');
            setTimeout(() => {
                router.push('/products');
            }, 3000);
        } catch (error) {
            console.error('Error submitting product:', error);
            toast.error('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const totalVariationStock = getTotalStock();

    return (
        <section className="bg-white dark:bg-gray-900 min-h-screen">
            <div className="py-8 px-4 mx-auto max-w-2xl lg:py-16">
                <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Package className="mr-2 text-primary-700" />
                    Edit Product
                </h2>

                {/* Conditional rendering based on data loading */}
                {!isDataLoaded ? (
                    <Skeleton />
                ) : (
                    <>
                        {toastMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg flex items-center"
                            >
                                {toastMessage}
                            </motion.div>
                        )}
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-6 sm:grid-cols-2 sm:gap-6">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Product Name</Label>
                                    <Input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Type product name"
                                        required
                                    />
                                </div>

                                <div className="w-full">
                                    <Label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Price</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            name="price"
                                            id="price"
                                            value={price}
                                            onChange={(e) => setPrice(Number(e.target.value))}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 pl-7 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            placeholder="2999"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="categoryId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Category</Label>
                                    <Select value={categoryId} onValueChange={(value) => setCategoryId(value)} required>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="sm:col-span-2">
                                    <Label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Description</Label>
                                    <Textarea
                                        id="description"
                                        rows={8}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block p-2.5 w-full text-sm text-gray-900 dark:bg-gray-700 rounded-lg border border-gray-300 focus:ring-primary-700 focus:border-primary-700 dark:bg-gray-gray-600 dark:text-white"
                                        placeholder="Your description here"
                                        required
                                    ></Textarea>
                                </div>

                                {/* Variations Section */}
                                <div className="sm:col-span-2">
                                    <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                        <Layers className="mr-2 text-primary-700" />
                                        Product Variations
                                    </h3>

                                    {variations.map((variation, variationIndex) => (
                                        <motion.div
                                            key={variationIndex}
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mb-6 p-4 border border-gray-200 rounded-lg dark:border-gray-700 dark:bg-transparent dark:border-dashed"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <Label htmlFor={`variation-name-${variationIndex}`} className="mr-2">Variation Name:</Label>
                                                <Input
                                                    type="text"
                                                    id={`variation-name-${variationIndex}`}
                                                    placeholder="Variation Name (e.g., Size, Color)"
                                                    value={variation.name}
                                                    onChange={(e) => updateVariationName(variationIndex, e.target.value)}
                                                    className="dark:bg-gray-700 dark:text-white"
                                                    required
                                                />
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() => removeVariation(variationIndex)}
                                                    className="ml-2"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Options */}
                                            <div className="space-y-3">
                                                {variation.options.map((option, optionIndex) => (
                                                    <div key={optionIndex} className="flex items-center gap-2">
                                                        <div className="relative flex-1">
                                                            <Ruler className="absolute left-3 top-3 text-gray-500" />
                                                            <Input
                                                                type="text"
                                                                placeholder="Option value"
                                                                value={option}
                                                                onChange={(e) => updateOption(variationIndex, optionIndex, e.target.value)}
                                                                className="pl-10 dark:bg-gray-700 dark:text-white"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="relative w-24">
                                                            <Box className="absolute left-3 top-3 text-gray-500" />
                                                            <Input
                                                                type="number"
                                                                placeholder="Stock"
                                                                value={variation.stock[option] || ''}
                                                                onChange={(e) => updateStock(variationIndex, option, parseInt(e.target.value) || 0)}
                                                                className="pl-10 dark:bg-gray-700 dark:text-white"
                                                                min="0"
                                                                required
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={() => removeOption(variationIndex, optionIndex)}
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => addOption(variationIndex)}
                                                className="mt-3"
                                            >
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Option
                                            </Button>
                                        </motion.div>
                                    ))}

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={addVariation}
                                        className="w-full"
                                    >
                                        <Layers className="w-4 h-4 mr-2" />
                                        Add Variation
                                    </Button>
                                </div>

                                {/* Standalone Stock Input */}
                                <div className="sm:col-span-2">
                                    <Label htmlFor="stock" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Stock (If no variations)
                                    </Label>
                                    <Input
                                        type="number"
                                        name="stock"
                                        id="stock"
                                        value={standaloneStock}
                                        onChange={(e) => setStandaloneStock(Number(e.target.value))}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        placeholder="Enter stock quantity"
                                        disabled={variations.length > 0} // Disable if variations exist
                                        required={variations.length === 0} // Required only when no variations
                                    />
                                    {variations.length > 0 && (
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            Total stock based on variations: {totalVariationStock}
                                        </p>
                                    )}
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
                            </div>
                            <motion.button
                                type="submit"
                                disabled={loading}
                                whileHover={{ scale: loading ? 1 : 1.05 }}
                                whileTap={{ scale: loading ? 1 : 0.95 }}
                                className={`inline-flex items-center justify-center px-5 py-2.5 mt-4 sm:mt-6 text-sm font-medium text-white ${loading ? 'bg-gray-400' : 'bg-primary-700'} rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-800`}
                            >
                                {loading ? 'Updating...' : 'Update Product'}
                            </motion.button>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
};

export default EditProductPage;