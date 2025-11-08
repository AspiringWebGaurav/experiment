/**
 * API route for replying to contact form submissions
 * Integrates with EmailJS to send admin replies
 */

import { NextRequest, NextResponse } from "next/server";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ReplyToSubmissionDTO } from "@/types/contactSubmission";

const COLLECTION_NAME = "contactSubmissions";

/**
 * POST - Reply to a contact submission
 */
export async function POST(request: NextRequest) {
  try {
    const body: ReplyToSubmissionDTO = await request.json();

    // Validate input
    if (!body.id || !body.replyMessage || !body.adminEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: id, replyMessage, adminEmail",
        },
        { status: 400 }
      );
    }

    // Check if submission exists
    const submissionRef = doc(db, COLLECTION_NAME, body.id);
    const submissionSnapshot = await getDoc(submissionRef);

    if (!submissionSnapshot.exists()) {
      return NextResponse.json(
        {
          success: false,
          error: "Submission not found",
        },
        { status: 404 }
      );
    }

    const submission = submissionSnapshot.data();

    // Update submission with reply information
    const now = Timestamp.now();
    await updateDoc(submissionRef, {
      status: "replied",
      isReplied: true,
      repliedAt: now,
      repliedBy: body.adminEmail,
      replyMessage: body.replyMessage.trim(),
      updatedAt: now,
    });

    // Fetch updated document
    const updatedDoc = await getDoc(submissionRef);
    const updatedData = updatedDoc.data();

    const result = {
      id: updatedDoc.id,
      ...updatedData,
      createdAt: updatedData?.createdAt.toDate().toISOString(),
      updatedAt: updatedData?.updatedAt.toDate().toISOString(),
      repliedAt: updatedData?.repliedAt.toDate().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        submission: result,
        message: "Reply sent successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending reply:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send reply",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
