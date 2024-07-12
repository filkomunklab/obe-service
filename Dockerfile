# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# copy all required files
COPY . .

# install all deps
RUN bun install -p

EXPOSE 2001
ENTRYPOINT [ "bun", "start" ]