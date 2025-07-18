<p ><a href="#" target="_blank"><img src="https://raw.githubusercontent.com/whilesmart/trakli/main/logo.svg" width="400" alt="Trakli Logo"></a></p>

## Trakli UI

Web UI for [Trakli](https://github.com/whilesmart/trakli)

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

### MIT LICENSE

See [LICENSE](LICENSE.md) for more information.
