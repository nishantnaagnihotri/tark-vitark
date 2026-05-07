#!/usr/bin/env tsx
/**
 * upload-r2-evidence.ts — Upload local evidence files to Cloudflare R2 and
 * print their public URLs for PR-body embedding.
 *
 * Usage:
 *   set -a && source local.env && set +a
 *   npx tsx scripts/upload-r2-evidence.ts --prefix pr-224/11a00... screenshots/runtime-qa/pr-224
 *
 * Options:
 *   --prefix <key-prefix>   Required R2 object prefix, for example pr-224/<sha>
 *   --dry-run               Resolve inputs and URLs without uploading
 *   --markdown              Print markdown image lines after upload results
 *   --output-format json    Emit machine-readable JSON instead of text
 *
 * Env:
 *   CLOUDFLARE_ACCOUNT_ID   Account id used to derive the endpoint when R2_ENDPOINT is unset
 *   R2_BUCKET_NAME          Bucket name
 *   R2_REGION               Region; defaults to auto
 *   R2_ENDPOINT             Optional explicit endpoint. If unset, defaults to https://<ACCOUNT_ID>.r2.cloudflarestorage.com
 *   R2_PUBLIC_BASE_URL      Public base URL, for example https://<bucket-id>.r2.dev
 *   R2_ACCESS_KEY_ID        Access key id / token id
 *   R2_SECRET_ACCESS_KEY    Required unless R2_API_TOKEN is set. If it looks like a raw cfat_ token, this script derives the S3 secret by SHA-256 hashing it.
 *   R2_API_TOKEN            Optional raw API token. When present, this is preferred and hashed into the S3 secret.
 */

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, relative, resolve } from "node:path";

type OutputFormat = "text" | "json";

interface UploadCandidate {
    absolutePath: string;
    relativeKeyPath: string;
}

interface UploadRecord {
    filePath: string;
    key: string;
    url: string;
    uploaded: boolean;
}

let prefix = "";
let dryRun = false;
let markdown = false;
let outputFormat: OutputFormat = "text";

const argv = process.argv.slice(2);

function requireOptionValue(option: string, value: string | undefined): string {
    if (!value || value.startsWith("--")) {
        console.error(`Missing value for ${option}`);
        process.exit(1);
    }
    return value;
}

for (let index = 0; index < argv.length;) {
    if (argv[index] === "--prefix") {
        prefix = requireOptionValue("--prefix", argv[index + 1]);
        argv.splice(index, 2);
    } else if (argv[index] === "--dry-run") {
        dryRun = true;
        argv.splice(index, 1);
    } else if (argv[index] === "--markdown") {
        markdown = true;
        argv.splice(index, 1);
    } else if (argv[index] === "--output-format") {
        const format = requireOptionValue("--output-format", argv[index + 1]);
        if (format !== "text" && format !== "json") {
            console.error(`Invalid value for --output-format: ${format}`);
            process.exit(1);
        }
        outputFormat = format;
        argv.splice(index, 2);
    } else if (argv[index].startsWith("--")) {
        console.error(`Unknown option: ${argv[index]}`);
        process.exit(1);
    } else {
        index += 1;
    }
}

if (!prefix) {
    console.error("Usage: npx tsx scripts/upload-r2-evidence.ts --prefix <key-prefix> [--dry-run] [--markdown] [--output-format json] <file-or-dir> [...]");
    process.exit(1);
}

if (argv.length === 0) {
    console.error("Provide at least one file or directory to upload.");
    process.exit(1);
}

function readRequiredEnv(name: string): string {
    const value = process.env[name]?.trim();
    if (!value) {
        console.error(
            `[upload-r2-evidence] Missing required env var ${name}.\n` +
            "  Run: set -a && source local.env && set +a"
        );
        process.exit(1);
    }
    return value;
}

function resolveEndpoint(): string {
    const explicitEndpoint = process.env.R2_ENDPOINT?.trim();
    if (explicitEndpoint) {
        return explicitEndpoint;
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    if (!accountId) {
        console.error(
            "[upload-r2-evidence] Missing endpoint configuration.\n" +
            "  Set R2_ENDPOINT directly, or set CLOUDFLARE_ACCOUNT_ID to derive the default endpoint.\n" +
            "  Run: set -a && source local.env && set +a"
        );
        process.exit(1);
    }

    return `https://${accountId}.r2.cloudflarestorage.com`;
}

function sha256Hex(value: string): string {
    return createHash("sha256").update(value).digest("hex");
}

function resolveSecretAccessKey(): string {
    const apiToken = process.env.R2_API_TOKEN?.trim();
    if (apiToken) return sha256Hex(apiToken);

    const configuredSecret = readRequiredEnv("R2_SECRET_ACCESS_KEY");
    if (configuredSecret.startsWith("cfat_")) {
        return sha256Hex(configuredSecret);
    }

    return configuredSecret;
}

function normaliseKeySegment(value: string): string {
    return value.replace(/\\/g, "/").replace(/^\/+|\/+$/g, "");
}

function toPublicUrl(baseUrl: string, key: string): string {
    const encodedKey = normaliseKeySegment(key)
        .split("/")
        .map((segment) => encodeURIComponent(segment))
        .join("/");
    return `${baseUrl.replace(/\/+$/, "")}/${encodedKey}`;
}

function inferContentType(filePath: string): string {
    const extension = extname(filePath).toLowerCase();
    switch (extension) {
        case ".png":
            return "image/png";
        case ".jpg":
        case ".jpeg":
            return "image/jpeg";
        case ".webp":
            return "image/webp";
        case ".gif":
            return "image/gif";
        case ".svg":
            return "image/svg+xml";
        case ".json":
            return "application/json";
        case ".txt":
            return "text/plain; charset=utf-8";
        default:
            return "application/octet-stream";
    }
}

function collectCandidates(targetPath: string): UploadCandidate[] {
    const absolutePath = resolve(targetPath);
    if (!existsSync(absolutePath)) {
        console.error(`[upload-r2-evidence] Path does not exist: ${targetPath}`);
        process.exit(1);
    }

    const stats = statSync(absolutePath);
    if (stats.isFile()) {
        return [{ absolutePath, relativeKeyPath: basename(absolutePath) }];
    }

    if (!stats.isDirectory()) {
        console.error(`[upload-r2-evidence] Unsupported path type: ${targetPath}`);
        process.exit(1);
    }

    const entries = readdirSync(absolutePath, { withFileTypes: true })
        .sort((left, right) => left.name.localeCompare(right.name));
    const nestedFiles: UploadCandidate[] = [];

    for (const entry of entries) {
        const entryPath = resolve(absolutePath, entry.name);
        if (entry.isDirectory()) {
            nestedFiles.push(...collectCandidates(entryPath).map((candidate) => ({
                absolutePath: candidate.absolutePath,
                relativeKeyPath: normaliseKeySegment(relative(absolutePath, candidate.absolutePath)),
            })));
        } else if (entry.isFile()) {
            nestedFiles.push({
                absolutePath: entryPath,
                relativeKeyPath: normaliseKeySegment(relative(absolutePath, entryPath)),
            });
        }
    }

    return nestedFiles;
}

const bucketName = readRequiredEnv("R2_BUCKET_NAME");
const accessKeyId = readRequiredEnv("R2_ACCESS_KEY_ID");
const publicBaseUrl = readRequiredEnv("R2_PUBLIC_BASE_URL");
const region = process.env.R2_REGION?.trim() || "auto";
const endpoint = resolveEndpoint();
const secretAccessKey = resolveSecretAccessKey();

const candidates = argv.flatMap((targetPath) => collectCandidates(targetPath));

if (candidates.length === 0) {
    console.error("[upload-r2-evidence] No files found to upload.");
    process.exit(1);
}

const uploadPrefix = normaliseKeySegment(prefix);
const plannedUploads = candidates.map((candidate) => {
    const key = normaliseKeySegment(`${uploadPrefix}/${candidate.relativeKeyPath}`);
    return {
        candidate,
        key,
        url: toPublicUrl(publicBaseUrl, key),
    };
});

const keyToPaths = new Map<string, string[]>();
for (const plannedUpload of plannedUploads) {
    const collisions = keyToPaths.get(plannedUpload.key) ?? [];
    collisions.push(plannedUpload.candidate.absolutePath);
    keyToPaths.set(plannedUpload.key, collisions);
}

const duplicateKeys = Array.from(keyToPaths.entries()).filter(([, paths]) => paths.length > 1);
if (duplicateKeys.length > 0) {
    const details = duplicateKeys
        .map(([key, paths]) => `  ${key}\n${paths.map((path) => `    - ${path}`).join("\n")}`)
        .join("\n");
    console.error(
        "[upload-r2-evidence] Duplicate upload keys detected after path normalization. " +
        "Upload aborted before sending files.\n" +
        details
    );
    process.exit(1);
}

const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: true,
    credentials: {
        accessKeyId,
        secretAccessKey,
    },
});

const results: UploadRecord[] = [];

for (const plannedUpload of plannedUploads) {
    if (!dryRun) {
        await client.send(
            new PutObjectCommand({
                Bucket: bucketName,
                Key: plannedUpload.key,
                Body: readFileSync(plannedUpload.candidate.absolutePath),
                ContentType: inferContentType(plannedUpload.candidate.absolutePath),
                CacheControl: "public, max-age=31536000, immutable",
            })
        );
    }

    results.push({
        filePath: plannedUpload.candidate.absolutePath,
        key: plannedUpload.key,
        url: plannedUpload.url,
        uploaded: !dryRun,
    });
}

if (outputFormat === "json") {
    console.log(JSON.stringify({
        bucket: bucketName,
        prefix: uploadPrefix,
        dryRun,
        files: results,
    }, null, 2));
    process.exit(0);
}

console.log(
    `[upload-r2-evidence] ${dryRun ? "Dry run" : "Uploaded"} ${results.length} file${results.length === 1 ? "" : "s"} ` +
    `to r2://${bucketName}/${uploadPrefix}`
);

for (const result of results) {
    console.log(`${result.filePath} -> ${result.url}`);
}

if (markdown) {
    console.log("\nMarkdown:");
    for (const result of results) {
        const label = basename(result.filePath);
        console.log(`![${label}](${result.url})`);
    }
}
