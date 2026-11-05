/**
 * Argon2 password checks use libuv's thread pool. The default size is 4, so a
 * morning login of 20 recruiters queues behind four hashes. Set this before
 * any module touches the pool (this file must be the first import in main.ts).
 */
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = '16';
}
