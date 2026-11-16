import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const origLookup = dns.lookup;
(dns as any).lookup = (hostname: string, options: any, callback: any) => {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (hostname.includes("neonauth")) {
    dns.resolve4(hostname, (err, addresses) => {
      if (err || !addresses || !addresses.length) return origLookup(hostname, options, callback);
      if (options?.all) {
        callback(null, addresses.map((a) => ({ address: a, family: 4 })));
      } else {
        callback(null, addresses[0], 4);
      }
    });
  } else {
    origLookup(hostname, options, callback);
  }
};

import { createAuthClient } from "@neondatabase/auth";

const NEON_AUTH_URL = "https://ep-snowy-term-be1jqdqs.neonauth.c-9.us-east-2.aws.neon.tech/neondb/auth";

async function testNeonAuth() {
  console.log(`Connecting to Neon Managed Auth at: ${NEON_AUTH_URL}`);
  const auth = createAuthClient(NEON_AUTH_URL, {
    fetchOptions: {
      headers: {
        Origin: "http://localhost:5173",
      },
    },
  });

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = `P@ssw0rd_${Date.now()}!`;
  const testName = "Neon Test Engineer";

  console.log(`\n1. Attempting sign-up with real user: ${testEmail}`);
  const signUpRes = await auth.signUp.email({
    email: testEmail,
    password: testPassword,
    name: testName,
    callbackURL: "http://localhost:5173/",
  });

  if (signUpRes.error) {
    console.error("❌ Sign up failed:", signUpRes.error);
    return;
  }

  console.log("✅ Sign-up SUCCESS!");
  console.log("   User ID:", signUpRes.data?.user?.id);
  console.log("   User Name:", signUpRes.data?.user?.name);
  console.log("   User Email:", signUpRes.data?.user?.email);

  console.log("\n2. Attempting sign-in with the created user...");
  const signInRes = await auth.signIn.email({
    email: testEmail,
    password: testPassword,
    callbackURL: "http://localhost:5173/",
  });

  if (signInRes.error) {
    console.error("❌ Sign in failed:", signInRes.error);
    return;
  }

  console.log("✅ Sign-in SUCCESS!");
  console.log("   Active User:", signInRes.data?.user?.email);
  console.log("   Session ID:", signInRes.data?.session?.id);

  console.log("\n🎉 NEON MANAGED BETTER AUTH IS FULLY OPERATIONAL!");
}

testNeonAuth().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
