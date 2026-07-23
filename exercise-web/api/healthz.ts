export const config = {
    runtime: 'edge',
};

export default function handler() {
    return new Response(JSON.stringify({ message: "Healthy!", method: "GET" }), {
        headers: { "Content-Type": "application/json" },
    });
}