'use client';

interface ProductJsonLdProps {
  name: string;
  images: string[];
  description: string;
  id: string;
  price: number;
  slug: string;
  availableStock: number;
}

const ProductJsonLd = ({ 
  name, 
  images, 
  description, 
  id, 
  price, 
  slug, 
  availableStock 
}: ProductJsonLdProps) => {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": images,
    "description": description,
    "sku": id,
    "brand": {
      "@type": "Brand",
      "name": "Avenue Fashion"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_WEBSITE_URL}/${slug}`,
      "priceCurrency": "KES",
      "price": price,
      "availability": availableStock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Avenue Fashion"
      }
    }
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd)
      }}
    />
  );
};

export default ProductJsonLd;