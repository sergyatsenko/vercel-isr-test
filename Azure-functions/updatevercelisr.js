const https = require("https");

module.exports = async function (context, req) {
  context.log(
    "JavaScript HTTP trigger function processed a request to update Vercel environment variables and revalidate pages"
  );

  const { variables, revalidate } = req.body || {};
  let responseMessage = "";
  context.log("body", req.body);
  context.log("variables: ", variables);
  context.log("revalidate: ", revalidate);

  try {
    if (variables && typeof variables === "object") {
      // Validate that all variables represent numbers
      const invalidVariables = Object.entries(variables).filter(
        ([key, value]) => isNaN(Number(value))
      );
      if (invalidVariables.length > 0) {
        throw new Error(
          `Invalid input: The following variables do not represent numbers: ${invalidVariables
            .map(([key]) => key)
            .join(", ")}`
        );
      }

      const projectId = process.env.VERCEL_PROJECT_ID;
      const vercelToken = process.env.VERCEL_TOKEN;

      if (!projectId || !vercelToken) {
        throw new Error(
          "Environment variables for Vercel project ID or token are missing."
        );
      }

      const results = await Promise.all(
        Object.entries(variables).map(([key, value]) =>
          createOrUpdateVercelEnv(
            context,
            projectId,
            vercelToken,
            key,
            value.toString()
          )
        )
      );

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      responseMessage = `Updated/Created ${successCount} environment variables successfully across all environments. ${failCount} failed. `;

      // Log detailed results
      results.forEach((result) => {
        if (result.success) {
          context.log(`Successfully ${result.action} variable: ${result.key}`);
        } else {
          context.log.error(
            `Failed to ${result.action} variable: ${result.key}. Error: ${result.error}`
          );
        }
      });
    } else {
      responseMessage = "No environment variables were updated or created. ";
    }

    if (revalidate && Array.isArray(revalidate.pages)) {
      const revalidateHost = process.env.REVALIDATE_HOST;
      const revalidateSecret = process.env.REVALIDATE_SECRET;

      if (!revalidateHost || !revalidateSecret) {
        throw new Error(
          "Revalidation host or secret is missing from environment variables."
        );
      }

      await revalidatePages(
        context,
        revalidateHost,
        revalidateSecret,
        revalidate.pages
      );
      responseMessage += `Revalidation request sent for ${revalidate.pages.length} pages.`;
    } else {
      responseMessage += "No pages were revalidated.";
    }

    context.res = { status: 200, body: responseMessage };
  } catch (error) {
    context.log.error("Error in function execution:", error);
    context.res = { status: 400, body: `An error occurred: ${error.message}` };
  }
};

async function createOrUpdateVercelEnv(context, projectId, token, key, value) {
  try {
    context.log(
      `Processing environment variable '${key}' for all environments`
    );
    const existingEnv = await getVercelEnv(context, projectId, token, key);

    if (existingEnv) {
      context.log(
        `Updating existing environment variable '${key}' for all environments`
      );
      await updateVercelEnv(
        context,
        projectId,
        token,
        key,
        value,
        existingEnv.id
      );
      return { success: true, key, action: "update" };
    } else {
      context.log(
        `Creating new environment variable '${key}' for all environments`
      );
      await createVercelEnv(context, projectId, token, key, value);
      return { success: true, key, action: "create" };
    }
  } catch (error) {
    context.log.error(
      `Failed to process environment variable '${key}' for all environments:`,
      error
    );
    return {
      success: false,
      key,
      error: error.message,
      action: existingEnv ? "update" : "create",
    };
  }
}

async function getVercelEnv(context, projectId, token, key) {
  try {
    const result = await makeVercelRequest(
      context,
      projectId,
      token,
      "GET",
      `/v9/projects/${projectId}/env`
    );
    const envVar = result.envs.find((env) => env.key === key);
    return envVar || null;
  } catch (error) {
    context.log.error(`Error fetching environment variables:`, error);
    throw error;
  }
}

async function createVercelEnv(context, projectId, token, key, value) {
  try {
    const result = await makeVercelRequest(
      context,
      projectId,
      token,
      "POST",
      `/v9/projects/${projectId}/env`,
      {
        key,
        value: value.toString(),
        type: "plain",
        target: ["production", "preview", "development"],
      }
    );
    context.log(`Creation result for '${key}':`, JSON.stringify(result));
    if (!result || !result.id) {
      throw new Error(
        `Failed to create environment variable '${key}'. Unexpected response from Vercel API.`
      );
    }
    return result;
  } catch (error) {
    context.log.error(`Error creating environment variable '${key}':`, error);
    throw error;
  }
}

async function updateVercelEnv(context, projectId, token, key, value, envId) {
  try {
    const result = await makeVercelRequest(
      context,
      projectId,
      token,
      "PATCH",
      `/v9/projects/${projectId}/env/${envId}`,
      {
        value: value.toString(),
      }
    );
    context.log(`Update result for '${key}':`, JSON.stringify(result));
    if (!result || !result.value) {
      throw new Error(
        `Failed to update environment variable '${key}'. Unexpected response from Vercel API.`
      );
    }
    return result;
  } catch (error) {
    context.log.error(`Error updating environment variable '${key}':`, error);
    throw error;
  }
}

function makeVercelRequest(
  context,
  projectId,
  token,
  method,
  path,
  bodyData = null
) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.vercel.com",
      port: 443,
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(
            new Error(`HTTP Status Code: ${res.statusCode}, Body: ${data}`)
          );
        }
      });
    });

    req.on("error", (error) => {
      context.log.error(
        `Error in Vercel API request (${method} ${path}):`,
        error
      );
      reject(error);
    });

    if (bodyData) {
      req.write(JSON.stringify(bodyData));
    }
    req.end();
  });
}

function revalidatePages(context, host, secret, pages) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ pages });
    const options = {
      hostname: host,
      port: 443,
      path: `/api/revalidate?secret=${encodeURIComponent(secret)}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      let responseBody = "";
      res.on("data", (chunk) => {
        responseBody += chunk;
      });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          context.log("Revalidation request successful");
          resolve(responseBody);
        } else {
          context.log.error(
            `Revalidation request failed: Status ${res.statusCode}, Body: ${responseBody}`
          );
          reject(
            new Error(
              `Revalidation failed: HTTP Status Code: ${res.statusCode}, Body: ${responseBody}`
            )
          );
        }
      });
    });

    req.on("error", (error) => {
      context.log.error("Error in revalidation request:", error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}
