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
import ProjectManager from "@/components/admin/ProjectManager";

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
          <ProjectManager />
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
