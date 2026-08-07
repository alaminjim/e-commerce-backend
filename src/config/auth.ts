import { env } from "./env";
import { prisma } from "./prisma";

// Lazily initialize Better Auth using dynamic imports to avoid requiring ESM
// modules at module-load time (which fails in CommonJS/require()). We export
// a proxy `auth` so existing call sites (e.g. `auth.api.getSession(...)`) keep
// working without changing their code.

let _realAuth: any | null = null;
const initAuth = async () => {
  if (_realAuth) return _realAuth;
  const mod = await import("better-auth");
  const adapters = await import("better-auth/adapters/prisma");
  const betterAuth = (mod as any).betterAuth ?? (mod as any)._default ?? (mod as any);
  const prismaAdapter =
    (adapters as any).prismaAdapter ?? (adapters as any)._default ?? (adapters as any);

  _realAuth = betterAuth({
    appName: "Omers",
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: env.CLIENT_ORIGINS,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      maxPasswordLength: 100,
    },
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      },
      facebook: {
        clientId: env.FACEBOOK_CLIENT_ID,
        clientSecret: env.FACEBOOK_CLIENT_SECRET,
      },
    },
    user: {
      additionalFields: {
        phone: { type: "string", required: false },
        role: {
          type: "string",
          required: true,
          defaultValue: "USER",
          input: false,
        },
        status: {
          type: "string",
          required: true,
          defaultValue: "ACTIVE",
          input: false,
        },
      },
      fields: { image: "avatar" },
    },
  });

  return _realAuth;
};

// Generic lazy proxy creator that forwards property access and method calls
// to the real `auth` instance after initialization.
const createLazyProxy = (path: Array<string | number> = []) =>
  new Proxy(function () {}, {
    get(_target, prop) {
      return createLazyProxy([...path, String(prop)]);
    },
    apply(_target, _thisArg, args) {
      return (async () => {
        const real = await initAuth();
        let cur: any = real;
        for (const p of path) cur = cur[p];
        if (typeof cur === "function") {
          return cur.apply(real, args);
        }
        return cur;
      })();
    },
  });

export const auth: any = createLazyProxy();
