'use client';

import React from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const paymentData = [
    { id: "m5gr84i9", amount: Math.floor(Math.random() * 1000), status: "success", email: "ken99@example.com" },
    { id: "3u1reuv4", amount: Math.floor(Math.random() * 1000), status: "success", email: "Abe45@example.com" },
    { id: "derv1ws0", amount: Math.floor(Math.random() * 1000), status: "processing", email: "granix001@gmail.com" },
    { id: "5kma53ae", amount: Math.floor(Math.random() * 1000), status: "success", email: "kybeedd@gmail.com" },
    { id: "bhqecj4p", amount: Math.floor(Math.random() * 1000), status: "failed", email: "carmella@example.com" },
];

const paymentColumns: ColumnDef<any>[] = [
    { accessorKey: "status", header: "Status", cell: ({ row }) => <div className="capitalize">{row.getValue("status")}</div> },
    { accessorKey: "email", header: "Email", cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div> },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(amount);
            return <div className="text-right font-medium">{formatted}</div>;
        },
    },
];

export default function PaymentTable() {
    const [pageIndex, setPageIndex] = React.useState(0);
    const [pageSize] = React.useState(5);

    const table = useReactTable({
        data: paymentData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
        columns: paymentColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-md border p-6 bg-white shadow-md dark:bg-gray-800">
            <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🎉 Event Participants</h3>
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between py-4">
                <Button onClick={() => setPageIndex((old) => Math.max(old - 1, 0))} disabled={pageIndex === 0}>
                    Previous
                </Button>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pageIndex + 1} of {Math.ceil(paymentData.length / pageSize)}
                </span>
                <Button onClick={() => setPageIndex((old) => Math.min(old + 1, Math.ceil(paymentData.length / pageSize) - 1))}
                        disabled={(pageIndex + 1) * pageSize >= paymentData.length}>
                    Next
                </Button>
            </div>
        </div>
    );
}
