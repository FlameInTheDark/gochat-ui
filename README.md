# GoChat UI

A SvelteKit frontend application for the GoChat service.

## Features

*   Connects to GoChat backend via REST API and WebSockets.
*   Displays guilds and channels.
*   Real-time message viewing.
*   Send messages with text content.
*   Upload and display image attachments.
*   Display non-image attachments as links.

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd gochat-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or pnpm install or yarn
    ```

3.  **Configure Environment:**
    Create a `.env` file in the root directory by copying the example:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file and set the correct URLs for your GoChat backend API and WebSocket service:
    ```env
    PUBLIC_API_BASE_URL=http://your-backend-host/api/v1
    PUBLIC_WEBSOCKET_URL=ws://your-backend-host/ws/subscribe
    ```
    (Default values point to `http://localhost:80/...`)

## Development

Start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

The application will be accessible at `http://localhost:5173` (or another port if 5173 is busy).

## Building

To create a production version of the app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Technology Stack

*   [SvelteKit](https://kit.svelte.dev/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [json-bigint](https://github.com/sidorares/json-bigint) (for handling large Snowflake IDs)
