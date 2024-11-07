# Sitecore XM Cloud implementation of Next.js revalidate call

## What it’s for

This plugin allows to trigger refresh/re-generation of statically-generated pages in Next.js - based head implementations that use Sitecore CMS. Without this plugin statically-generated pages are not getting refreshed on content publish, which leads to stale content on the site.

This plugin was built and tested with Sitecore XM Cloud CMS and the head based on [XM Cloud Next.js Starter Kit][1], provided by Sitecore and used in many or most Next.js implementations.

## His it works

### Initiate API call from Sitecore XM

A Sitecore PowerShell function can be manually triggered from Sitecore Content Editor to read information about context item and send page information to Next.js for this page to be revalidated in head.

### Revalidate page in Next.js

Next.js provides [On-demand validation with res.revalidate][2] mechanism, which allows to revalidate statically generated pages on demand.

## Notes on example implementation

### Head sample code

The ‘head’ code provided is very minimalistic. It includes validation-specific code, but not everything that your solution needs. This is not meant to be used as is, but to be intelligently copy over, line by line, where appropriate without changing the rest of your solution.

#### Important code blocks

**Revalidate API**
This one can actually be copied as is :) from`vercel-test/src/app/api/revalidate/route.ts`.
This code block is responsible for revalidating the route(s) in Sitecore XM Cloud head:

```ts
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
```

**Example “catch all” route**
This is a very stripped down version of typical Sitecore’s implementation of [[…path]].tsx page. The only important part of this page is the `revalidate` setting in getStaticProps, which has to be set, and set to any number, other than 0, to ensure the revalidation is actually enabled (otherwise the revalidate will not work)

**Example `RichText` component**
This example component can be found in`/src/components/RichText.tsx`
Two things to remember when implementing components that can be used on statically generated pages are:

- Make sure to use Sitecore’s `GetStaticComponentProps` instead of Next.js regular GetStaticProps to ensure proper propagation of CMS content when such components are revalidated
- In the component function use Sitecore’s `useComponentProps` to, again, pass CMS content to components properly.

### Sitecore PowerShell

The Sitecore PowerShell script (`/Sitecore-Powershell/revalidate-page.ps1`) is designed to be run from the Sitecore Content Editor. It's included in the Sitecore package, so no need to take extra steps to get it to your Sitecore instance. Here's how it works:

1. Retrieves configuration details based on the current Sitecore item.
2. Determines the relative path of the item within the site structure.
3. Constructs a request to the revalidate API, including the secret and the page path to be revalidated.
4. Sends the request to the API and handles the response, showing appropriate alerts to the user.

## Installation and Configuration

### Environment Variables

The following environment variables are used by code provided in sample solution:

1. In your local development environment, create a `.env.local` file in the project root with the following content:

```
REVALIDATION_SECRET=your_secret_here
SITECORE_API_KEY=your_sitecore_api_key_here
SITECORE_SITE_NAME=your_site_name
```

`REVALIDATION_SECRET` can be any string value, it's used to verify the request to the Revalidate API
`SITECORE_API_KEY` is your Sitecore API key, it's used to authenticate the request to the Revalidate API
`SITECORE_SITE_NAME` site name to match the website in your Sitecore instance

2. For deployment on Vercel or another hosting platform, make sure to set these environment variables in your project settings (or replace them with yours in source code).

### Sitecore Package Installation and configuration

1. Install the provided Sitecore package from `/Sitecore-package/Revalidation plugin for Next.JS-1.0.zip` to your Sitecore XM/XP or XM Cloud instance, which includes: 2. Sitecore templates 3. Configuration settings content items 4. Revalidate PowerShell script
2. Configure plugin settings in Sitecore: 6. Go to `/sitecore/system/Settings/Revalidate Plugin Configuration` 7. Right click on `Revalidate Plugin Configuration` content item and select `Insert` -\> `Revalidate Site Mapping` as follows:
   - `Item Name`: `Choose a name that matches your Site name`
   - `Revalidate API Url`: `Provide URL to Revalidate API of your Vercel project, e.g. https://vercel-isr-test.vercel.app/api/revalidate`
   - `Secret`: `Enter the REVALIDATION_SECRET value from your Vercel project settings`

### Running the Project Locally

1. Install dependencies: `npm install`

2. Start the development server: `npm run dev`
3. Open [http://localhost:3000][3] with your browser to see the result.

The project should now be running locally, and you can test the revalidation process using the Sitecore PowerShell script in your Sitecore instance.
Note that Next.js is re-generating SSG pages on each request, so you will need to deploy to Vercel to see the revalidation in action.

#### Vercel deployment steps:

- Set up your Vercel project and point it to your github repo, set up OOTB build process
- Make sure to configure the above environment variables in your Vercel project settings before building & deploying the project, otherwise the build will fail with SSG-related errors

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation][4] - learn about Next.js features and API.
- [Learn Next.js][5] - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository][5] - your feedback and contributions are welcome!

[1]: https://github.com/sitecorelabs/xmcloud-foundation-head-dev
[2]: On-demand%20validation%20with%20res.revalidate()
[3]: https://nextjs.org/docs
[4]: https://nextjs.org/learn
[5]: https://github.com/vercel/next.js
