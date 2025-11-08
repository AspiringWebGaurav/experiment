"use client";

import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import { X, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContactSubmissions } from "@/contexts/ContactSubmissionContext";
import {
  validateContactSubmission,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
  MIN_MESSAGE_LENGTH,
  MAX_MESSAGE_LENGTH,
} from "@/types/contactSubmission";

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

export default function ContactFormModal({
  isOpen,
  onClose,
}: ContactFormModalProps) {
  const { createSubmission } = useContactSubmissions();
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // EmailJS configuration
  const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
  const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || "";
  const USER_TEMPLATE_ID =
    process.env.NEXT_PUBLIC_EMAILJS_USER_TEMPLATE_ID || "";
  const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";

  // Initialize EmailJS
  useEffect(() => {
    if (PUBLIC_KEY) {
      emailjs.init(PUBLIC_KEY);
    }
  }, [PUBLIC_KEY]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "", email: "", message: "" });
      setErrors({});
      setStatus("idle");
      setShowSuccessModal(false);
    }
  }, [isOpen]);

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const validationErrors = validateContactSubmission(formData);
    const errorMap: Record<string, string> = {};
    validationErrors.forEach((err) => {
      errorMap[err.field] = err.message;
    });
    setErrors(errorMap);
    return validationErrors.length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setStatus("submitting");

    try {
      // Get user agent and IP (IP will be set on server side for security)
      const userAgent = navigator.userAgent;

      // Submit to database
      const result = await createSubmission({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        message: formData.message.trim(),
        userAgent,
      });

      if (!result.success) {
        setStatus("error");
        setErrors({
          general:
            result.error || "Failed to submit form. Please try again later.",
        });
        return;
      }

      // Send confirmation email to user via EmailJS
      try {
        await emailjs.send(
          SERVICE_ID,
          USER_TEMPLATE_ID,
          {
            to_email: formData.email,
            to_name: formData.name,
            from_name: "Gaurav Patil",
            message: formData.message,
          },
          PUBLIC_KEY
        );
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Don't fail the submission if email fails
      }

      // Send notification to admin via EmailJS
      try {
        await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            from_name: formData.name,
            from_email: formData.email,
            message: formData.message,
            to_name: "Gaurav",
          },
          PUBLIC_KEY
        );
      } catch (emailError) {
        console.error("Error sending admin notification:", emailError);
      }

      setStatus("success");
      setShowSuccessModal(true);

      // Auto-close after 5 seconds
      setTimeout(() => {
        onClose();
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setStatus("error");
      setErrors({
        general: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  // Auto-close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && status !== "submitting") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, status]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => status !== "submitting" && onClose()}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-black-100 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Success State */}
            {showSuccessModal ? (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 15, stiffness: 200 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-white-200 mb-4">
                  Thank you for reaching out. I&apos;ve received your message
                  and will get back to you soon.
                </p>
                <p className="text-sm text-white-100 mb-6">
                  Please check your email inbox for a confirmation message from{" "}
                  <span className="text-purple font-semibold">
                    gauravbackendservices
                  </span>
                  . If you don&apos;t see it, please check your spam folder.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-purple hover:bg-purple/80 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Let&apos;s Get in Touch
                    </h2>
                    <p className="text-sm text-white-200 mt-1">
                      I&apos;d love to hear from you!
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={status === "submitting"}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Close contact form"
                    title="Close"
                  >
                    <X className="w-5 h-5 text-white-200" />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  {/* General Error */}
                  {errors.general && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-400">{errors.general}</p>
                    </div>
                  )}

                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      placeholder="John Doe"
                      className={`w-full px-4 py-3 bg-black-200 border ${
                        errors.name ? "border-red-500" : "border-white/10"
                      } rounded-lg text-white placeholder-white-100 focus:outline-none focus:border-purple transition-colors disabled:opacity-50`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                    )}
                    <p className="text-xs text-white-100 mt-1">
                      {MIN_NAME_LENGTH}-{MAX_NAME_LENGTH} characters
                    </p>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Your Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-3 bg-black-200 border ${
                        errors.email ? "border-red-500" : "border-white/10"
                      } rounded-lg text-white placeholder-white-100 focus:outline-none focus:border-purple transition-colors disabled:opacity-50`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.email}
                      </p>
                    )}
                    <p className="text-xs text-white-100 mt-1">
                      We&apos;ll use this email for further communication
                    </p>
                  </div>

                  {/* Message Field */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-white mb-2"
                    >
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      disabled={status === "submitting"}
                      rows={5}
                      placeholder="Tell me about your project or idea..."
                      className={`w-full px-4 py-3 bg-black-200 border ${
                        errors.message ? "border-red-500" : "border-white/10"
                      } rounded-lg text-white placeholder-white-100 focus:outline-none focus:border-purple transition-colors resize-none disabled:opacity-50`}
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400 mt-1">
                        {errors.message}
                      </p>
                    )}
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-white-100">
                        {MIN_MESSAGE_LENGTH}-{MAX_MESSAGE_LENGTH} characters
                      </p>
                      <p className="text-xs text-white-100">
                        {formData.message.length}/{MAX_MESSAGE_LENGTH}
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full px-6 py-3 bg-purple hover:bg-purple/80 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {status === "submitting" ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>

                  {/* Privacy Notice */}
                  <p className="text-xs text-center text-white-100">
                    By submitting this form, you agree to receive email
                    communications from me regarding your inquiry.
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
