'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

// Type for a Report item
type Report = {
  id: string
  title: string
  description: string | null
  reporterName: string
  isResolved: boolean
  createdAt: Date
  updatedAt: Date
}

const ReportsPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt')
  const [isResolvedFilter, setIsResolvedFilter] = useState<boolean | null>(null)
  const [deleteAllOpen, setDeleteAllOpen] = useState(false)

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true)
      try {
        let url = `/api/reports?sortBy=${sortBy}&order=${sortOrder}`
        if (isResolvedFilter !== null) url += `&isResolved=${isResolvedFilter}`

        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        setReports(data)
      } catch (err) {
        toast.error('Failed to fetch reports')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [sortBy, sortOrder, isResolvedFilter])

  const handleDeleteReport = async (id: string) => {
    try {
      const res = await fetch(`/api/reports?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Report deleted')
        setReports(reports.filter(r => r.id !== id))
      } else {
        toast.error('Delete failed')
      }
    } catch (err) {
      toast.error('Error deleting report')
      console.error(err)
    }
  }

  const confirmDeleteAll = () => {
    setDeleteAllOpen(true)
  }

  const handleDeleteAllConfirmed = async () => {
    setDeleteAllOpen(false)
    try {
      for (const r of reports) {
        await fetch(`/api/reports?id=${r.id}`, { method: 'DELETE' })
      }
      toast.success('All reports deleted')
      setReports([])
    } catch (err) {
      toast.error('Failed to delete all reports')
      console.error(err)
    }
  }

  const handleToggleResolved = async (id: string, current: boolean) => {
    try {
      const res = await fetch(`/api/reports?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved: !current }),
      })
      if (res.ok) {
        toast.success('Updated status')
        setReports(reports.map(r => r.id === id ? { ...r, isResolved: !current } : r))
      } else {
        toast.error('Update failed')
      }
    } catch (err) {
      toast.error('Error updating report')
    }
  }

  const handleResolvedFilter = (value: 'true' | 'false' | 'all') => {
    setIsResolvedFilter(value === 'all' ? null : value === 'true')
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:ml-36">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
          <div className="flex flex-wrap justify-between items-center p-4 space-y-2 sm:space-y-0">
            <button onClick={() => router.push('/reports/new')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
              + Add Report
            </button>
            <div className="flex space-x-3">
              <Select onValueChange={val => val === 'delete-all' && confirmDeleteAll()}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delete-all">Delete all</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all" onValueChange={handleResolvedFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Resolved</SelectItem>
                  <SelectItem value="false">Unresolved</SelectItem>
                </SelectContent>
              </Select>
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(val) => {
                const [by, order] = val.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(by)
                setSortOrder(order)
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Date</SelectLabel>
                    <SelectItem value="createdAt-desc">Newest</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest</SelectItem>
                    <SelectItem value="updatedAt-desc">Updated (Newest)</SelectItem>
                    <SelectItem value="updatedAt-asc">Updated (Oldest)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Report cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-4 rounded bg-white dark:bg-gray-800 animate-pulse">
                <div className="h-6 bg-gray-300 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-full mb-1"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))
          ) : (
            reports.map(report => (
              <div key={report.id} className="p-4 bg-white dark:bg-gray-800 rounded shadow">
                <h3 className="text-lg font-semibold">{report.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{report.description}</p>
                <p className="text-xs mt-1 text-gray-400">By: {report.reporterName}</p>
                <div className="flex justify-between items-center mt-3">
                  <button onClick={() => router.push(`/reports/edit/${report.id}`)} className="text-blue-500 text-sm">Edit</button>
                  <Switch checked={report.isResolved} onCheckedChange={() => handleToggleResolved(report.id, report.isResolved)} />
                  <button onClick={() => handleDeleteReport(report.id)} className="text-red-500 text-sm">Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Confirm delete all dialog */}
      <Dialog open={deleteAllOpen} onOpenChange={setDeleteAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all reports?</DialogTitle>
            <DialogDescription>This action cannot be undone. Are you sure?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <button onClick={() => setDeleteAllOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
            <button onClick={handleDeleteAllConfirmed} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default ReportsPage

