'use client'

import React from 'react'
import { 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Package, 
  DollarSign, 
  AlertTriangle 
} from 'lucide-react'

const DashboardSkeleton = () => {
  return (
    <main className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5 sm:ml-36">
      {/* Top Stats Grid - Stacked on mobile, 2 columns on small screens, 4 on large */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {[
          { icon: DollarSign, color: 'green' },
          { icon: ShoppingCart, color: 'blue' },
          { icon: Users, color: 'purple' },
          { icon: Package, color: 'orange' }
        ].map(({ icon: Icon, color }, index) => (
          <div 
            key={index} 
            className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 flex items-center space-x-4"
          >
            <Icon className={`text-${color}-500`} size={24} />
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Order Trends Chart - Responsive sizing */}
      <div className="w-full border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 mb-4 p-4">
        <h2 className="text-xl font-bold mb-4 h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
        <div className="w-full overflow-x-auto h-[250px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>

      {/* Product & Category Analytics - Stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Category Distribution */}
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-xl font-bold mb-4 h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
          <div className="w-full overflow-x-auto flex justify-center h-[250px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>

        {/* Product Price Ranges */}
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-xl font-bold mb-4 h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
          <div className="w-full overflow-x-auto flex justify-center h-[250px] bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Additional Insights - Stacked on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Low Stock Products Warning */}
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <AlertTriangle className="text-yellow-500 mr-2" />
            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2 animate-pulse"></div>
          </h2>
          <div className="space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* City Order Distribution */}
        <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-xl font-bold mb-4 h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex justify-between">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/5 animate-pulse"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/3 animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

export default DashboardSkeleton