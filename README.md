<p align="center"><a href="#" target="_blank"><img src="./public/logo.svg" width="200" alt="Trakli Logo"></a></p>

<p align="center"><img src="./.github/assets/trakli-dashboard-showcase.png" alt="Trakli dashboard and mobile preview" width="820"></p>

# Trakli UI

[![CI](https://github.com/trakli/webui/actions/workflows/checks.yml/badge.svg?branch=main)](https://github.com/trakli/webui/actions/workflows/checks.yml)

Money apps want your bank login, and then they want your money to be in one country, in one currency, in
an account they can read. Get paid from abroad, keep cash, hold two currencies at once, or move money over
mobile money, and most of your money is invisible to them. So it ends up in a spreadsheet, which holds
anything and tells you nothing.

Trakli tracks money the way it actually moves. Cash, mobile money, bank and card sit beside each other as
wallets, in any of forty-eight currencies, converting at the rate you say applies and not one scraped from a
market you cannot get. Your phone keeps working with no signal and settles up when it reconnects. And it
is yours: your server, your database, no one else holding the ledger of what you earn.

This is the web app. It talks to the [webservice](https://github.com/trakli/webservice), which you will
need running first.

## Features

What you will not find elsewhere:

- **Wallets that match reality:** cash, mobile money, bank and card, side by side.
- **Any currency, at your rate:** forty-eight of them, held at once; transfers convert at the rate you set.
- **An assistant that can act:** ask it in plain words, and it proposes every change for you to confirm
  before anything is written.
- **Offline-first:** the phone works with no signal, and changes settle cleanly when it reconnects.
- **Yours to run:** your server, your database, no bank login handed to anyone.

The rest, done properly:

- **Transactions:** Income and expenses across multiple wallets, with attachments and recurring rules.
- **Transfers:** Move money between wallets, including cross-currency at user-set rates.
- **Budgets:** Scoped to categories, groups, or wallets; weekly / monthly / yearly / custom range; optional rollover; threshold and forecast alerts.
- **Refunds:** Mark an income as refunding an earlier expense; matching budgets adjust automatically.
- **Reminders:** Bills, budget alerts, and custom events with pause, resume, and snooze.
- **Imports:** Pull transactions from CSVs, PDFs, and photos of receipts.
- **Insights:** Dashboard stats and digest emails.

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
