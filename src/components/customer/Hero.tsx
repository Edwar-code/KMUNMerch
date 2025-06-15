'use client'

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface HeroProps {
    title: string;
    subtitle: string | null;
    image: string; // Assuming image is always a valid string URL when heroToRender is defined
    link: string | null;
    isActive: boolean;
}

const Hero = () => {
    const [heroes, setHeroes] = useState<HeroProps[]>([]);
    const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shouldShowHero, setShouldShowHero] = useState(false);

    const shuffleArray = (array: HeroProps[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    useEffect(() => {
        const fetchHeroData = async () => {
            setIsLoading(true);
            setError(null); // Reset error on new fetch
            try {
                const response = await fetch('/api/heros?isActive=true');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {
                    const shuffledHeroes = shuffleArray(data);
                    setHeroes(shuffledHeroes);
                    const showChance = Math.random();
                    // Set show hero based on chance *only if* there are heroes
                    setShouldShowHero(showChance > 0.5);
                } else {
                    setHeroes([]);
                    setShouldShowHero(false); // Don't show if no heroes
                }
            } catch (err: any) {
                console.error("Failed to load hero data:", err); // Log the actual error
                setError(err.message || "Failed to load hero data.");
                setShouldShowHero(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeroData();
    }, []);

    useEffect(() => {
        if (heroes.length > 1 && shouldShowHero) { // Only start interval if more than one hero
            const intervalId = setInterval(() => {
                setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroes.length);
            }, 5000);

            return () => clearInterval(intervalId);
        }
    }, [heroes, shouldShowHero]);

    // --- Loading and Error States ---
    if (isLoading) {
        // Optional: Render a placeholder or skeleton loader here
        return null; // Or a loading indicator component
    }

    if (error) {
        // Optional: Render a more user-friendly error message
        console.error("Hero component render error:", error);
        return null; // Or an error display component
    }

    if (!shouldShowHero || heroes.length === 0) {
        return null; // Don't render if told not to or if no heroes exist
    }

    // --- Render Hero ---
    const heroToRender = heroes[currentHeroIndex];

    // Ensure heroToRender and its image property exist before rendering
    if (!heroToRender?.image) {
         console.warn("Hero data is missing image for index:", currentHeroIndex);
         // Decide how to handle this: skip rendering, show placeholder, etc.
         // For now, let's skip rendering this specific hero instance might be best
         // but could lead to blank space if it's the *only* hero.
         // A better approach might be to filter heroes without images upstream.
         // Or render a placeholder *inside* the image container.
         return null; // Or render section with text only, or placeholder image
    }

    return (
        <section className="bg-white py-8 antialiased dark:bg-gray-900 md:py-16">
            <div className="mx-auto grid max-w-screen-xl px-4 pb-8 md:grid-cols-12 lg:gap-12 lg:pb-16 xl:gap-0">
                {/* Text Content */}
                <div className="content-center justify-self-start md:col-span-7 md:text-start">
                    <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight dark:text-white md:max-w-2xl md:text-5xl xl:text-6xl">{heroToRender.title}</h1>
                    {heroToRender.subtitle && ( // Conditionally render subtitle
                       <p className="mb-4 max-w-2xl text-gray-500 dark:text-gray-400 md:mb-12 md:text-lg mb-3 lg:mb-5 lg:text-xl">{heroToRender.subtitle}</p>
                    )}
                    {heroToRender.link && ( // Conditionally render link
                        <Link
                            href={heroToRender.link}
                            className="inline-block rounded-lg bg-primary-700 px-6 py-3.5 text-center font-medium text-white hover:bg-primary-800 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Attend
                        </Link>
                    )}
                </div>

                {/* Image Container */}
                <div
                    className="hidden md:col-span-5 md:mt-0 md:flex relative overflow-hidden rounded-lg"
                    style={{ width: '609px', height: '421px' }} 
                >
                    <Image
                        src={heroToRender.image}
                        alt={heroToRender.title || "Hero Image"}
                        fill 
                        style={{ objectFit: 'cover' }}
                        sizes="(min-width: 768px) 609px, 0vw"
                        priority={currentHeroIndex === 0}
                    />
                </div>
            </div>
        </section>
    );
};

export default Hero;
