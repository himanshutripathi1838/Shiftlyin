import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "../../utils/analytics.js";
import JsonLd from "./JsonLd.jsx";

/**
 * Dynamic SEO Head Component for Shiftlyin.
 * Updates Document Title, Meta Description, Open Graph, Twitter Cards, Canonical Links,
 * Robots indexing rules, and JSON-LD structured data.
 */
export default function SeoHead({
  title = "Shiftlyin | Find Part-Time Student Jobs & Local Hiring",
  description = "Shiftlyin connects verified college students with local cafes, restaurants, hotels, shops, and events for flexible part-time shift jobs. Earn while you learn with instant GPS check-ins & verified payouts.",
  keywords = "student part-time jobs, campus hiring, restaurant shift jobs, cafe jobs, event staffing, student gig work, flexible shift jobs, shiftlyin",
  canonical,
  noIndex = false,
  ogImage = "/assets/shiftlyin-full-logo.png",
  ogType = "website",
  schemaType = "LocalBusiness",
  schemaData = {},
}) {
  const location = useLocation();
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://shiftlyin.com";
  const gscCode = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || "";
  const currentUrl = canonical ? (canonical.startsWith("http") ? canonical : `${siteUrl}${canonical}`) : `${siteUrl}${location.pathname}`;

  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // 2. Helper to set or update meta tag by name or property
    const setMetaTag = (selector, attrName, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrName, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // 3. Helper for Canonical Link
    let canonicalLink = document.querySelector("link[rel='canonical']");
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute("href", currentUrl);

    // 4. Update Essential SEO Meta Tags
    setMetaTag("meta[name='description']", "name", "description", description);
    setMetaTag("meta[name='keywords']", "name", "keywords", keywords);
    setMetaTag("meta[name='robots']", "name", "robots", noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMetaTag("meta[name='author']", "name", "author", "Shiftlyin Technologies");

    // 5. GSC Site Verification
    if (gscCode && gscCode.trim() !== "") {
      setMetaTag("meta[name='google-site-verification']", "name", "google-site-verification", gscCode);
    }

    // 6. Open Graph Tags
    setMetaTag("meta[property='og:title']", "property", "og:title", title);
    setMetaTag("meta[property='og:description']", "property", "og:description", description);
    setMetaTag("meta[property='og:url']", "property", "og:url", currentUrl);
    setMetaTag("meta[property='og:type']", "property", "og:type", ogType);
    setMetaTag("meta[property='og:site_name']", "property", "og:site_name", "Shiftlyin");
    setMetaTag("meta[property='og:image']", "property", "og:image", ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`);

    // 7. Twitter Card Tags
    setMetaTag("meta[name='twitter:card']", "name", "twitter:card", "summary_large_image");
    setMetaTag("meta[name='twitter:title']", "name", "twitter:title", title);
    setMetaTag("meta[name='twitter:description']", "name", "twitter:description", description);
    setMetaTag("meta[name='twitter:image']", "name", "twitter:image", ogImage.startsWith("http") ? ogImage : `${siteUrl}${ogImage}`);

    // 8. Track GA4 Page View
    trackPageView(location.pathname, title);
  }, [title, description, keywords, currentUrl, noIndex, ogImage, ogType, gscCode, location.pathname]);

  return (
    <>
      <JsonLd type={schemaType} data={schemaData} />
    </>
  );
}
