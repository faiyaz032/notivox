# Notivox

[![npm version](https://img.shields.io/npm/v/notivox.svg)](https://www.npmjs.com/package/notivox)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/notivox.svg)](https://nodejs.org)

Notivox is a cross-platform notification orchestrator for Node.js, unifying delivery across email, SMS, push, and emerging channels (e.g., WhatsApp, Telegram). It includes a rule engine for prioritizing channels and a robust retry mechanism for failed deliveries.

## Features

- 📧 **Unified API**: Send notifications through various channels with a consistent interface
- 🔄 **Queue Integration**: Optional Redis-backed queue for handling high-volume messaging
- 🔁 **Automatic Retries**: Built-in retry mechanism for failed deliveries
- 🎯 **Extensible**: Easy to add new delivery channels and providers
- 📈 **TypeScript Support**: Full TypeScript integration with type definitions included

## Installation

```bash
npm install notivox
```

or

```bash
yarn add notivox
```

## Quick Start

### Basic Usage

```typescript
import { Notivox } from 'notivox';

async function main() {
  // Initialize Notivox with your configuration
  const notivox = await Notivox.init({
    email: {
      nodemailer: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@example.com',
          pass: 'your-password',
        },
      },
    },
  });

  // Get the email adapter
  const emailAdapter = notivox.getAdapter('nodemailer');

  // Send an email
  await emailAdapter.sendEmail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Hello from Notivox!',
    text: 'This is a test email sent using Notivox.',
    html: '<p>This is a <b>test email</b> sent using Notivox.</p>',
  });
}

main().catch(console.error);
```

### With Queue (Recommended for Production)

```typescript
import { Notivox } from 'notivox';

async function main() {
  // Initialize with Redis queue support
  const notivox = await Notivox.init({
    email: {
      nodemailer: {
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
          user: 'your-email@example.com',
          pass: 'your-password',
        },
      },
    },
    queue: {
      redis: {
        host: 'localhost',
        port: 6379,
      },
    },
  });

  // Get the email adapter
  const emailAdapter = notivox.getAdapter('nodemailer');

  // Send an email (will be added to queue)
  await emailAdapter.sendEmail({
    from: 'sender@example.com',
    to: 'recipient@example.com',
    subject: 'Hello from Notivox!',
    text: 'This is a test email sent using Notivox with queue support.',
  });

  // The email will be processed in the background
  console.log('Email job added to queue');
}

main().catch(console.error);
```

## Email Options

When sending an email, you can use the following options:

```typescript
await emailAdapter.sendEmail({
  from: 'sender@example.com', // Sender email address
  to: 'recipient@example.com', // Recipient email address (or comma-separated list)
  subject: 'Email Subject', // Email subject
  text: 'Plain text content', // Plain text version
  html: '<p>HTML content</p>', // HTML version
  attachments: [
    // Optional attachments
    {
      filename: 'attachment.pdf',
      content: Buffer.from('...'),
      contentType: 'application/pdf',
    },
  ],
});
```

## Environment Variables

You can use environment variables for configuration:

```typescript
const notivox = await Notivox.init({
  email: {
    nodemailer: {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    },
  },
  queue: {
    redis: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    },
  },
});
```

## API Reference

### Notivox.init(config)

Initializes the Notivox instance with the provided configuration.

**Parameters:**

- `config` - An object containing channel configurations

**Returns:**

- A Promise that resolves to a new Notivox instance

### notivox.getAdapter(adapterName)

Gets a specific adapter instance.

**Parameters:**

- `adapterName` - Name of the adapter (e.g., 'nodemailer')

**Returns:**

- The adapter instance

### emailAdapter.sendEmail(options)

Sends an email using the configured email adapter.

**Parameters:**

- `options` - Email options (see Email Options section above)

**Returns:**

- A Promise that resolves when the email is sent or added to the queue

## Queue Configuration

When Redis queue is configured, all notifications are added to a queue and processed in the background. This is recommended for production use to handle high volumes and ensure delivery reliability.

## License

MIT

## Author

[Faiyaz Rahman](https://github.com/faiyaz032)
