'use client'

import React from 'react'
import useSWR from 'swr'
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    BarChart, Bar, PieChart, Pie, Cell,
    ResponsiveContainer
} from 'recharts'
import { 
    TrendingUp, 
    ShoppingCart, 
    Users, 
    Package, 
    DollarSign, 
    AlertTriangle,
    MessageCircle
} from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import DashboardSkeleton from '@/components/admin/DashboardSkeleton'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const Dashboard = () => {
    const { data, error } = useSWR('/api/analytics', fetcher, {
        revalidateOnFocus: false,
        revalidateIfStale: false
    })

    if (!data && !error) return <DashboardSkeleton />
    if (error) return <div>Failed to load analytics</div>

    console.log("API Data:", data)

    // Transform order trends data
    const orderTrends = data?.orderAnalytics?.salesByHour?.map((hour: any) => ({
        hour: hour._id, 
        orderCount: hour.orderCount, 
        revenue: hour.totalRevenue
    })) || []

    // Transform category data for the pie chart
    const categoryData = data?.categoryAnalytics?.productsPerCategory?.map((cat: any) => ({
        name: cat.categoryName, 
        value: cat.totalProducts 
    })) || []

    // Transform payment method distribution
    const paymentMethodData = [
        { name: 'M-Pesa', value: data?.paymentAnalytics?.mpesa || 0 },
        { name: 'Card', value: data?.paymentAnalytics?.card || 0 }
    ]

    return (
        <section className="bg-gray-50 dark:bg-gray-900 min-h-screen p-3 sm:p-5 sm:ml-36">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard 
                    icon={<DollarSign className="text-green-500" />}
                    title="Total Revenue"
                    value={`Kes ${data?.orderAnalytics?.totalRevenue?.toFixed(2) || 0}`}
                    subtitle={`${data?.orderAnalytics?.ordersLast7Days || 0} orders in last 7 days`}
                />
                <StatCard 
                    icon={<Users className="text-blue-500" />}
                    title="Total Users"
                    value={data?.userAnalytics?.totalUsers || 0}
                    subtitle={`${data?.userAnalytics?.newUsersLast7Days || 0} new this week`}
                />
                <StatCard 
                    icon={<Package className="text-purple-500" />}
                    title="Total Products"
                    value={data?.productAnalytics?.totalProducts || 0}
                    subtitle={`${data?.productAnalytics?.lowStockProducts || 0} low stock`}
                />
                <StatCard 
                    icon={<MessageCircle className="text-orange-500" />}
                    title="Support Tickets"
                    value={data?.supportAnalytics?.totalTickets || 0}
                    subtitle={`${data?.supportAnalytics?.openTickets || 0} open`}
                />
            </div>

            {/* Sales by Hour Chart */}
            <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
                <h2 className="text-xl font-bold mb-4">Sales by Hour</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={orderTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="orderCount" stroke="#8884d8" name="Orders" />
                        <Line type="monotone" dataKey="revenue" stroke="#82ca9d" name="Revenue" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
                <h2 className="text-xl font-bold mb-4">Category Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryData.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / categoryData.length}, 70%, 50%)`} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Payment Method Distribution */}
            <div className="border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-600 p-4">
                <h2 className="text-xl font-bold mb-4">Payment Methods</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie
                            data={paymentMethodData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            fill="#82ca9d"
                            dataKey="value"
                        >
                            <Cell fill="#8884d8" />
                            <Cell fill="#82ca9d" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </section>
    )
}

export default Dashboard
