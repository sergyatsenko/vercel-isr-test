# Next.js Revalidation with Sitecore PowerShell

## Goal of this Project

The goal of this project is to enable the revalidation and rebuilding of statically generated pages using Next.js' revalidate API mechanism in conjunction with Sitecore PowerShell.

## How it Works

### High-Level Approach

This project combines a Next.js revalidate API endpoint with a Sitecore PowerShell script to trigger the revalidation of specific pages. This allows content editors to refresh statically generated pages directly from the Sitecore Content Editor. The sitecore item paths is being passed to revalidate API, so it knows which pages to revalidate.

### Revalidate API

An example revalidate API is implemented in `vercel-test/src/app/api/revalidate/route.ts`. You can choose to copy it over to your FE Next.js implementation or update/rewrite it as needed.
Here's how it works:

1. It receives a POST request with a secret query parameter and a JSON body containing an array of pages to revalidate.
2. It verifies the secret against an environment variable (`REVALIDATION_SECRET`) for security.
3. If the secret is valid, it processes the array of pages, calling `revalidatePath()` for each page.
4. It returns a JSON response with the revalidation status, revalidated pages, and timestamp.

### Example pages

A few example pages are provided: `/src/app/page.tsx`, `/src/app/platforms/page.tsx`, `/src/app/services/page.tsx`. Those are for demo/testing purposes only, and not meant to be used in rel projects. Page paths match Sitecore items paths I used in my demos, so you might need to change their folder paths to match yours, if you're to use these.

### Sitecore PowerShell

The Sitecore PowerShell script (`vercel-test/Sitecore-Powershell/revalidate-page.ps1`) is designed to be run from the Sitecore Content Editor. Here's how it works:

1. It retrieves configuration details based on the current Sitecore item.
2. It determines the relative path of the item within the site structure.
3. It constructs a request to the revalidate API, including the secret and the page path to be revalidated.
4. It sends the request to the API and handles the response, showing appropriate alerts to the user.

## Installation and Configuration

### Environment Variables

Set up the following environment variables:

1. In your local development environment, create a `.env.local` file in the project root with the following content:

   ````
   REVALIDATION_SECRET=your_secret_here
   SITECORE_API_KEY=your_sitecore_api_key_here   ```
   ````

   `REVALIDATION_SECRET` can be any string value, it's used to verify the request to the Revalidate API
   `SITECORE_API_KEY` is your Sitecore API key, it's used to authenticate the request to the Revalidate API

2. For deployment on Vercel, set these environment variables in your project settings.

### Sitecore Package Installation and configuration

1. Install the provided Sitecore package from `/Sitecore-package/Revalidation plugin for Next.JS-1.0.zip` to your Sitecore XM/XP or XM Cloud instance, which includes:
   - Sitecore templates
   - Configuration settings content items
   - Revalidate PowerShell script
2. Configure plugin settings in Sitecore:
   - Go to `/sitecore/system/Settings/Revalidate Plugin Configuration`
   - Right click on `Revalidate Plugin Configuration` content item and select `Insert` -> `Revalidate Site Mapping` as follows:
     - `Item Name`: `Choose a name that matches your Site name`
     - `Revalidate API Url`: `Provide URL to Revalidate API of your Vercel project, e.g. https://vercel-isr-test.vercel.app/api/revalidate`
     - `Secret`: `Enter the REVALIDATION_SECRET value from your Vercel project settings`

### Running the Project Locally

1. Install dependencies: `npm install  `

2. Start the development server: `npm run dev  `
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The project should now be running locally, and you can test the revalidation process using the Sitecore PowerShell script in your Sitecore instance.
Note that Next.js is re-generating SSG pages on each request, so you will need to deploy to Vercel to see the revalidation in action.

#### Vercel deployment steps:

- Set up your Vercel project and point it to your github repo, set up OOTB build process
- Make sure to configure the above environment variables in your Vercel project settings before building & deploying the project, otherwise the build will fail with SSG-related errors

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
