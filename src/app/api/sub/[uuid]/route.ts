import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";

/**
 * Subscription endpoint - Returns all user VPN configurations
 * Compatible with V2Ray clients like v2rayN, V2rayNG, etc.
 * GET /api/sub/{uuid} - Returns base64 encoded config URLs
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  try {
    const { uuid } = await params;

    if (!uuid) {
      return new NextResponse("UUID is required", { status: 400 });
    }

    // Find subscription by UUID
    const subscription = await db.subscription.findFirst({
      where: {
        uuid: uuid,
        status: "ACTIVE",
      },
      include: {
        plan: true,
      },
    });

    if (!subscription) {
      return new NextResponse("Subscription not found or inactive", { 
        status: 404 
      });
    }
    
    // Check if subscription is expired
    if (new Date() > subscription.endDate) {
      return new NextResponse("Subscription expired", { status: 403 });
    }

    // Generate fresh VPN configurations instead of using potentially corrupted stored ones
    let configUrls: string[] = [];
    
    try {
      // Import the config generation function
      const { generateSubscriptionConfigs } = await import("~/lib/subscription-utils");
      const freshConfigs = await generateSubscriptionConfigs(subscription.id);
      configUrls = freshConfigs.configUrls.map(config => {
        // Ensure URLs are not double-encoded by decoding and re-encoding once
        const url = config.url;
        const hashIndex = url.indexOf('#');
        if (hashIndex !== -1) {
          const baseUrl = url.substring(0, hashIndex + 1);
          const remark = url.substring(hashIndex + 1);
          try {
            // Decode the remark and re-encode it once to prevent double encoding
            const decodedRemark = decodeURIComponent(remark);
            const cleanUrl = baseUrl + encodeURIComponent(decodedRemark);
            return cleanUrl;
          } catch {
            // If decoding fails, return original URL
            return url;
          }
        }
        return url;
      });
      
      console.log(`Generated ${configUrls.length} fresh config URLs for subscription ${subscription.id}`);
    } catch (configError) {
      console.error("Error generating fresh configs:", configError);
      
      // Fallback to stored configs if fresh generation fails
      if (subscription.configUrls) {
        try {
          const storedConfigs = JSON.parse(subscription.configUrls) as Array<{protocol: string; url: string; name: string}>;
          configUrls = storedConfigs.map(config => config.url);
          console.log(`Falling back to stored configs: ${configUrls.length} URLs`);
        } catch (parseError) {
          console.error("Error parsing stored configs:", parseError);
        }
      }
    }

    if (configUrls.length === 0) {
      return new NextResponse("No configurations available. Please refresh your configs in the dashboard.", { 
        status: 404 
      });
    }

    // Join all configs with newlines and encode in base64 (standard format for V2Ray clients)
    const configsText = configUrls.join('\n');
    const base64Configs = Buffer.from(configsText, 'utf-8').toString('base64');

    // Set appropriate headers for V2Ray clients
    const headers = new Headers();
    headers.set('Content-Type', 'text/plain; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    
    // Add subscription info headers (some clients use these)
    const usedBytes = Number(subscription.trafficUsed) || 0;
    const limitBytes = Number(subscription.trafficLimit) || 0;
    const expireTimestamp = Math.floor(subscription.endDate.getTime() / 1000);
    
    headers.set('Profile-Update-Interval', '12'); // Update interval in hours
    headers.set('Subscription-Userinfo', `upload=${usedBytes}; download=${usedBytes}; total=${limitBytes}; expire=${expireTimestamp}`);
    headers.set('Content-Disposition', `attachment; filename="safesurf-${uuid.slice(0, 8)}.txt"`);

    return new NextResponse(base64Configs, {
      status: 200,
      headers,
    });

  } catch (error) {
    console.error("Subscription endpoint error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}