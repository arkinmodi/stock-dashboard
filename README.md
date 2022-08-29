<div align="center" >
  <img src="public/logo.png" width="200px" height="200px" />
  <br />
  <h1>Stock Dashboard</h1>
  <p>A simple stocks dashboard to view the price of your investments.</p>
</div>

## Run Locally

1. Create a `.env` file following `.env.example`.

- The default `DATABASE_URL` in `.env.example` is setup to work with the `docker-compose.yml`.

2. Run `docker compose up` to start a MongoDB instance.
3. Run `npm run db-init` to apply the database schema.
4. Run `npm run dev` to start a development server on `localhost:3000`

## Tech Stack

- [Next.js](https://nextjs.org/)
- [tRPC](https://trpc.io/)
- [NextAuth.js](https://next-auth.js.org/)
- [Prisma](https://www.prisma.io/)
- [MongoDB](https://www.mongodb.com/) (hosted on [MongoDB Atlas](https://www.mongodb.com/atlas))

This app has heavy influence from [create-t3-app](https://github.com/t3-oss/create-t3-app).
