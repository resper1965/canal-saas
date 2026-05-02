import * as React from "react";
import { useParams, useLocation } from "react-router";

const CollectionPage = React.lazy(() => import("./collection"));
const PublicationsPage = React.lazy(() => import("./publications"));

/**
 * Dynamic content route.
 * - /content/:slug → uses slug param
 * - /insights, /cases, etc. → extracts slug from pathname
 * Publications renders a custom UI; all others use CollectionPage.
 */
export default function ContentRoute() {
  const { slug: paramSlug } = useParams();
  const { pathname } = useLocation();
  
  // For legacy routes like /insights, extract slug from pathname
  const slug = paramSlug || pathname.replace(/^\//, "").split("/")[0];
  
  if (slug === "publications") {
    return <PublicationsPage />;
  }
  
  return <CollectionPage slug={slug} />;
}
