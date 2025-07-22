import { NextResponse } from "next/server";
import { hashSync } from "bcrypt-ts";
import { z } from "zod";
import { db } from "~/server/db";
import { createTrialSubscription } from "~/lib/subscription-utils";

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json() as z.infer<typeof signupSchema>;
    
    const result = signupSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = hashSync(password, 10);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // Create trial subscription
    let trialSubscription = null;
    try {
      const trialResult = await createTrialSubscription(user.id);
      trialSubscription = trialResult;
    } catch (trialError) {
      console.error("Failed to create trial subscription:", trialError);
      // Don't fail signup if trial creation fails, but log it
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      hasTrialSubscription: !!trialSubscription,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Произошла ошибка при регистрации" },
      { status: 500 }
    );
  }
}