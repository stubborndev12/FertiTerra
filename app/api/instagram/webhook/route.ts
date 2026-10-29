import type { NextRequest } from "next/server"

const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || "fertiterra_instagram_verify"
const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN

// Webhook verification (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams

  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")


  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("Forbidden", { status: 403 })
}

// Handle incoming messages (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Process Instagram webhook events
    if (body.object === "instagram") {
      for (const entry of body.entry) {
        if (entry.messaging) {
          for (const messagingEvent of entry.messaging) {
            await handleInstagramMessage(messagingEvent)
          }
        }
      }
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Instagram webhook error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}

async function handleInstagramMessage(messagingEvent: any) {
  const senderId = messagingEvent.sender.id
  const message = messagingEvent.message

  if (message && message.text) {
    const messageText = message.text.toLowerCase()

    // Generate response based on message content
    const responseText = await generateResponse(messageText)

    // Send response back to Instagram
    await sendInstagramMessage(senderId, responseText)
  }
}

async function generateResponse(messageText: string): Promise<string> {
  // Fertility-related responses
  if (messageText.includes("cycle") || messageText.includes("period")) {
    return "🌸 I can help you track your menstrual cycle! A typical cycle is 21-35 days. When did your last period start? This helps me calculate your fertile window."
  }

  if (messageText.includes("ovulation") || messageText.includes("fertile")) {
    return "🥚 Ovulation typically occurs 12-16 days before your next period. Signs include changes in cervical mucus, slight temperature rise, and sometimes mild cramping. Would you like tips on tracking these signs?"
  }

  if (messageText.includes("pregnant") || messageText.includes("pregnancy")) {
    return "🤱 If you're trying to conceive, timing is key! Your fertile window is usually 5 days before ovulation and the day of ovulation. Would you like me to help calculate your fertile days?"
  }

  if (messageText.includes("symptoms") || messageText.includes("pain")) {
    return "💭 I can help you track symptoms throughout your cycle. Common symptoms include cramping, mood changes, and breast tenderness. What symptoms are you experiencing?"
  }

  if (messageText.includes("test") || messageText.includes("kit")) {
    return "🧪 FertiTerra offers hormone testing kits that can help you understand your fertility better. Would you like to learn more about our testing options?"
  }

  if (messageText.includes("hello") || messageText.includes("hi") || messageText.includes("hey")) {
    return "Hi there! 👋 I'm your FertiTerra fertility assistant. I can help you with:\n\n🌸 Cycle tracking\n🥚 Ovulation prediction\n💭 Symptom monitoring\n🧪 Fertility testing\n\nWhat would you like to know about?"
  }

  // Default response
  return "Thanks for your message! 💜 I'm here to help with fertility and reproductive health questions. You can ask me about cycle tracking, ovulation, symptoms, or our testing kits. How can I assist you today?"
}

async function sendInstagramMessage(recipientId: string, messageText: string) {
  if (!ACCESS_TOKEN) {
    console.error("Instagram access token not configured")
    return
  }

  const url = `https://graph.instagram.com/v18.0/me/messages`

  const payload = {
    recipient: { id: recipientId },
    message: { text: messageText },
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
    } else {
      const error = await response.text()
      console.error("Failed to send Instagram message:", error)
    }
  } catch (error) {
    console.error("Error sending Instagram message:", error)
  }
}
