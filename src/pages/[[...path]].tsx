import { GetStaticPaths, GetStaticProps } from "next";
import Layout from "src/Layout";
import {
  //SitecoreContext,
  ComponentPropsContext,
  StaticPath,
} from "@sitecore-jss/sitecore-jss-nextjs";

import { SitecorePageProps } from "lib/page-props";

const SitecorePage = ({
  componentProps,
  layoutData,
  headLinks,
}: SitecorePageProps): JSX.Element => {
  return (
    <ComponentPropsContext value={componentProps}>
      <Layout layoutData={layoutData} headLinks={headLinks} />
    </ComponentPropsContext>
  );
};

// This function gets called at build and export time to determine
// pages for SSG ("paths", as tokenized array).
export const getStaticPaths: GetStaticPaths = async () => {
  // Fallback, along with revalidate in getStaticProps (below),
  // enables Incremental Static Regeneration. This allows us to
  // leave certain (or all) paths empty if desired and static pages
  // will be generated on request (development mode in this example).
  // Alternatively, the entire sitemap could be pre-rendered
  // ahead of time (non-development mode in this example).
  // See https://nextjs.org/docs/basic-features/data-fetching/incremental-static-regeneration

  const paths: StaticPath[] = [];
  const fallback: boolean | "blocking" = "blocking";

  //Provide your own implementation to get the sitemap here...

  return {
    paths,
    fallback,
  };
};

export const getStaticProps: GetStaticProps = async () => {
  const props = {}; //await sitecorePagePropsFactory.create(context);

  return {
    props,
    revalidate: 3600, // In seconds
  };
};

export default SitecorePage;
