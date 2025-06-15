import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';

type FeaturedStarProps = {
    initialFeatured: boolean;
    onToggleFeatured: (featured: boolean) => Promise<void>;
};

export const FeaturedStar: React.FC<FeaturedStarProps> = ({ 
    initialFeatured, 
    onToggleFeatured 
}) => {
    const [optimisticFeatured, setOptimisticFeatured] = useState(initialFeatured);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setOptimisticFeatured(!optimisticFeatured);
        setIsLoading(true);

        try {
            await onToggleFeatured(!optimisticFeatured);
        } catch (error) {
            setOptimisticFeatured(initialFeatured);
            console.error('Failed to update featured status:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.button 
            onClick={handleToggle} 
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`
                absolute top-2 right-2 
                focus:outline-none 
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title={optimisticFeatured ? "Remove from Featured" : "Add to Featured"}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={optimisticFeatured ? 'featured' : 'not-featured'}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ 
                        type: "spring", 
                        stiffness: 300, 
                        damping: 20 
                    }}
                >
                    <Star 
                        fill={optimisticFeatured ? "gold" : "none"}
                        color={optimisticFeatured ? "gold" : "gray"}
                        className={`
                            w-6 h-6 
                            ${isLoading ? 'animate-spin' : ''}
                        `}
                    />
                </motion.div>
            </AnimatePresence>
        </motion.button>
    );
};