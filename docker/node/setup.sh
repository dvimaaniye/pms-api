#!/bin/sh

npm install
npm run prisma:dev --name init || echo "You have probably already migrated."
