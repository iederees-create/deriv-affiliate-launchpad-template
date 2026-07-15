import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { HowItWorks } from "./pages/HowItWorks";
import { PartnerProgramme } from "./pages/PartnerProgramme";
import { Platforms } from "./pages/Platforms";
import { Learn } from "./pages/Learn";
import { Blog } from "./pages/Blog";
import { LongArticle } from "./pages/LongArticle";
import { RiskDisclosure } from "./pages/RiskDisclosure";
import { Contact } from "./pages/Contact";
import "./styles.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "how-it-works", element: <HowItWorks /> },
        { path: "partner-programme", element: <PartnerProgramme /> },
        { path: "platforms", element: <Platforms /> },
        { path: "learn", element: <Learn /> },
        { path: "blog", element: <Blog /> },
        { path: "blog/building-a-trading-affiliate-website", element: <LongArticle /> },
        { path: "risk-disclosure", element: <RiskDisclosure /> },
        { path: "contact", element: <Contact /> }
      ]
    }
  ],
  { basename: "/deriv-affiliate-launchpad-template" }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
