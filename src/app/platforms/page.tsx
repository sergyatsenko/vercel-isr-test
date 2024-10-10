import { Metadata } from "next";
import { fetchGraphQL } from "@/util/sitecoreClient";
import { GET_PAGE_DATA } from "@/util/queries";

import { headers } from "next/headers";
//import { usePathname } from "next/navigation";

export const metadata: Metadata = {
  title: "Hello World with Timestamp",
};

export const dynamic = "force-static";

async function getTimestamp() {
  return new Date().toISOString();
}

interface PageItem {
  Title: { value: string };
  Content: { value: string };
  Heading: { value: string };
}

interface PageData {
  item: PageItem;
}

export default async function PlatformsPage() {
  const timestamp = await getTimestamp();
  const headersList = headers();
  const pathname = headersList.get("x-pathname") || "";
  console.log("Page server path:", pathname);
  const pageData: PageData = await fetchGraphQL(GET_PAGE_DATA, {
    path: "/sitecore/content/Starter Kit/Xcentium/Home/Platforms",
  });
  return (
    <div className="flex flex-col justify-center items-center h-screen text-center bg-gray-100 p-5 rounded-lg shadow-md">
      <h1 className="text-4xl font-bold text-gray-800 mb-5">
        {pageData.item.Title.value}
      </h1>
      <h2 className="text-gray-600 text-2xl">{pageData.item.Heading.value}</h2>
      <p className="text-gray-600">{pageData.item.Content.value}</p>
      <p className="text-gray-600">Generated at: {timestamp}</p>
    </div>
  );
}
