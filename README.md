# Chat With Documents

<p align="center"><img src="docs/usage.gif" alt="Chat with documents" width="auto" height="700px" /></p>

## Overview

Upload one or multiple sources (including .pdf files) and chat with the contents of the documents using OpenAI models.

## Features

- Uses pgvector extension for PostgreSQL
- Integrates OpenAI embeddings for vector creation
- Implements a NextJS web application for file upload and usage
- Chunks and stores vectors in a local database
- Provides a simple, intuitive user interface
- Uses OpenAI models for embedding and chat

## Prerequisites

- Node.js (v14 or later)
- Docker and Docker Compose
- OpenAI API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/MartinKondor/chat-with-document.git
   cd chat-with-document
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up the database:

   ```
   docker-compose up -d
   npm run db:setup
   ```

4. Modify the given `.env` file in the root directory (if you wish):
   ```
   SKIP_ENV_VALIDATION=0
   NODE_ENV="development"
   POSTGRES_URL="postgres://postgresuser:postgrespassword@localhost:54322"
   POSTGRES_URL_NON_POOLING="postgres://postgresuser:postgrespassword@localhost:54322?pool=false"
   OPENAI_API_KEY="sk-proj-..."
   ```

## Usage

1. Start the development server:

   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`.

3. Follow the on-screen instructions:
   - Upload one or more files (max 50,000 characters)
   - Chat with the contents of the documents

## How It Works

1. **File Upload**: The app chunks your uploaded text file and creates embeddings using OpenAI's API.
2. **Vector Storage**: These embeddings are stored in the local PostgreSQL database using pgvector.
3. **Chat**: The chat is done using OpenAI models.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgements

- [OpenAI](https://openai.com/) for their embedding and models API
- [pgvector](https://github.com/pgvector/pgvector) for enabling vector operations in PostgreSQL
- [Next.js](https://nextjs.org/) for the React framework

## Contact

Martin Kondor - [https://martinkondor.github.io/](https://martinkondor.github.io/)

Project Link: [https://github.com/MartinKondor/chat-with-document](https://github.com/MartinKondor/chat-with-document)

## License

MIT License. See the [LICENSE](./LICENSE) file for more details.

Copyright © Martin Kondor
