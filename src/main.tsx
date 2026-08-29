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
import { ArticleDerivVsForex } from "./pages/ArticleDerivVsForex";
import { ArticleRiskManagement } from "./pages/ArticleRiskManagement";
import { ArticleBeginnersMT5 } from "./pages/ArticleBeginnersMT5";
import { RiskDisclosure } from "./pages/RiskDisclosure";
import { Contact } from "./pages/Contact";
import { Article } from "./pages/Article";
import { Tools } from "./pages/Tools";
import { Desk } from "./pages/Desk";
import { Kit } from "./pages/Kit";
import { Auth } from "./pages/Auth";
import { MembersDashboard } from "./pages/MembersDashboard";
import { RequireAuth } from "./components/RequireAuth";
import { RequireAdmin } from "./components/RequireAdmin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthProvider } from "./components/AuthProvider";
import "./styles.css";
import "./managed-strategy.css";

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
        { path: "tools", element: <Tools /> },
        { path: "desk", element: <Desk /> },
        { path: "kit", element: <Kit /> },
        { path: "blog", element: <Blog /> },
        { path: "blog/winning-strategies-deriv-synthetic-indices", element: <LongArticle /> },
        { path: "blog/deriv-vs-traditional-forex-brokers", element: <ArticleDerivVsForex /> },
        { path: "blog/risk-management-crash-boom-indices", element: <ArticleRiskManagement /> },
        { path: "blog/beginners-guide-deriv-mt5", element: <ArticleBeginnersMT5 /> },
        { path: "blog/:slug", element: <Article /> },
        { path: "risk-disclosure", element: <RiskDisclosure /> },
        { path: "contact", element: <Contact /> },
        { path: "auth", element: <Auth /> },
        { 
          element: <RequireAuth />,
          children: [
            { path: "members", element: <MembersDashboard /> },
            { element: <RequireAdmin />, children: [{ path: "admin/managed-strategy", element: <AdminDashboard /> }] }
          ]
        }
      ]
    }
  ],
  { basename: "/deriv-affiliate-launchpad-template" }
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider><RouterProvider router={router} /></AuthProvider>
  </React.StrictMode>
);
