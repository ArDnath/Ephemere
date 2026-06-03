# Cloudflare Socket Worker

`@ephemere/socket` runs the chat WebSocket transport as a Cloudflare Worker backed by Durable Objects. Each room is routed to one `ChatRoom` Durable Object using `?roomId=<roomId>`, so room participants, temporary messages, and broadcasts stay isolated per room.

## Environment Variables

Set these as Cloudflare Worker secrets:

| Variable       | Description                               |
| -------------- | ----------------------------------------- |
| `DATABASE_URL` | Neon PostgreSQL connection string         |
| `JWT_SECRET`   | Must match the secret used in `apps/api`  |

## Local Development

```bash
pnpm --filter @ephemere/socket dev
```

The local Worker runs on Wrangler's default port, usually `http://localhost:8787`.
Use `ws://localhost:8787/?roomId=<roomId>` from the web app.

## Deployment

```bash
pnpm --filter @ephemere/socket exec wrangler secret put DATABASE_URL
pnpm --filter @ephemere/socket exec wrangler secret put JWT_SECRET
pnpm --filter @ephemere/socket deploy
```

## Message Protocol

### Client -> Server

| Type              | Payload                                      |
| ----------------- | -------------------------------------------- |
| `join`            | `{ roomId, token?, tempId?, tempName?, tempAvatar? }` |
| `send_message`    | `{ content, image? }`                        |
| `react`           | `{ messageId, emoji }`                       |
| `remove_reaction` | `{ messageId, emoji }`                       |
| `leave`           | `{}`                                         |

### Server -> Client

| Type               | Description                                  |
| ------------------ | -------------------------------------------- |
| `room_joined`      | Sent to joining user with full room state    |
| `user_joined`      | Broadcast to room when a user joins          |
| `user_left`        | Broadcast to room when a user leaves         |
| `new_message`      | Broadcast when a message is sent             |
| `reaction_updated` | Broadcast when a reaction changes            |
| `self_leave`       | Sent back to the leaving user                |
| `error`            | Sent on invalid operations                   |
