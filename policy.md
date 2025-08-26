# 🔧 Cursor Prompt: Fix Firebase Storage upload blocked by CSP

## Goal

Resolve the browser error that blocks Firebase **Storage** uploads due to a missing/overridden **Content‑Security‑Policy (CSP)** `connect-src` entry.

## Context (copy into Cursor as system prompt for the repo)

* App: Next.js 15 (App Router)
* Error seen in console and stacktrace:

  ```
  Refused to connect to 'https://firebasestorage.googleapis.com/…' because it violates the following Content Security Policy directive: "connect-src 'self' https://api.stripe.com https://www.googleapis.com https://firestore.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://api.calendly.com https://auth.calendly.com".
  ```
* This means the **active** CSP delivered to the browser **does not include** Firebase Storage origins. Either our `next.config` header didn’t apply, is overridden by another header (e.g., meta tag, server/Vercel config), or we have multiple CSP headers where the browser uses the most restrictive one.

## Acceptance criteria

1. Uploads via `@firebase/storage` (`uploadBytes`/`uploadBytesResumable`) succeed with **no CSP violations**.
2. Network tab shows requests to `https://firebasestorage.googleapis.com` (and any redirects to `https://storage.googleapis.com`) complete with **200/204**.
3. Document response headers include a **single** `Content-Security-Policy` header containing the Firebase Storage origins.
4. Images/preview via blob URLs work; no `img-src`/`media-src` CSP errors.

---

## Diagnosis checklist (run in repo)

1. **Confirm delivered CSP on the HTML document** (don’t inspect fetch/XHR—inspect the *document*):

   * Open DevTools → **Network** → reload → click the top document → **Headers** → locate `Content-Security-Policy`.
   * It should contain `firebasestorage.googleapis.com` and `storage.googleapis.com` inside `connect-src`.
2. **Check for duplicate/overriding CSP sources**:

   * Search repo:

     ```bash
     rg -n "Content-Security-Policy|http-equiv=\"Content-Security-Policy\"|meta http-equiv" -S
     rg -n "connect-src" -S
     ```
   * Places to check: `next.config.*`, `app/**/layout.tsx`, `pages/_document.tsx`, any middleware or custom server, headers set in edge functions.
3. **If deploying**: verify platform-level headers aren’t overriding (e.g., Vercel Project → Settings → Headers). For local dev, check any reverse proxy (nginx, dev proxy) not injecting CSP.
4. **Ensure Next.js is actually using updated headers**:

   * Stop dev server and clear cache:

     ```bash
     pnpm clean || true
     rm -rf .next && pnpm dev
     ```
   * Hard reload browser (Ctrl+Shift+R) to bypass cached headers.
5. **Verify the Firebase Storage host** we hit is exactly `https://firebasestorage.googleapis.com` (SDK may redirect to `https://storage.googleapis.com`). Both must be allowed in CSP.

---

## Required changes

### 1) Single source of truth CSP via `next.config.(js|ts)`

Add/ensure this CSP (merge with your existing if needed). **JS version**:

```js
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  // ✅ Firebase Storage + Google auth/services
  "connect-src 'self' https://firebasestorage.googleapis.com https://storage.googleapis.com https://www.googleapis.com https://firestore.googleapis.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com https://accounts.google.com https://oauth2.googleapis.com https://api.stripe.com https://api.calendly.com https://auth.calendly.com",
  // Rendered media & images
  "img-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com https://images.unsplash.com https://via.placeholder.com",
  "media-src 'self' data: blob: https://firebasestorage.googleapis.com https://storage.googleapis.com",
  "font-src 'self' data:",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://calendly.com https://*.calendly.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

export default {
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Content-Security-Policy', value: csp },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};
```

> **Important:** Remove any `<meta http-equiv="Content-Security-Policy" …>` tags from layouts/documents to avoid conflicts. The browser may combine headers, and the most restrictive `connect-src` wins.

### 2) Next Image domains (for previews from Storage)

```js
images: {
  domains: ['images.unsplash.com','via.placeholder.com','firebasestorage.googleapis.com','storage.googleapis.com'],
}
```

### 3) Verify Storage SDK usage

In `lib/services/ResourcesService.ts` ensure you’re using the SDK methods (these hit the allowed hosts):

```ts
import { getStorage, ref, uploadBytesResumable } from 'firebase/storage';

const storage = getStorage(app); // or getStorage(app, 'gs://<bucket>')
const fileRef = ref(storage, `resources/documents/${filename}`);
await uploadBytesResumable(fileRef, fileBlob, { contentType });
```

Avoid manual `fetch` to the REST endpoint unless you’ve mirrored all `X-Goog-Upload-*` headers and CSP allows it.

---

## Verification steps

1. Restart dev server: `Ctrl+C` then `pnpm dev` (headers only apply on server restart).
2. Hard reload the page. Open **Network → top document** → check `Content-Security-Policy` contains both Firebase Storage hosts.
3. Upload a file and confirm the request to `firebasestorage.googleapis.com` is **not** blocked.
4. If still blocked, repeat the **Diagnosis checklist**—look for a second CSP source.

---

## Troubleshooting matrix

| Symptom                                                 | Likely cause                                          | Fix                                                      |
| ------------------------------------------------------- | ----------------------------------------------------- | -------------------------------------------------------- |
| Error still shows old `connect-src` list                | Old CSP from a `<meta http-equiv>` or platform header | Remove meta tag / platform header; keep only Next header |
| CSP header appears twice                                | Multiple sources (Next + middleware/server)           | Consolidate to one place                                 |
| Upload still blocked but CSP looks correct              | Browser cached document                               | Hard reload or open in new incognito window              |
| Requests go to `storage.googleapis.com` and are blocked | Missing host in CSP                                   | Add `https://storage.googleapis.com` to `connect-src`    |

---

## Done when ✅

* Upload succeeds, no CSP errors, and only one CSP header is present.
* A brief comment is added in `next.config.*` describing why Firebase Storage origins are required.
