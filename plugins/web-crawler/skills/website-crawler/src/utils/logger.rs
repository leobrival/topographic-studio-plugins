//! Structured logging with tracing

use tracing_subscriber::{EnvFilter, fmt, layer::SubscriberExt, util::SubscriberInitExt};

/// Initializes the logging system
pub fn init_logger(debug: bool) {
	let filter = if debug {
		EnvFilter::new("debug")
	} else {
		EnvFilter::new("info")
	};

	tracing_subscriber::registry()
		.with(filter)
		.with(
			fmt::layer()
				.with_target(false)
				.with_thread_ids(false)
				.with_level(true)
		)
		.init();
}
