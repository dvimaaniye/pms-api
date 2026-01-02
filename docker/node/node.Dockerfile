# ========================================
# Base Image
# ========================================
ARG NODE_VERSION=22-alpine3.21

FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN chown -R node:node /app

# ========================================
# Dependencies Stage
# ========================================
FROM base AS deps

COPY package*.json .npmrc ./

# Install production dependencies
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
	npm ci --omit=dev && \
	npm cache clean --force

RUN chown -R node:node /app

# ========================================
# Build Dependencies Stage
# ========================================
FROM base AS build-deps

USER node

COPY --chown=node:node package*.json .npmrc ./

# Install all dependencies with build optimizations
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
	npm ci --no-audit --no-fund && \
	npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM build-deps AS build

COPY --chown=node:node . .

RUN npm run build

# ========================================
# Development Stage
# ========================================
FROM build-deps AS development

ENV NODE_ENV=development \
	NPM_CONFIG_LOGLEVEL=warn

USER node

COPY --chown=node:node . .

COPY ./docker/node/entrypoint.sh .

EXPOSE 3000
# For Prisma Studio
EXPOSE 5555

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start:dev"]

# ========================================
# Production Stage
# ========================================
FROM node:${NODE_VERSION} AS production

WORKDIR /app

RUN chown -R node:node /app

ENV NODE_ENV=production \
	NODE_OPTIONS="--max-old-space-size=256 --no-warnings"

COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=deps --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/main.js"]

# ========================================
# Test Stage
# ========================================
FROM build-deps AS test

ENV NODE_ENV=test \
	CI=true

COPY --chown=node:node . .
COPY ./docker/node/entrypoint.sh .

USER node

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "test:e2e"]
