import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ToasterProvider from "@/components/admin/ToasterProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { RecycleBinProvider } from "@/contexts/RecycleBinContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { TestimonialProvider } from "@/contexts/TestimonialContext";
import { WorkExperienceProvider } from "@/contexts/WorkExperienceContext";
import { ContactSubmissionProvider } from "@/contexts/ContactSubmissionContext";
import AppLoader from "@/components/admin/AppLoader";
import { SessionMonitor } from "@/components/SessionMonitor";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Admin Panel",
  description: "Admin panel for managing Gaurav's portfolio",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 min-h-screen`}
    >
      <LoadingProvider>
        <NotificationProvider>
          <RecycleBinProvider>
            <ProjectProvider>
              <TestimonialProvider>
                <WorkExperienceProvider>
                  <ContactSubmissionProvider>
                    <ToasterProvider />
                    <AppLoader />
                    <SessionMonitor />
                    {children}
                  </ContactSubmissionProvider>
                </WorkExperienceProvider>
              </TestimonialProvider>
            </ProjectProvider>
          </RecycleBinProvider>
        </NotificationProvider>
      </LoadingProvider>
    </div>
  );
}
