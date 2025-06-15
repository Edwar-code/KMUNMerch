'use client'

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react'

// Define context type
interface SidebarContextType {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
}

// Create context with default values
const SidebarContext = createContext<SidebarContextType>({
  isOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {}
})

// Context provider component
export const SidebarProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => {
    setIsOpen(prev => !prev)
  }

  const closeSidebar = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside sidebar and not on sidebar toggle button
      if (
        isOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('button[aria-controls="sidebar"]')
      ) {
        closeSidebar()
      }
    }

    // Add click listener when sidebar is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    // Cleanup listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

// Custom hook for using sidebar context
export const useSidebar = () => useContext(SidebarContext)