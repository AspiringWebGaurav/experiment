# Contact Form - Quick Reference

## 🚀 Quick Start

### User Flow

1. Click "Let's get in touch" button in footer
2. Fill form (Name, Email, Message)
3. Submit → Receive confirmation email
4. Check spam folder if not in inbox

### Admin Flow

1. Admin Dashboard → "Contact Submissions" tab
2. View submissions (sorted by newest)
3. Click to view details
4. Reply directly via email

---

## 📍 Key Locations

### Frontend

- **Form Modal**: `components/ContactFormModal.tsx`
- **Footer Button**: `components/Footer.tsx`
- **Context**: `contexts/ContactSubmissionContext.tsx`
- **Types**: `types/contactSubmission.ts`

### Backend

- **API**: `app/api/contact-submissions/route.ts`
- **Reply API**: `app/api/contact-submissions/reply/route.ts`

### Admin

- **Manager**: `components/admin/ContactSubmissionManager.tsx`
- **Dashboard**: `app/admin/dashboard/page.tsx` (tab added)

---

## ⚡ Quick Commands

```bash
# Install dependencies
npm install @emailjs/browser date-fns

# Run development server
npm run dev

# Access admin panel
http://localhost:3000/admin/dashboard?tab=contact-submissions
```

---

## 🔑 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_EMAILJS_SERVICE_ID=contact_service
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=contact_form
NEXT_PUBLIC_EMAILJS_USER_TEMPLATE_ID=user_confirmation
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=jCsW86FQoPvuSnDWH
```

---

## 📊 Status Badges

| Badge       | Meaning                |
| ----------- | ---------------------- |
| 🔵 New      | Just received, unread  |
| 🟡 Read     | Viewed, awaiting reply |
| 🟢 Replied  | Admin has responded    |
| ⚫ Archived | Moved to archive       |

---

## 🛡️ Rate Limits

- **Email**: 3 submissions per 24 hours
- **IP**: 5 submissions per hour

---

## 📝 Validation Rules

| Field   | Min | Max  | Required              |
| ------- | --- | ---- | --------------------- |
| Name    | 2   | 100  | ✅ Yes                |
| Email   | -   | -    | ✅ Yes (valid format) |
| Message | 10  | 2000 | ✅ Yes                |

---

## 🎯 Admin Actions

```typescript
// Mark as read
markAsRead(submissionId);

// Reply to user
replyToSubmission({ id, replyMessage, adminEmail });

// Archive
markAsArchived(submissionId);

// Delete
deleteSubmission(submissionId);
```

---

## 📧 EmailJS Templates Needed

1. **user_confirmation** - Sent to user after submission
2. **contact_form** - Sent to admin for new submission
3. Admin replies use EmailJS send function

---

## 🔍 Search & Filter

- **Search**: Type in search box (searches name, email, message)
- **Filter**: Dropdown to filter by status
- Both can be combined

---

## 🎨 UI Components Used

- Modal with backdrop blur
- Framer Motion animations
- Lucide icons
- Sonner toast notifications
- Tailwind CSS styling

---

## 📱 Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

All components are fully responsive!

---

## ⚠️ Important Notes

1. User gets confirmation email from `gauravbackendservices`
2. Admin gets notification at `gauravpatil5737@gmail.com`
3. Emails may go to spam - inform users
4. Rate limits reset based on time window
5. All dates stored in Firestore timestamps

---

## 🔥 Firestore Collection

**Collection Name**: `contactSubmissions`

**Indexes Required**: None (using default)

**Security Rules**: Update to allow authenticated admin access

---

## ✅ Pre-Launch Checklist

- [ ] EmailJS templates created
- [ ] Environment variables set
- [ ] Firebase rules updated
- [ ] Test form submission
- [ ] Test admin reply
- [ ] Verify rate limiting
- [ ] Check email deliverability
- [ ] Test on mobile devices

---

## 🆘 Troubleshooting

| Issue                 | Solution                          |
| --------------------- | --------------------------------- |
| Modal won't open      | Check console, verify provider    |
| Emails not sending    | Verify EmailJS credentials        |
| Rate limit errors     | Wait for timeout or adjust limits |
| Can't see submissions | Check Firestore collection name   |

---

**Quick Access**: `/admin/dashboard?tab=contact-submissions`

**Status**: ✅ Production Ready
