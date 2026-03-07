import { promises as fs } from "fs";
import { join, relative } from "path";
import { fileURLToPath } from "url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

const server = new McpServer({
    name: "memex-mcp-server",
    version: "1.0.0",
});

// ── Helpers ────────────────────────────────────────────────────────────────────

function mimeType(filePath) {
    if (filePath.endsWith(".json")) return "application/json";
    if (filePath.endsWith(".md"))   return "text/markdown";
    return "text/plain";
}

async function discoverFiles(dir, extensions, { exclude = [] } = {}) {
    let entries;
    try {
        entries = await fs.readdir(dir, { withFileTypes: true, recursive: true });
    } catch {
        return [];
    }
    return entries
        .filter(e => {
            if (!e.isFile()) return false;
            if (!extensions.some(ext => e.name.endsWith(ext))) return false;
            const full = join(e.parentPath, e.name);
            return !exclude.some(pattern => pattern.test(full));
        })
        .map(e => join(e.parentPath, e.name));
}

// ── Resources ──────────────────────────────────────────────────────────────────

async function registerResources() {
    const [coreFiles, moduleFiles, viewFiles] = await Promise.all([
        discoverFiles(join(repoRoot, "core"), [".json"]),
        discoverFiles(join(repoRoot, "modules"), [".json"], { exclude: [/schema\.json$/] }),
        discoverFiles(join(repoRoot, "views"), [".md"]),
    ]);

    for (const absPath of [...coreFiles, ...moduleFiles, ...viewFiles]) {
        const rel  = relative(repoRoot, absPath).replace(/\\/g, "/");
        const uri  = `memex://${rel}`;
        const mime = mimeType(absPath);

        server.registerResource(rel, uri, { mimeType: mime }, async (resourceUri) => {
            const text = await fs.readFile(absPath, "utf-8");
            return { contents: [{ uri: resourceUri.href, mimeType: mime, text }] };
        });
    }
}

// ── Prompts ────────────────────────────────────────────────────────────────────

const promptPath = join(repoRoot, "modules/prompts/generate-tailored-cv.txt");

server.registerPrompt(
    "generate-tailored-cv",
    {
        title: "generate tailored cv",
        description: "generate tailored cv based on the user's profile and preferences",
        argsSchema: {
            jobDescriptionUrl: z.string().describe("the url of the job description"),
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
                        content: { type: "text", text },
                    },
                ],
            };
        } catch (err) {
            throw new Error(`Error reading prompt file: ${err}`);
        }
    }
);

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
    await registerResources();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("memex mcp server started");
}

main().catch((err) => {
    console.error("Error running memex mcp server:", err);
    process.exit(1);
});
