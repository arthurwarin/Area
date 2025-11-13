## Refresh the Dockerfile if changed 
`docker compose build --no-cache` 

## Launch the project 
`docker compose up` 

## Use an .env for project variable 
`POSTGRES_USER=`  
`POSTGRES_PASSWORD=`  
`POSTGRES_DB=`  
`DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"`  
`JWT_SECRET=`  
`AUTH_KEY=`  
