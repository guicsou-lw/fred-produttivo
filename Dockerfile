FROM --platform=linux/amd64  node:22.11.0

MAINTAINER SCAR "guicsou@lupit.io"
ENV TZ=America/Sao_Paulo

# Create App Directory
WORKDIR /usr/src/app

COPY . .
RUN yarn install