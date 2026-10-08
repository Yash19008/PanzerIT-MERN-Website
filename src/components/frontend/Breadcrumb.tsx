import Link from "next/link";
import Image from "next/image";

interface BreadcrumbPath {
  name: string;
  url?: string;
}

interface BreadcrumbProps {
  title: string;
  paths: BreadcrumbPath[];
  image?: string;
  imageAlt?: string;
  imageTitle?: string;
  imageCaption?: string;
  imageDescription?: string;
  hideDescription?: boolean;
  description?: string;
  hideBanner?: boolean;
  /** Show only the title, centered, no image — for detail pages */
  centerTitle?: boolean;
}

export function Breadcrumb({
  title,
  paths,
  image,
  imageAlt,
  imageTitle,
  imageCaption,
  imageDescription,
  hideDescription,
  description,
  hideBanner,
  centerTitle,
}: BreadcrumbProps) {
  const hasImage = Boolean(image && image.trim() !== "");

  const navContent = (
    <nav className="panzer-resource-breadcrumb-nav" aria-label="Breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {paths.map((path, index) => {
          const isCurrent = index === paths.length - 1;

          return (
            <li key={`${path.name}-${index}`} aria-current={isCurrent ? "page" : undefined}>
              {path.url && !isCurrent ? (
                <Link href={path.url}>{path.name}</Link>
              ) : (
                <span>{path.name}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://panzerit.com').replace(/\/+$/, '');

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${siteUrl}/`
      },
      ...paths.map((p, index) => {
        const itemObj: { "@type": string; position: number; name: string; item?: string } = {
          "@type": "ListItem",
          "position": index + 2,
          "name": p.name
        };
        if (p.url) {
          itemObj.item = p.url.startsWith('http') ? p.url : `${siteUrl}${p.url.startsWith('/') ? '' : '/'}${p.url}`;
        }
        return itemObj;
      })
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <section className="panzer-resource-breadcrumb-section" aria-label={`${title} breadcrumb`}>
        <div className="container-fluid">
          <div className="container">
            {navContent}
          </div>

          {!hideBanner && (
            <div
              className="container-fluid panzer-resource-breadcrumb-shell"
              style={{
                position: "relative",
                overflow: "hidden",
              }}
            >
              {hasImage && (
                <Image
                  src={image!}
                  alt={imageAlt || `${title} banner background`}
                  title={imageTitle || imageCaption || imageAlt}
                  fill
                  priority
                  sizes="100vw"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                    zIndex: 0,
                  }}
                />
              )}

              <div
                className="container panzer-breadcrumb-center"
                style={{ position: "relative", zIndex: 2 }}
              >
                <div
                  className="panzer-resource-breadcrumb-copy text-center"
                  style={{
                    maxWidth: "900px",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h1
                    className="panzer-resource-breadcrumb-title"
                    style={{ margin: 0, textAlign: "center" }}
                  >
                    {title}
                  </h1>
                  {description && description.trim() !== "" ? (
                    /<[a-z][\s\S]*>/i.test(description) ? (
                      <div
                        className="panzer-resource-breadcrumb-text"
                        style={{ marginTop: "12px", textAlign: "center" }}
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    ) : (
                      <p
                        className="panzer-resource-breadcrumb-text"
                        style={{ marginTop: "12px", textAlign: "center" }}
                      >
                        {description}
                      </p>
                    )
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
