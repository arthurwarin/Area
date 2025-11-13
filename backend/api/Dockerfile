FROM node:20
WORKDIR /app

CMD ["sh", "-c", "npm install && npx prisma generate && npx prisma migrate reset --force && npm run seed && (npx prisma studio & npm run dev)"]
