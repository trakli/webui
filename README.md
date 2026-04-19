<p align="center"><a href="#" target="_blank"><img src="./public/logo.svg" width="200" alt="Trakli Logo"></a></p>

<p align="center"><img src="./.github/assets/trakli-dashboard-showcase.png" alt="Trakli dashboard and mobile preview" width="820"></p>

# Trakli UI

[![CI](https://github.com/trakli/webui/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/trakli/webui/actions/workflows/checks.yml)

Web UI for [Trakli](https://github.com/trakli/trakli).

## Features

- **Transactions:** Income and expenses across multiple wallets, with attachments and recurring rules.
- **Transfers:** Move money between wallets, including cross-currency at user-set rates.
- **Budgets:** Scoped to categories, groups, or wallets; weekly / monthly / yearly / custom range; optional rollover; threshold and forecast alerts.
- **Refunds:** Mark an income as refunding an earlier expense; matching budgets adjust automatically.
- **Reminders:** Bills, budget alerts, and custom events with pause, resume, and snooze.
- **Imports:** Pull transactions from CSVs, PDFs, and photos of receipts.
- **Insights & AI:** Dashboard stats, digest emails, and a chat assistant for your finances.
- **Offline-first:** Changes made on mobile sync cleanly when the device reconnects.

## Setup Instructions

### Prerequisites

- Docker
- Docker Compose
- Docker Desktop (for Windows and macOS users)

#### Setup

**Clone the repository**:

```sh
git clone git@github.com:trakli/webui.git
cd webui
```

#### Running the Project

- **Start the Docker Compose services**:

  ```sh
  docker-compose up -d
  ```

  This command starts the container in detached mode.

- **Install project dependencies**:

  ```sh
  docker compose exec app sh -c "npm install"
  ```

  This command installs the necessary Node.js dependencies inside the container.

- **Run the application**:

  ```sh
  docker compose exec app sh -c "npm run dev"
  ```

  This command runs the application inside the container.

## Accessing the Container Shell

To interact with the container directly, you can attach a shell to the running container:

```sh
docker compose exec app bash
```

This command opens an interactive shell session in the container, allowing you to run commands as if you were in a typical Node.js environment.

## Stopping the Services

To stop the Docker Compose services, run:

```sh
docker compose stop
```

This command stops and removes the containers defined in your `docker-compose.yml` file.

## Cleaning Up

If you want to remove all containers, networks, and volumes created by Docker Compose, run:

```sh
docker compose down --volumes
```

This command stops and removes the containers as well as any associated volumes.

### Bare metal

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run lint`

### MIT LICENSE

See [LICENSE](LICENSE.md) for more information.
