/**
 * Testimonial type definitions
 * Supports dynamic testimonials with company logos
 */

export interface Testimonial {
  id: string;
  quote: string; // testimonial text
  name: string; // person name
  title: string; // person's job title
  img?: string; // person's image URL (optional)
  companyLogo?: string; // company logo URL (optional, deprecated)
  order: number; // display order
  isActive: boolean; // whether to show on frontend
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTestimonialDTO {
  quote: string;
  name: string;
  title: string;
  img?: string;
  companyLogo?: string; // optional, deprecated
  order?: number;
  isActive?: boolean;
}

export interface UpdateTestimonialDTO {
  id: string;
  quote?: string;
  name?: string;
  title?: string;
  img?: string;
  companyLogo?: string;
  order?: number;
  isActive?: boolean;
}

export interface TestimonialValidationError {
  field: string;
  message: string;
}

export interface TestimonialOperationResult {
  success: boolean;
  data?: Testimonial | Testimonial[];
  error?: string;
  validationErrors?: TestimonialValidationError[];
}

// Validation constants
export const MAX_TESTIMONIALS = 20;
export const MIN_QUOTE_LENGTH = 20;
export const MAX_QUOTE_LENGTH = 500;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;
export const MIN_TITLE_LENGTH = 2;
export const MAX_TITLE_LENGTH = 100;

/**
 * Validate testimonial data
 */
export function validateTestimonial(
  data: Partial<CreateTestimonialDTO | UpdateTestimonialDTO>
): TestimonialValidationError[] {
  const errors: TestimonialValidationError[] = [];

  // Quote validation
  if (data.quote !== undefined) {
    if (!data.quote || !data.quote.trim()) {
      errors.push({ field: "quote", message: "Quote is required" });
    } else if (data.quote.trim().length < MIN_QUOTE_LENGTH) {
      errors.push({
        field: "quote",
        message: `Quote must be at least ${MIN_QUOTE_LENGTH} characters`,
      });
    } else if (data.quote.trim().length > MAX_QUOTE_LENGTH) {
      errors.push({
        field: "quote",
        message: `Quote must not exceed ${MAX_QUOTE_LENGTH} characters`,
      });
    }
  }

  // Name validation
  if (data.name !== undefined) {
    if (!data.name || !data.name.trim()) {
      errors.push({ field: "name", message: "Name is required" });
    } else if (data.name.trim().length < MIN_NAME_LENGTH) {
      errors.push({
        field: "name",
        message: `Name must be at least ${MIN_NAME_LENGTH} characters`,
      });
    } else if (data.name.trim().length > MAX_NAME_LENGTH) {
      errors.push({
        field: "name",
        message: `Name must not exceed ${MAX_NAME_LENGTH} characters`,
      });
    }
  }

  // Title validation
  if (data.title !== undefined) {
    if (!data.title || !data.title.trim()) {
      errors.push({ field: "title", message: "Title is required" });
    } else if (data.title.trim().length < MIN_TITLE_LENGTH) {
      errors.push({
        field: "title",
        message: `Title must be at least ${MIN_TITLE_LENGTH} characters`,
      });
    } else if (data.title.trim().length > MAX_TITLE_LENGTH) {
      errors.push({
        field: "title",
        message: `Title must not exceed ${MAX_TITLE_LENGTH} characters`,
      });
    }
  }

  // Company logo validation - REMOVED (deprecated field)
  // Logo is no longer required

  return errors;
}

/**
 * Converts Firestore document to Testimonial object
 */
export function firestoreToTestimonial(doc: any): Testimonial {
  const data = doc.data();
  return {
    id: doc.id,
    quote: data.quote || "",
    name: data.name || "",
    title: data.title || "",
    img: data.img || "",
    companyLogo: data.companyLogo || "",
    order: data.order || 0,
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  };
}

/**
 * Company logo library - popular tech companies
 */
export const companyLogos = [
  {
    name: "Cloudinary",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cloudinary/cloudinary-original.svg",
  },
  {
    name: "Appwrite",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/appwrite/appwrite-original.svg",
  },
  {
    name: "Hostinger",
    url: "/companies/hostinger.svg",
  },
  {
    name: "Stream",
    url: "/companies/stream.svg",
  },
  {
    name: "Docker",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg",
  },
  {
    name: "GitHub",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg",
  },
  {
    name: "Google",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/google/google-original.svg",
  },
  {
    name: "Microsoft",
    url: "/companies/microsoft.svg",
  },
  {
    name: "Amazon",
    url: "/companies/amazon.svg",
  },
  {
    name: "Meta",
    url: "/companies/meta.svg",
  },
  {
    name: "Netflix",
    url: "/companies/netflix.svg",
  },
  {
    name: "Stripe",
    url: "/companies/stripe.svg",
  },
  {
    name: "Shopify",
    url: "/companies/shopify.svg",
  },
  {
    name: "Vercel",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg",
  },
  {
    name: "MongoDB",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
  },
  {
    name: "PostgreSQL",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  },
  {
    name: "Redis",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
  },
  {
    name: "AWS",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
  },
  {
    name: "Azure",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/azure/azure-original.svg",
  },
  {
    name: "Firebase",
    url: "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-original.svg",
  },
];
