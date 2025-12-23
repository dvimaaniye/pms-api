# Project Management System API

## Prerequisites
- docker
- make (optional, but the following steps expect you to have make)

## Development Environment
**Step 1.** The following command performs 3 tasks:
1. copy `.env.example` as `.env` (if not found) (keep it unchanged for the dev env)
2. builds docker containers (see `docker-compose.yml`)
3. runs the node setup script (see `./docker/node/setup.sh`)
```sh
make setup
```

**Step 2.** Start the docker containers and the Nest server ([http://localhost:3000](http://localhost:3000)):
```sh
make up
```

### Additional commands
- `make down`: Stop and remove the containers
- `make shell`: Puts you inside the node container to run commands
- `make shell s=servicename`: Replace `servicename` with the name of the docker service where you to want to open the shell, e.g., `make shell s=mysql`

### MySQL and Redis Data
For persistence, the MySQL and Redis data is mounted in the container from `./docker/mysql/data` and `./docker/redis/data` respectively. See `docker-compose.yml` for more details.
