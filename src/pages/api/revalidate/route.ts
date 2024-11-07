import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const secret = req.query?.secret;

    if (!secret || secret.length <= 0) {
      return res.status(401).json({ message: "Invalid secret" });
    }

    try {
      const pages = req.body?.pages;
      const locale = req.body?.locale;
      if (!locale || locale.length <= 0) {
        return res.status(400).json({ message: "Invalid or empty locale" });
      }
      if (!Array.isArray(pages) || pages.length === 0) {
        return res
          .status(400)
          .json({ message: "Invalid or empty pages array" });
      }
      const sitecoreSiteName = process.env.SITECORE_SITE_NAME;
      if (!sitecoreSiteName || sitecoreSiteName.length <= 0) {
        return res.status(500).json({
          message:
            "Invalid or empty sitecore site name, SITECORE_SITE_NAME must be configured - configuration error",
        });
      }

      const revalidatedPages = await Promise.all(
        pages.map(async (page) => {
          //Sitecore's foundation head project (https://github.com/sitecorelabs/xmcloud-foundation-head-dev) is the typical starting point for most Next.js-based head implementations.
          //This head implementation is altering the path to where the statically generated pages stored in the Vercel cache to something like `/en/_site_your_site_name/page_path` instead of just `/page_path`.
          //The 'pagePath' accounts for this fact, but can be changed to match your setup.
          const pagePath = `/${locale}/_site_${sitecoreSiteName}${page}`;
          await res.revalidate(pagePath);
          return page;
        })
      );

      return res.status(200).json({
        revalidated: true,
        pages: revalidatedPages,
        now: Date.now(),
      });
    } catch (error) {
      console.error("Error during revalidation:", error);
      return res.status(400).json({
        message: "Invalid JSON payload",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  } else {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }
}
