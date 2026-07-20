/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_IMAGE_BASE_URL?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly TURNSTILE_SECRET_KEY?: string;
  readonly GITHUB_TOKEN?: string;
  readonly GITHUB_REPO?: string;
  readonly BLOB_READ_WRITE_TOKEN?: string;
  readonly KEYSTATIC_GITHUB_CLIENT_ID?: string;
  readonly KEYSTATIC_GITHUB_CLIENT_SECRET?: string;
  readonly KEYSTATIC_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
