export const config = {
    runtime: 'edge', // Runs on Vercel Edge Runtime (fast & low latency)
};

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const muscle = url.searchParams.get("muscle");

    const res = await fetch(`https://api.api-ninjas.com/v1/exercises?muscle=${muscle}`, {
        headers: {
            "X-Api-Key": process.env.NINJA_API_KEY || "",
        },
    });

    const data = await res.json();

    return new Response(JSON.stringify(data), {
        status: res.status,
        headers: { "Content-Type": "application/json" },
    });
}