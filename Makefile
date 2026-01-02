.PHONY: setup up down shell run-test test-down

setup:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Copied .env.example to .env"; fi
	@docker compose build
	@echo "Setup done."

up:
	@docker compose up node --watch --no-log-prefix

down:
	@docker compose down

s ?= node
shell:
	@docker compose exec $(s) sh

test_compose_file = compose.test.yml
run-test:
	@if [ ! -f .env ]; then cp .env.example .env; echo "Copied .env.example to .env"; fi
	@docker compose -f $(test_compose_file) up node --no-log-prefix --exit-code-from node; \
	EXIT_CODE=$$?; \
	docker compose -f $(test_compose_file) down; \
	exit $$EXIT_CODE

test-down:
	@docker compose -f $(test_compose_file) down
