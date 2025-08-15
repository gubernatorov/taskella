# Multi-stage build для оптимизации размера образа
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy SQLite database files and migrations
COPY --from=builder --chown=nextjs:nodejs /app/src/lib/db/migrations ./src/lib/db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/drizzle.config.ts ./drizzle.config.ts

# Create directory for SQLite database
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Install production dependencies for runtime
RUN apk add --no-cache sqlite

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set environment variables for production
ENV DATABASE_URL="file:./data/sqlite.db"
ENV NODE_ENV=production

# Create a startup script
COPY --chown=nextjs:nodejs <<EOF /app/start.sh
#!/bin/sh
echo "🚀 Starting Taskella..."

# Initialize database
echo "🗄️ Initializing database..."
if [ ! -f "./data/sqlite.db" ]; then
    echo "📂 Database file not found, initializing..."
    # Wait for app to start and then initialize DB
    timeout 30 sh -c 'while ! nc -z localhost 3000; do sleep 1; done' && \
    curl -X POST http://localhost:3000/api/init-db \
         -H "x-init-secret: \${INIT_DB_SECRET:-dev-init-secret}" \
         --max-time 30 \
         --retry 3 \
         --retry-delay 2 || echo "⚠️ Failed to initialize database via API, will try at runtime"
fi

echo "🌟 Starting application..."
exec node server.js
EOF

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]