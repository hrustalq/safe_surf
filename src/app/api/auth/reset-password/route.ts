import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "~/server/db";
import { sendPasswordResetEmail } from "~/lib/email";

const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as z.infer<typeof resetPasswordSchema>;
    
    const result = resetPasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (user) {
      // Delete any existing reset tokens for this user
      await db.passwordResetToken.deleteMany({
        where: { userId: user.id },
      });

      // Create new reset token
      const resetToken = await db.passwordResetToken.create({
        data: {
          userId: user.id,
          expires: new Date(Date.now() + 3600000), // 1 hour from now
        },
      });

      // Generate reset URL
      const baseUrl = process.env.NODE_ENV === "production" 
        ? "https://safesurf.tech" 
        : "http://localhost:3000";
      const resetUrl = `${baseUrl}/auth/reset-password/${resetToken.token}`;

      // Send email
      await sendPasswordResetEmail({
        email: user.email!,
        resetUrl,
        userName: user.name ?? undefined,
      });
    }

    return NextResponse.json({
      message: "If an account exists with this email, you will receive password reset instructions",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при обработке запроса" },
      { status: 500 }
    );
  }
}