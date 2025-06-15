
import { NextResponse } from 'next/server';
import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import prisma from '@/lib/db';
import { isAdmin } from '@/lib/auth-utils';
import { auth } from '@/auth';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_ENCRYPTION === 'ssl', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
    },
    // Add these additional options for better compatibility
    tls: {
        rejectUnauthorized: false, // Only use this for development/testing
        ciphers: 'SSLv3'
    },
    debug: true, // Enable debug logging
    logger: true // Enable logging
});

// Test the connection
async function testEmailConnection() {
    try {
        await transporter.verify();
        console.log('SMTP connection successful');
        return true;
    } catch (error) {
        console.error('SMTP connection failed:', error);
        return false;
    }
}



export async function GET(request: Request) {
    const session = await auth();
    const user = session?.user;
    const isAdminUser = await isAdmin();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);

        const id = searchParams.get('id');
        const userId = searchParams.get('userId');
        const status = searchParams.get('status') as OrderStatus;
        const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'total' || 'createdAt';
        const order = searchParams.get('order') as 'asc' | 'desc' || 'asc';


        if (id) {
            // Fetch a single order by ID
            const order = await prisma.order.findUnique({
                where: {
                    id: id,
                },
                include: {
                    items: true,
                    country: true,
                    county: true,
                    city: true
                },
            });

            if (!order) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            if (!isAdminUser && order.userId !== user.id) {
                return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
            }

            return NextResponse.json(order);
        } else {

            const where: any = {};

            if (!isAdminUser) {
                // Regular users can only see their own orders
                where.userId = user.id;
            } else {
                // For admin, only get orders who's payment is completed
                where.paymentStatus = PaymentStatus.completed;
                // Admins can also filter by userId
                if (userId) {
                    where.userId = userId;
                }
            }

            if (status) {
                where.status = status;
            }

            const orderBy: any = {};
            orderBy[sortBy] = order;

            const orders = await prisma.order.findMany({
                where,
                orderBy,
                include: {
                    items: true,
                }
            });

            return NextResponse.json(orders);
        }


    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}


async function sendOrderConfirmationEmail(order: any, userEmail: string, userName: string, items: any) {
    try {
        // Test connection first
        const isConnected = await testEmailConnection();
        if (!isConnected) {
            throw new Error('SMTP connection failed');
        }

        const mailOptions = {
            from: process.env.NO_REPLY_EMAIL_ADDRESS,
            to: userEmail,
            subject: 'Order Confirmation - Avenue Fashion',
            html: `
            <body style="font-family: 'Inter', sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4;">
                    <tr>
                        <td>
                            <table align="center" width="600" cellpadding="0" cellspacing="0" border="0" style="width: 600px; margin: 0 auto; border-collapse: collapse;">
                                <tr>
                                    <td align="center" style="padding: 20px 0; background-color: #e11d48; color: #ffffff;">
                                         <img src="https://avenuefashion.co.ke/logo.png" alt="Avenue Fashion Logo" style="display: block; margin: 0 auto; width: 200px;">
                                        <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 20px; background-color: #ffffff; color: #555555;">
                                        <p style="font-size: 16px; line-height: 1.6;">Dear ${userName},</p>
                                        <p style="font-size: 16px; line-height: 1.6;">Thank you for your order! We have received your order and it is being processed.</p>
                                        <div style="margin-bottom: 20px;">
                                            <h2 style="font-size: 20px; margin-bottom: 10px; color: #e11d48;">Order Details:</h2>
                                            <ul style="list-style-type: none; padding: 0;">
                                                <li style="margin-bottom: 5px;"><strong>Order Number:</strong> ${order.payheroReference}</li>
                                                <li style="margin-bottom: 5px;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</li>
                                                <li style="margin-bottom: 5px;"><strong>Total:</strong> KES ${order.total}</li>
                                                <li style="margin-bottom: 5px;"><strong>Shipping Address:</strong>
                                                    ${order.street}, ${order.city.name}, ${order.county.name}, ${order.country.name}
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h2 style="font-size: 20px; margin-bottom: 10px; color: #e11d48;">Items:</h2>
                                            <ul style="list-style-type: none; padding: 0;">
                                                ${items
                    .map(
                        (item: any) =>
                            `<li style="margin-bottom: 5px;">${item.product.name} - Variation: ${item.variation} - Quantity: ${item.quantity}</li>`
                    )
                    .join('')}
                                            </ul>
                                        </div>
                                        <a href="https://avenuefashion.co.ke/order?orderId=${order.id}" style="background-color: #e11d48; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Order Details</a>
                                        <p style="margin-top: 30px; font-size: 16px; line-height: 1.6;">Thank you for shopping with us!</p>
                                        <p style="font-size: 16px; line-height: 1.6;">Sincerely,<br>The Avenue Fashion Team</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding: 20px; background-color: #1e3a8a; color: #ffffff; font-size: 14px;">
                                        © ${new Date().getFullYear()} Avenue Fashion. All rights reserved.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully:', result.messageId);
        return result;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);

        // Log specific error details for debugging
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'EAUTH') {
                console.error('Authentication failed. Check your SMTP credentials.');
            } else if (error.code === 'ECONNECTION') {
                console.error('Connection failed. Check your SMTP host and port.');
            }
        }

        throw error;
    }
}


export async function POST(request: Request) {
    const session = await auth();
    const user = session?.user;
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { items, total, countryId, countyId, cityId, street, paymentReference } = body;

        if (!items || total === undefined || !countryId || !countyId || !cityId || !street || !paymentReference) {
            return NextResponse.json({ error: 'Items, total, countryId, countyId, cityId, street, and paymentReference are required' }, { status: 400 });
        }

        // Fetch product details for the items

        const itemsWithProductDetails = await Promise.all(
            items.map(async (item: any) => {
                const product = await prisma.product.findUnique({
                    where: { id: item.productId },
                });
                return { ...item, product };
            })
        );



        const order = await prisma.order.create({
            data: {
                userId: user.id,
                items: {
                    create: items.map((item: any) => ({
                        quantity: item.quantity,
                        variation: item.variation,
                        product: {
                            connect: {
                                id: item.productId,
                            },
                        },
                    })),
                },
                total: total,
                countryId: countryId,
                countyId: countyId,
                cityId: cityId,
                street: street,
                payheroReference: paymentReference,
            },
            include: {
                country: true,
                county: true,
                city: true
            },
        });


        const userDetails = await prisma.user.findUnique({
            where: { id: user.id },
            select: {
                email: true,
                name: true
            }
        });

        if (!userDetails || !userDetails.email) {
            console.error('Failed to fetch user email from database');
            return NextResponse.json(order, { status: 201 });
        }

        // Send order confirmation email
        try {
            await sendOrderConfirmationEmail(order, userDetails.email, userDetails.name, itemsWithProductDetails);
        } catch (emailError) {
            console.error('Failed to send order confirmation email:', emailError);
        }


        return NextResponse.json(order, { status: 201 });

    } catch (error) {
        console.error('Error creating order:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    const user = session?.user;
    const isAdminUser = await isAdmin();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required for update' }, { status: 400 });
        }

        const body = await request.json();
        const { status, paymentStatus, transactionId } = body;

        if (!isAdminUser && status === 'cancelled') {
            const order = await prisma.order.findUnique({
                where: { id: id },
            });

            if (order?.userId !== user.id) {
                return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 });
            }
            if (order?.status !== 'pending') {
                return NextResponse.json({ error: 'Can only cancel orders with pending status' }, { status: 400 });
            }
        }


        const data: any = {};
        if (status) data.status = status;
        if (paymentStatus) data.paymentStatus = paymentStatus;
        if (transactionId) data.transactionId = transactionId;

        const order = await prisma.order.update({
            where: {
                id: id,
            },
            data: data,
        });

        return NextResponse.json(order);

    } catch (error) {
        console.error('Error updating order:', error);
        return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const isAdminUser = await isAdmin();
    if (!isAdminUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Order ID is required for deletion' }, { status: 400 });
        }

        await prisma.order.delete({
            where: {
                id: id,
            },
        });

        return NextResponse.json({ message: 'Order deleted successfully' });

    } catch (error) {
        console.error('Error deleting order:', error);
        return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
    }
}
