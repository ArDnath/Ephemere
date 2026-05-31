# WebSocket Socket Server

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

| Variable      | Description                                      |
|---------------|--------------------------------------------------|
| `PORT`        | Port to run the WebSocket server on (default 8080) |
| `DATABASE_URL`| Neon PostgreSQL connection string               |
| `JWT_SECRET`  | Must match the secret used in `apps/api`        |

## Running Locally

```bash
pnpm dev
```

## Message Protocol

### Client → Server

| Type              | Payload                                      |
|-------------------|----------------------------------------------|
| `join`            | `{ roomId, token?, tempId?, tempName?, tempAvatar? }` |
| `send_message`    | `{ content, image? }`                        |
| `react`           | `{ messageId, emoji }`                       |
| `remove_reaction` | `{ messageId, emoji }`                       |
| `leave`           | `{}`                                         |

### Server → Client

| Type               | Description                          |
|--------------------|--------------------------------------|
| `room_joined`      | Sent to joining user with full room state |
| `user_joined`      | Broadcast to room when a user joins  |
| `user_left`        | Broadcast to room when a user leaves |
| `new_message`      | Broadcast when a message is sent     |
| `reaction_updated` | Broadcast when a reaction changes    |
| `self_leave`       | Sent back to the leaving user        |
| `error`            | Sent on invalid operations           |
