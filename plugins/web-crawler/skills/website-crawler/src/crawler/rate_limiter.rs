//! Rate limiting with token bucket algorithm

use governor::{Quota, RateLimiter as GovernorLimiter};
use std::num::NonZeroU32;
use std::sync::Arc;
use std::time::Duration;

/// Rate limiter using token bucket algorithm
#[derive(Clone)]
pub struct RateLimiter {
	limiter: Arc<GovernorLimiter<
		governor::state::direct::NotKeyed,
		governor::state::InMemoryState,
		governor::clock::DefaultClock,
	>>,
}

impl RateLimiter {
	/// Creates a new rate limiter with requests per second
	pub fn new(requests_per_second: f64) -> Self {
		// Convert to requests per minute for better precision
		let requests_per_minute = (requests_per_second * 60.0) as u32;
		let quota = Quota::per_minute(NonZeroU32::new(requests_per_minute).unwrap());

		Self {
			limiter: Arc::new(GovernorLimiter::direct(quota)),
		}
	}

	/// Waits until a request is allowed (blocking)
	pub async fn wait(&self) {
		loop {
			match self.limiter.check() {
				Ok(_) => return,
				Err(_) => {
					// Wait a bit before retrying
					tokio::time::sleep(Duration::from_millis(10)).await;
				}
			}
		}
	}

	/// Checks if a request is allowed without waiting
	pub fn check(&self) -> bool {
		self.limiter.check().is_ok()
	}
}

#[cfg(test)]
mod tests {
	use super::*;

	#[tokio::test]
	async fn test_rate_limiter() {
		let limiter = RateLimiter::new(10.0); // 10 req/s

		// First request should be immediate
		limiter.wait().await;

		// Second request should also work quickly
		limiter.wait().await;
	}

	#[tokio::test]
	async fn test_rate_limiter_blocking() {
		let limiter = RateLimiter::new(2.0); // 2 req/s (very slow)

		let start = std::time::Instant::now();
		
		// Make 3 requests
		limiter.wait().await;
		limiter.wait().await;
		limiter.wait().await;

		let elapsed = start.elapsed();

		// Should take at least 1 second (3 requests at 2 req/s)
		assert!(elapsed.as_secs() >= 1);
	}
}
