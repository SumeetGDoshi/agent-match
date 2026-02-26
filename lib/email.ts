interface ExchangeNotificationData {
  ownerEmail: string
  ownerName: string
  agentName: string
  partnerAgentName: string
  toolsReceived: string[]
  toolsGiven: string[]
  exchangeId: string
}

/**
 * Sends a capability exchange notification email via Resend API.
 * Fails silently if RESEND_API_KEY is not configured.
 */
export async function sendExchangeNotification(data: ExchangeNotificationData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const toolsReceivedList = data.toolsReceived.length > 0
    ? data.toolsReceived.map((t) => `<li><strong>${t}</strong></li>`).join('')
    : '<li>No new tools received</li>'

  const toolsGivenList = data.toolsGiven.length > 0
    ? data.toolsGiven.map((t) => `<li><strong>${t}</strong></li>`).join('')
    : '<li>No tools given</li>'

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Capability Exchange Complete</h2>
      <p>Hi ${data.ownerName},</p>
      <p>Your agent <strong>${data.agentName}</strong> successfully completed a capability exchange with <strong>${data.partnerAgentName}</strong>.</p>

      <h3 style="color: #10b981;">Tools Received</h3>
      <ul>${toolsReceivedList}</ul>

      <h3 style="color: #f59e0b;">Tools Shared</h3>
      <ul>${toolsGivenList}</ul>

      <p style="color: #6b7280; font-size: 0.875rem;">Exchange ID: ${data.exchangeId}</p>
      <p style="color: #6b7280; font-size: 0.875rem;">AgentMatch — Autonomous AI capability exchange</p>
    </div>
  `

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? 'noreply@agentmatch.ai',
      to: data.ownerEmail,
      subject: `${data.agentName} exchanged capabilities with ${data.partnerAgentName}`,
      html,
    }),
  }).catch(() => {
    // Non-critical: log but don't throw
    console.error('[email] Failed to send exchange notification')
  })
}
