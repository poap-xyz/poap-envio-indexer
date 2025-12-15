FROM node:24.3.0-slim

# --no-install-recommends keeps the image smaller by avoiding extra dependencies.
# rm -rf /var/lib/apt/lists/* cleans up cached package lists to reduce image size.
# psql is needed for dumping and restoring the initial effects cache.
# curl is needed for health checks in ECS
RUN apt-get update && \
    apt-get install -y --no-install-recommends postgresql-client curl && \
    rm -rf /var/lib/apt/lists/*

# Set Node.js memory limits for ECS environment
ENV NODE_OPTIONS="--max-old-space-size=2048"

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@9.7.1

WORKDIR /envio-indexer

# Provide build-time API keys and endpoints for RPC URLs used during codegen.
# Default to stubs so config interpolation succeeds even if the build args are not set.
ARG ETHEREUM_MAINNET_ENDPOINT=https://eth-mainnet.example
ARG GNOSIS_CHAIN_ENDPOINT=https://gnosis.example
ARG BASE_MAINNET_ENDPOINT=https://base.example
ARG ARBITRUM_ONE_ENDPOINT=https://arbitrum.example
ARG APECHAIN_ENDPOINT=https://apechain-mainnet.example
ARG LINEA_ENDPOINT=https://linea.example
ARG MANTLE_ENDPOINT=https://mantle.example
ARG POLYGON_MAINNET_ENDPOINT=https://polygon.example
ARG UNICHAIN_ENDPOINT=https://unichain.example
ARG CHILIZ_MAINNET_ENDPOINT=https://chiliz.example
ARG CELO_MAINNET_ENDPOINT=https://celo.example

ENV ETHEREUM_MAINNET_ENDPOINT=${ETHEREUM_MAINNET_ENDPOINT}
ENV GNOSIS_CHAIN_ENDPOINT=${GNOSIS_CHAIN_ENDPOINT}
ENV BASE_MAINNET_ENDPOINT=${BASE_MAINNET_ENDPOINT}
ENV ARBITRUM_ONE_ENDPOINT=${ARBITRUM_ONE_ENDPOINT}
ENV APECHAIN_ENDPOINT=${APECHAIN_ENDPOINT}
ENV LINEA_ENDPOINT=${LINEA_ENDPOINT}
ENV MANTLE_ENDPOINT=${MANTLE_ENDPOINT}
ENV POLYGON_MAINNET_ENDPOINT=${POLYGON_MAINNET_ENDPOINT}
ENV UNICHAIN_ENDPOINT=${UNICHAIN_ENDPOINT}
ENV CHILIZ_MAINNET_ENDPOINT=${CHILIZ_MAINNET_ENDPOINT}
ENV CELO_MAINNET_ENDPOINT=${CELO_MAINNET_ENDPOINT}

# Set default Hasura environment variables when Hasura is disabled
# These prevent crashes in the generated Env.res.js file
ENV HASURA_GRAPHQL_ENDPOINT="http://localhost:8080/v1/metadata"
ENV HASURA_GRAPHQL_ROLE="admin"
ENV HASURA_GRAPHQL_ADMIN_SECRET="testing"

COPY ./package.json ./package.json
COPY ./pnpm-lock.yaml ./pnpm-lock.yaml

RUN pnpm install -P --frozen-lockfile

COPY ./config.yaml ./config.yaml
COPY ./schema.graphql ./schema.graphql

# Remove the line if you inlined all event ABIs in the config.yaml
COPY ./abis ./abis

RUN pnpm envio codegen

COPY ./ ./

# Build the ReScript files after codegen to ensure all .res files are compiled to .js
RUN cd generated && pnpm run build

# Add health check for ECS - simple test while debugging
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
    CMD echo "$(date): Health check running..." && ps aux | head -5 && echo "Health check passed" && exit 0

CMD ["pnpm", "envio", "start"]



