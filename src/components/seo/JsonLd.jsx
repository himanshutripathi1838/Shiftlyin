import React from "react";

/**
 * Generates JSON-LD Structured Data script tags for SEO & Local SEO.
 */
export default function JsonLd({ type = "LocalBusiness", data = {} }) {
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://shiftlyin.com";
  const gbpCidUrl = import.meta.env.VITE_GBP_CID_URL || "";
  const gbpReviewUrl = import.meta.env.VITE_GBP_REVIEW_URL || "";

  let schemaObj = null;

  if (type === "LocalBusiness" || type === "Organization") {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": ["LocalBusiness", "EmploymentAgency"],
      "@id": `${siteUrl}/#organization`,
      name: "Shiftlyin",
      alternateName: "Shiftlyin Part-Time Job Portal",
      url: siteUrl,
      logo: `${siteUrl}/assets/shiftlyin-full-logo.png`,
      image: `${siteUrl}/assets/shiftlyin-full-logo.png`,
      description:
        "Shiftlyin connects verified college students with local businesses, restaurants, cafes, and event organizers for part-time shift jobs.",
      telephone: "+91-9876543210",
      email: "support@shiftlyin.com",
      priceRange: "₹₹",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tech Park Sector 62",
        addressLocality: "Noida",
        addressRegion: "Uttar Pradesh",
        postalCode: "201301",
        addressCountry: "IN",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 28.6273,
        longitude: 77.3726,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ],
          opens: "08:00",
          closes: "22:00",
        },
      ],
      sameAs: [
        "https://facebook.com/shiftlyin",
        "https://twitter.com/shiftlyin",
        "https://linkedin.com/company/shiftlyin",
        "https://instagram.com/shiftlyin",
        gbpCidUrl,
        gbpReviewUrl,
      ].filter(Boolean),
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/#jobs?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    };
  } else if (type === "FAQPage" && Array.isArray(data.faqs)) {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question || faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer || faq.a,
        },
      })),
    };
  } else if (type === "BreadcrumbList" && Array.isArray(data.breadcrumbs)) {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: data.breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
      })),
    };
  } else if (type === "Service") {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "Service",
      name: data.title || "Shiftlyin Service",
      serviceType: data.serviceType || "Part-Time Job Matching",
      provider: {
        "@type": "LocalBusiness",
        name: "Shiftlyin",
        url: siteUrl,
      },
      areaServed: {
        "@type": "Country",
        name: "India",
      },
      description: data.description || "",
      url: `${siteUrl}${data.slug ? `/services/${data.slug}` : ""}`,
    };
  } else if (type === "JobPosting" && data.title) {
    schemaObj = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      title: data.title,
      description: data.description || data.title,
      identifier: {
        "@type": "PropertyValue",
        name: "Shiftlyin",
        value: data.id || "job-1",
      },
      datePosted: data.createdAt || new Date().toISOString(),
      employmentType: "PART_TIME",
      hiringOrganization: {
        "@type": "Organization",
        name: data.businessName || "Local Business",
        sameAs: siteUrl,
      },
      jobLocation: {
        "@type": "Place",
        address: {
          "@type": "PostalAddress",
          addressLocality: data.location || "Local City",
          addressCountry: "IN",
        },
      },
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: "INR",
        value: {
          "@type": "QuantitativeValue",
          value: data.salary || 500,
          unitText: "DAY",
        },
      },
    };
  }

  if (!schemaObj) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaObj) }}
    />
  );
}
