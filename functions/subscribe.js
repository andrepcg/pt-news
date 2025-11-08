
const SEGMENTS = {
  daily: "9e00cfcc-cdce-42db-af81-02e815093ada",
  weekly: "73154a15-5665-42b9-89a8-1f2afcc9e186",
}

function jsonResponse(data, status = 200) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: { "Content-Type": "application/json" }
    }
  );
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateInput(email, frequency) {
  if (!email || !frequency) {
    return { valid: false, error: "Email and frequency are required" };
  }

  if (!validateEmail(email)) {
    return { valid: false, error: "Invalid email address" };
  }

  const segmentId = SEGMENTS[frequency];
  if (!segmentId) {
    return { valid: false, error: "Invalid frequency. Must be 'daily' or 'weekly'" };
  }

  return { valid: true, segmentId };
}

async function createContact(email, apiKey) {
  const response = await fetch("https://api.resend.com/contacts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: email,
      unsubscribed: false
    })
  });

  // 422 means contact already exists, which is fine
  if (!response.ok && response.status !== 422) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create contact");
  }

  return response;
}

async function addContactToSegment(email, segmentId, apiKey) {
  const response = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}/segments/${segmentId}`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add contact to segment");
  }

  return response;
}

export async function onRequest(context) {
  // Only allow POST requests
  if (context.request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = context.env.RESEND_API_KEY;

  try {
    // Parse request body
    const body = await context.request.json();
    const { email, frequency } = body;

    // Validate input
    const validation = validateInput(email, frequency);
    if (!validation.valid) {
      return jsonResponse({ error: validation.error }, 400);
    }

    // Try to create the contact (handles existing contacts gracefully)
    await createContact(email, apiKey);

    // Add contact to segment
    await addContactToSegment(email, validation.segmentId, apiKey);

    // Success!
    return jsonResponse({
      success: true,
      message: `Successfully subscribed ${email} to ${frequency} newsletter`
    });

  } catch (error) {
    return jsonResponse({ error: error.message || "Invalid request body" }, 400);
  }
}