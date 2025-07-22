import { NextResponse } from "next/server";
import { hashSync } from "bcrypt-ts";
import { z } from "zod";
import { db } from "~/server/db";

const confirmResetSchema = z.object({
  token: z.string(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as z.infer<typeof confirmResetSchema>;
    
    const result = confirmResetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { token, password } = result.data;

    // Find the reset token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Недействительная или просроченная ссылка для восстановления" },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (resetToken.expires < new Date()) {
      // Delete expired token
      await db.passwordResetToken.delete({
        where: { id: resetToken.id },
      });
      
      return NextResponse.json(
        { error: "Ссылка для восстановления пароля истекла" },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = hashSync(password, 10);

    // Update user's password
    await db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete the used reset token
    await db.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    // Delete all other reset tokens for this user
    await db.passwordResetToken.deleteMany({
      where: { userId: resetToken.userId },
    });

    return NextResponse.json({
      message: "Пароль успешно изменён",
    });
  } catch (error) {
    console.error("Confirm password reset error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при изменении пароля" },
      { status: 500 }
    );
  }
}