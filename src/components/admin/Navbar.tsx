'use client'

import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { signOut, useSession, signIn } from 'next-auth/react'
import { useSidebar } from '@/contexts/SidebarContext'

const Navbar = () => {
  const { toggleSidebar } = useSidebar()
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false)
  const { data: session } = useSession()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <header className="antialiased z-50 fixed w-full top-0">
  <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
    <div className="flex flex-wrap justify-between items-center">
      <div className="flex justify-start items-center">
        <Link href="/dashboard" className="flex mr-4">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">KeMUN Connect-Admin End</span>
        </Link>
      </div>
          <div className="flex items-center lg:order-2">
            
            <button 
              type="button" 
              className="flex mx-3 text-sm bg-gray-800 rounded-full md:mr-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600" 
              id="user-menu-button" 
              aria-expanded={isDropdownOpen} 
              onClick={toggleDropdown}
            >
              <span className="sr-only">Open user menu</span>
            </button>
            
            <div className={`absolute right-0 z-50 my-4 w-56 text-base list-none bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600 ${isDropdownOpen ? 'block' : 'hidden'}`} id="dropdown">
              <ul className="py-1 text-gray-500 dark:text-gray-400" aria-labelledby="dropdown">
                <li>
                  <Link href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">My profile</Link>
                </li>
                <li>
                  <Link href="#" className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-400 dark:hover:text-white">Account settings</Link>
                </li>
              </ul>
              <ul className="py-1 text-gray-500 dark:text-gray-400" aria-labelledby="dropdown">
                <li>
                  <button onClick={() => signOut()} className="block py-2 px-4 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Sign out</button>
                </li>
              </ul>
            </div>

        <button 
          onClick={toggleSidebar} 
          className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer sm:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
        >
          <svg className="w-[18px] h-[18px]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
          </svg>
          <span className="sr-only">Toggle sidebar</span>
        </button>
      </div>
    </div>
  </nav>
</header>

  )
}

export default (Navbar)
