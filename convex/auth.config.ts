export default {
    providers: [
      {
        domain: process.env.CLERK_JWKS_URL,
        applicationID: "convex",
      },
    ]
  };