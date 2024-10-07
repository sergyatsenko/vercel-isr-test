import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");

  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  try {
    const { pages } = await request.json();

    if (!Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { message: "Invalid or empty pages array" },
        { status: 400 }
      );
    }

    const revalidatedPages = pages.map((page) => {
      revalidatePath(page);
      return page;
    });

    return NextResponse.json({
      revalidated: true,
      pages: revalidatedPages,
      now: Date.now(),
    });
  } catch (error) {
    console.error("Error during revalidation:", error);
    return NextResponse.json(
      {
        message: "Invalid JSON payload",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 400 }
    );
  }
}
