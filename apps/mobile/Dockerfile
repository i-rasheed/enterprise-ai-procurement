# Expo mobile apps are not hosted on Railway. This image exists only so the
# mobile service does not run `pnpm build` for the entire monorepo.
FROM alpine:3.21
RUN echo "SpendWise mobile deploys via Expo EAS, not Railway. Remove this service from your Railway project." > /README.txt
CMD ["cat", "/README.txt"]
