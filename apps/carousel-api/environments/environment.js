/**
 * Replace the apiKey for the local build
 */
export const environment = {
  production: true,
  apiKey: process.env.apiKey,
  port: process.env.PORT || "3333",
  apiSecret: process.env.apiSecret,
  host: "0.0.0.0"
};
