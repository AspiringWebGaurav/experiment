"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Navbar from "@/components/admin/Navbar";
import Footer from "@/components/admin/Footer";
import Breadcrumb from "@/components/admin/Breadcrumb";
import HorizontalScrollPanel, {
  PanelOption,
} from "@/components/admin/HorizontalScrollPanel";
import HorizontalScrollPanelMobile from "@/components/admin/mobile/HorizontalScrollPanel";
import ProjectManager from "@/components/admin/ProjectManager";
import TestimonialManager from "@/components/admin/TestimonialManager";
import WorkExperienceManager from "@/components/admin/WorkExperienceManager";
import ContactSubmissionManager from "@/components/admin/ContactSubmissionManager";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Panel options
  const panelOptions: PanelOption[] = [
    { id: "projects", label: "Projects", icon: "📁" },
    { id: "testimonials", label: "Testimonials", icon: "💬" },
    { id: "work-experience", label: "Work Experience", icon: "💼" },
    { id: "contact-submissions", label: "Contact Submissions", icon: "📧" },
    // Future options can be added here
    // { id: "new-category", label: "New Category", icon: "🎯" },
  ];

  // Get active section from URL params, default to "projects"
  const tabParam = searchParams.get("tab");
  const validTab = panelOptions.find((opt) => opt.id === tabParam);
  const [activeSection, setActiveSection] = useState(
    validTab ? tabParam : "projects"
  );

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Mobile breakpoint at 768px
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync active section with URL params on mount and when URL changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTab = panelOptions.find((opt) => opt.id === tabParam);

    if (validTab) {
      setActiveSection(tabParam!);
    } else if (!tabParam) {
      // If no tab param, set default to projects in URL
      router.replace(`${pathname}?tab=projects`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  useEffect(() => {
    setLoading(false);
    setAuthorized(true);
  }, []);

  // Handle tab change and update URL
  const handleTabChange = (newTab: string) => {
    setActiveSection(newTab);
    router.push(`${pathname}?tab=${newTab}`, { scroll: false });
  };

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
            onOptionChange={handleTabChange}
          />
        ) : (
          <HorizontalScrollPanel
            options={panelOptions}
            activeOption={activeSection}
            onOptionChange={handleTabChange}
          />
        )}
      </div>

      {/* Main Content - Scrollable Section */}
      <main className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide">
        <div className="max-w-7xl mx-auto p-6">
          {activeSection === "projects" && <ProjectManager />}
          {activeSection === "testimonials" && <TestimonialManager />}
          {activeSection === "work-experience" && <WorkExperienceManager />}
          {activeSection === "contact-submissions" && (
            <ContactSubmissionManager />
          )}
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
