<p ><a href="#" target="_blank"><img src="https://raw.githubusercontent.com/whilemsart/trakli/master/logo.svg" width="400" alt="Trakli Logo"></a></p>

# Trakli UI

## Overview

Trakli is a personal income tracking application built using NuxtJs. The application allows users to manage and categorize their income and expenses under various groups.

## Features

- Register and log in to the application
- Manage user profile information
- Create, view, update, and delete groups (e.g., Home, Office, Personal)
- Manage income categories (e.g., Sales, Salary, Gift, Bonus, Interest)
- Manage expense categories (e.g., Utilities, Transport, Electricity, Rent, Tax, Health)
- Manage parties (e.g., individuals or entities from which money comes or goes)
- Manage wallets and bank accounts (e.g., cash, bank accounts)
- Record income and expense entries with details such as date, party, description, source/target wallet, and optional attachments

## Setup Instructions

### Prerequisites

- Docker
- Docker Compose
- Docker Desktop (for Windows and macOS users)

#### Setup

**Clone the repository** (if you haven't already):

```sh
git clone <repository-url>
cd <repository-directory>
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

### LICENSE

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
