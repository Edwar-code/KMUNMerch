import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  change?: number
  subtitle?: string
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  change,
  subtitle
}) => {
  // Only show trend if change is provided
  const isPositive = change !== undefined ? change > 0 : undefined

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {icon}
          <span className="text-gray-500 dark:text-gray-400 text-sm">{title}</span>
        </div>
        {isPositive !== undefined && (
          isPositive ? (
            <TrendingUp className="text-green-500 w-5 h-5" />
          ) : (
            <TrendingDown className="text-red-500 w-5 h-5" />
          )
        )}
      </div>
      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="text-2xl font-bold text-gray-900 dark:text-white mr-2">
            {value}
          </span>
          {change !== undefined && (
            <span
              className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}{change}%
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatCard