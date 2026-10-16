
const http = require("http");
const { handler } = require("./function");

const server = http.createServer((req, res) => {
    if (req.method === "POST" && req.url === "/boarding-pass") {
        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {
            try {
                const event = JSON.parse(body);
                const result = handler(event);

                res.writeHead(result.statusCode, {
                    "Content-Type": "application/json"
                });

                res.end(result.body);
            } catch (error) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    message: "Invalid JSON request"
                }));
            }
        });
    } else {
        res.writeHead(404);
        res.end("Not Found");
    }
});

server.listen(3000, "0.0.0.0", () => {
    console.log("Boarding-pass service running on port 3000");
});
