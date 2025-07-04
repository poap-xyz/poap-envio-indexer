
ARG ARCH=
FROM ${ARCH}mcr.microsoft.com/devcontainers/javascript-node:20-bookworm
WORKDIR /app/base-template

RUN npm install -g npm@latest

ENV PNPM_HOME /usr/local/binp
RUN npm install --global pnpm

COPY ./abis ./abis
COPY ./src ./src
COPY ./schema.graphql ./schema.graphql
COPY ./config.yaml ./config.yaml
COPY ./package.json ./package.json
# or rescript.json etc depending on preferred handler language
COPY ./tsconfig.json ./tsconfig.json
COPY ./envio-start.sh ./envio-start.sh

RUN pnpm install

RUN pnpm envio codegen

RUN chmod +x envio-start.sh 

CMD ./envio-start.sh
