const SLACK_API_URL = "https://slack.com/api/chat.postMessage";

export type SlackMessagePayload = {
  text: string;
  channel?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks?: any[];
  thread_ts?: string;
  unfurl_links?: boolean;
  unfurl_media?: boolean;
};

export type SlackPostResult = {
  ok: boolean;
  channel?: string;
  ts?: string;
  error?: string;
  method?: "bot" | "webhook";
};

export type SlackMultiChannelPayload = SlackMessagePayload & {
  channels?: string[];
};

export function isSlackConfigured(): boolean {
  return Boolean(
    process.env.SLACK_WEBHOOK_URL ||
      (process.env.SLACK_BOT_TOKEN && process.env.SLACK_DEVCLUB_CHANNEL_ID),
  );
}

async function sendViaWebhook(payload: SlackMessagePayload): Promise<SlackPostResult> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) throw new Error("SLACK_WEBHOOK_URL is not configured");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const body: Record<string, any> = {
    text: payload.text,
    blocks: payload.blocks,
  };

  
  if (payload.channel) {
    body.channel = payload.channel;
  }

  const response = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to send Slack webhook");
  }

  return { ok: true, method: "webhook" };
}

async function sendViaBotToken(payload: SlackMessagePayload): Promise<SlackPostResult> {
  const token = process.env.SLACK_BOT_TOKEN;
  const defaultChannel = process.env.SLACK_DEVCLUB_CHANNEL_ID;

  if (!token) {
    throw new Error("SLACK_BOT_TOKEN is not configured");
  }

  const channel = payload.channel || defaultChannel;
  if (!channel) {
    throw new Error("No Slack channel provided and SLACK_DEVCLUB_CHANNEL_ID is missing");
  }

  const body = {
    channel,
    text: payload.text,
    blocks: payload.blocks,
    thread_ts: payload.thread_ts,
    unfurl_links: payload.unfurl_links ?? true,
    unfurl_media: payload.unfurl_media ?? false,
  };

  const response = await fetch(SLACK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as SlackPostResult;
  if (!data.ok) {
    throw new Error(data.error || "Failed to send Slack message");
  }

  return { ...data, method: "bot" };
}

async function deliverSlackMessage(payload: SlackMessagePayload): Promise<SlackPostResult> {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (webhook) {
    try {
      return await sendViaWebhook(payload);
    } catch (err) {
      
      if (process.env.SLACK_BOT_TOKEN && process.env.SLACK_DEVCLUB_CHANNEL_ID) {
        return await sendViaBotToken(payload);
      }
      throw err;
    }
  }

  return sendViaBotToken(payload);
}

export async function postSlackMessage(payload: SlackMessagePayload): Promise<SlackPostResult> {
  return deliverSlackMessage(payload);
}

export async function postSlackMessages(
  payload: SlackMultiChannelPayload,
): Promise<SlackPostResult[]> {
  const { channels, channel, ...rest } = payload;

  const normalizedTargets = [
    ...(channel ? [channel] : []),
    ...(Array.isArray(channels) ? channels : []),
  ]
    .map((ch) => ch.trim())
    .filter(Boolean);

  const targets = Array.from(new Set(normalizedTargets));

  if (targets.length === 0) {
    return [await deliverSlackMessage(rest as SlackMessagePayload)];
  }

  const results: SlackPostResult[] = [];

  for (const target of targets) {
    results.push(await deliverSlackMessage({ ...(rest as SlackMessagePayload), channel: target }));
  }

  return results;
}
