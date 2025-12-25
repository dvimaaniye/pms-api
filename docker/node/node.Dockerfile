FROM node:22-alpine3.21 AS node

USER node

WORKDIR /home/app

EXPOSE 3000
# For Prisma studio
EXPOSE 5555
