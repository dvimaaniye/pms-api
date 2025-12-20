.PHONY: setup up down shell

setup:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Copied .env.example to .env"; fi
	@docker compose --build
	@echo "Services built. Running initial setup..."
	@docker compose exec -T node /bin/sh /home/app/docker/node/setup.sh
	@echo "Setup done."

up:
	@docker compose up -d
	@docker compose exec node /bin/sh -c "npm run start:dev"

down:
	@docker compose down

shell:
	@docker compose exec node sh
