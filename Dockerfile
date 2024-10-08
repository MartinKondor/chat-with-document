FROM postgres:16.3-bookworm

# Install pgvector
RUN apt-get update && apt-get install -y postgresql-16-pgvector
