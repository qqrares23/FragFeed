import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "./contexts/ThemeContext";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

// Use environment variable for Clerk publishable key
const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "pk_test_dW5pcXVlLWhvdW5kLTcyLmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ClerkProvider publishableKey={clerkPublishableKey}>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </ThemeProvider>
  </React.StrictMode>,
);