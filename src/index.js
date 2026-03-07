import { promises as fs } from "fs";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
    name: "memex-mcp-server",
    version: "1.0.0",
});

const promptPath = fileURLToPath(
    new URL("../modules/prompts/generate-tailored-cv.txt", import.meta.url)
);

server.registerPrompt(
    "generate-tailored-cv",
    {
        title: "generate tailored cv",
        description: "generate tailored cv based on the user's profile and preferences",
        argsSchema: {
            jobDescriptionUrl: {
                type: "string",
                description: "the url of the job description",
            },
        },
    },
    async (args, _extra) => {
        try {
            const template = await fs.readFile(promptPath, "utf-8");
            const text = template.replace("{{jobDescriptionUrl}}", args.jobDescriptionUrl ?? "");
            return {
                messages: [
                    {
                        role: "assistant",
                        content: {
                            type: "text",
                            text,
                        },
                    },
                ],
            };
        } catch (err) {
            throw new Error(`Error reading prompt file: ${err}`);
        }
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("memex mcp server started");
}

main().catch((err) => {
    console.error("Error running memex mcp server:", err);
    process.exit(1);
});
