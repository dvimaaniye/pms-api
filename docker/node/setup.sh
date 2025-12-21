#!/bin/sh

npm install
npm run prisma:deploy || echo "You have probably already migrated."
