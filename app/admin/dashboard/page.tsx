"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import Footer from "@/components/admin/Footer";
import Breadcrumb from "@/components/admin/Breadcrumb";
import HorizontalScrollPanel, {
  PanelOption,
} from "@/components/admin/HorizontalScrollPanel";
import HorizontalScrollPanelMobile from "@/components/admin/mobile/HorizontalScrollPanel";

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [activeSection, setActiveSection] = useState("projects");
  const [isMobile, setIsMobile] = useState(false);

  // Panel options - Single option for now, more can be added in future
  const panelOptions: PanelOption[] = [
    { id: "projects", label: "Projects", icon: "📁" },
    // Future options can be added here
    // { id: "new-category", label: "New Category", icon: "🎯" },
  ];

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint at 768px
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    setLoading(false);
    setAuthorized(true);
  }, []);

  if (loading) {
    return null;
  }

  if (!authorized) return null;

  // Get the current active section data for breadcrumb
  const getCurrentSectionData = () => {
    const activeOption = panelOptions.find((opt) => opt.id === activeSection);
    return activeOption
      ? { label: activeOption.label, icon: activeOption.icon }
      : { label: "Projects", icon: "📁" };
  };

  const currentSection = getCurrentSectionData();

  return (
    <div className="h-screen flex flex-col bg-surface overflow-hidden">
      <div className="shrink-0">
        <Navbar onVersionNotesClick={() => {}} />
        <Breadcrumb
          activeTab={currentSection.label}
          activeTabIcon={currentSection.icon}
        />

        {/* Horizontal Scrollable Panel - Responsive Component */}
        {isMobile ? (
          <HorizontalScrollPanelMobile
            options={panelOptions}
            activeOption={activeSection}
            onOptionChange={setActiveSection}
          />
        ) : (
          <HorizontalScrollPanel
            options={panelOptions}
            activeOption={activeSection}
            onOptionChange={setActiveSection}
          />
        )}
      </div>

      {/* Main Content - Scrollable Projects Section */}
      <main className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
        <div className="max-w-7xl mx-auto p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {panelOptions.find((opt) => opt.id === activeSection)?.label ||
                  "Projects"}
              </h1>
              <p className="text-gray-600">Manage your portfolio projects</p>
            </div>

            {/* Coming Soon Section */}
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-8xl">🚀</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Coming Soon
                </h2>
                <p className="text-lg text-gray-600 mb-2">
                  Project management features are under development
                </p>
                <p className="text-sm text-gray-500">
                  Stay tuned for exciting updates!
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="shrink-0">
        <Footer />
      </div>

      {/* Hide scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
