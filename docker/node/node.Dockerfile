ARG NODE_VERSION=22-alpine3.21
# ========================================
# Base Image
# ========================================
FROM node:${NODE_VERSION} AS base

WORKDIR /app

RUN chown node:node /app

# ========================================
# Build Dependencies Stage
# ========================================
FROM base AS build-deps

COPY --chown=node:node package*.json .npmrc ./

USER node

# Install all dependencies with build optimizations
RUN --mount=type=cache,target=/home/node/.npm,sharing=locked,uid=1000,gid=1000 \
	npm ci --no-audit --no-fund && \
	npm cache clean --force

# ========================================
# Development Stage
# ========================================
FROM build-deps AS development

ENV NODE_ENV=development \
	NPM_CONFIG_LOGLEVEL=warn


COPY --chown=node:node . .

COPY --chown=node:node ./docker/node/entrypoint.sh .

USER node

RUN chmod +x entrypoint.sh

# 3000 for Node App, 5555 for Prisma Studio
EXPOSE 3000 5555

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "start:dev"]

# ========================================
# Dependencies Stage
# ========================================
FROM base AS deps

COPY --chown=node:node package*.json .npmrc ./

USER node

# Install production dependencies
RUN --mount=type=cache,target=/home/node/.npm,sharing=locked,uid=1000,gid=1000 \
	npm ci --omit=dev && \
	npm cache clean --force

# ========================================
# Build Stage
# ========================================
FROM build-deps AS build

COPY --chown=node:node . .

RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM base AS production

WORKDIR /app

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
COPY --chown=node:node ./docker/node/entrypoint.sh .

USER node

RUN chmod +x entrypoint.sh

ENTRYPOINT [ "./entrypoint.sh" ]
CMD ["npm", "run", "test:e2e"]
