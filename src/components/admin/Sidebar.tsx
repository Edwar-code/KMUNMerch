'use client'

import Link from 'next/link';
import React, { useRef } from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Tag,
    MapPin,
    Image,
    FileText,
    MessageSquare,
    Mail,
    Percent,
    Ticket,
} from 'lucide-react';

const Sidebar = () => {
    const { isOpen, closeSidebar } = useSidebar();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const handleLinkClick = () => {
        // Close sidebar on small screens when a link is clicked
        if (window.innerWidth < 640) {
            closeSidebar();
        }
    };

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/users', label: 'Users', icon: Users },
        { href: '/products', label: 'Products', icon: Package },
        { href: '/categories', label: 'Categories', icon: Tag },
        { href: '/orders', label: 'Orders', icon: ShoppingCart },
        { href: '/discounts', label: 'Discounts', icon: Percent },
        { href: '/coupons', label: 'Coupons', icon: Ticket },
        { href: '/locations', label: 'Locations', icon: MapPin },
        { href: '/heros', label: 'Heros', icon: Image },
        { href: '/policies', label: 'Policies', icon: FileText },
        { href: '/reports', label: 'Reports', icon: FileText }, // ✅ Reports tab added
        { href: '/support-tickets', label: 'Support', icon: MessageSquare },
        { href: '/newsletter', label: 'Newsletters', icon: Mail },
    ];

    return (
        <aside
            ref={sidebarRef}
            id="default-sidebar"
            className={`fixed left-0 z-40 h-screen bg-gray-800 dark:bg-gray-900 border-r border-gray-700 transition-transform ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
            } sm:translate-x-0`}
            aria-label="Sidebar"
        >
            <div className="h-full py-4 overflow-y-auto bg-gray-800 dark:bg-gray-900">
                <Link href="/" className="flex items-center pl-2.5 mb-5">
                    <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
                        Avenue Fashion
                    </span>
                </Link>
                <ul className="space-y-2 font-medium">
                    {navLinks.map((link) => (
                        <li key={link.label}>
                            <Link
                                href={link.href}
                                onClick={handleLinkClick}
                                className="flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-700 group"
                            >
                                <link.icon className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-white" />
                                <span className="ml-3">{link.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
};

export default Sidebar;
