## Prerequisites

Before you begin, make sure you have **Node.js** installed (version 18 or higher is recommended).

- Download from: [https://nodejs.org](https://nodejs.org)

You can verify installation by running:

```bash
node -v
npm -v
```
---
## Installation

Install project dependencies using:

```bash
npm install
```
---

## Running the App

Start the application using:

```bash
npm run start
```

This will launch the server on http://localhost:3000

Once the server is running, you can test the RESTful API using tools such as Postman, Insomnia, or any HTTP client of your choice.

---

## Testing

### Unit Tests

To run unit tests:

```bash
npm run test
```
These tests check core logic like movie creation, showtime validation, and ticket booking — all in isolation from the full app.

### Test Coverage

To check test coverage of the Unit Tests:

```bash
npm run test:cov
```

### End-to-End (E2E) Tests

To run E2E tests:

```bash
npm run test:e2e
```
> Do **not** run the server manually when running E2E tests. The E2E suite will start and manage the server instance automatically.

The E2E tests simulate real-world race conditions such as:
- Attempting to create duplicate movies at the same time.
- Preventing overlapping showtimes created almost simultaneously.
- Preventing the same seat from being double-booked.

Each test ensures the system handles these situations gracefully and returns the correct HTTP status codes (`200 OK` or `409 Conflict`).

Important: Running the E2E tests will delete the current contents of the database (popcorn_palace.sqlite).
If you manually added any data while the server was running, it will be wiped out.
After the test suite finishes, the database will not be empty — it will contain the test data created during the E2E tests.
---

## Notes

- All database operations use **SQLite** stored in `popcorn_palace.sqlite`.
- API routes follow the structure described in the `README.md`.

---

## Known Limitation

As far as I understand, I have met all the requirements of the assignment. However, I would like to point out a known limitation in this project regarding **simultaneous creation or update of showtimes in the same theater**. If two such requests are processed **at the exact same time**, the system might not correctly detect overlapping time ranges between them. This happens because **SQLite does not support row-level locking or concurrent transactions** in a way that can prevent this kind of race condition. As a result, both operations might succeed with a `200 OK` response.

Given that the assignment explicitly allows using either plain SQL or an ORM, and the solution is not necessarily expected to be production-grade, I’ve chosen to leave this edge case unresolved for now.

