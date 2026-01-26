//! Checkpoint system for resumable crawls

use crate::{CrawlStats, PageResult};
use anyhow::Result;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;

/// Checkpoint data structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Checkpoint {
	/// URLs that have been visited
	pub visited: HashSet<String>,
	/// Partial results collected so far
	pub results: Vec<PageResult>,
	/// Current stats
	pub stats: CrawlStats,
	/// Timestamp of checkpoint
	pub timestamp: DateTime<Utc>,
	/// Base URL of the crawl
	pub base_url: String,
	/// Crawl configuration hash (to detect config changes)
	pub config_hash: u64,
}

impl Checkpoint {
	/// Creates a new checkpoint from current crawl state
	pub fn new(
		visited: HashSet<String>,
		results: Vec<PageResult>,
		stats: CrawlStats,
		base_url: String,
		config_hash: u64,
	) -> Self {
		Self {
			visited,
			results,
			stats,
			timestamp: Utc::now(),
			base_url,
			config_hash,
		}
	}

	/// Saves checkpoint to disk
	pub fn save(&self, output_dir: &PathBuf) -> Result<()> {
		let checkpoint_path = Self::checkpoint_path(output_dir);

		// Create directory if it doesn't exist
		if let Some(parent) = checkpoint_path.parent() {
			fs::create_dir_all(parent)?;
		}

		let json = serde_json::to_string_pretty(self)?;
		fs::write(checkpoint_path, json)?;

		Ok(())
	}

	/// Loads checkpoint from disk
	pub fn load(output_dir: &PathBuf) -> Result<Self> {
		let checkpoint_path = Self::checkpoint_path(output_dir);
		let json = fs::read_to_string(checkpoint_path)?;
		let checkpoint: Checkpoint = serde_json::from_str(&json)?;
		Ok(checkpoint)
	}

	/// Checks if a checkpoint exists
	pub fn exists(output_dir: &PathBuf) -> bool {
		Self::checkpoint_path(output_dir).exists()
	}

	/// Deletes checkpoint file
	pub fn delete(output_dir: &PathBuf) -> Result<()> {
		let checkpoint_path = Self::checkpoint_path(output_dir);
		if checkpoint_path.exists() {
			fs::remove_file(checkpoint_path)?;
		}
		Ok(())
	}

	/// Returns the checkpoint file path
	fn checkpoint_path(output_dir: &PathBuf) -> PathBuf {
		output_dir.join("checkpoint.json")
	}

	/// Validates that checkpoint matches current config
	pub fn is_valid(&self, base_url: &str, config_hash: u64) -> bool {
		self.base_url == base_url && self.config_hash == config_hash
	}
}

/// Checkpoint manager for periodic saves
pub struct CheckpointManager {
	output_dir: PathBuf,
	config_hash: u64,
	base_url: String,
	last_save: Option<DateTime<Utc>>,
	save_interval_secs: u64,
}

impl CheckpointManager {
	/// Creates a new checkpoint manager
	pub fn new(output_dir: PathBuf, base_url: String, config_hash: u64, save_interval_secs: u64) -> Self {
		Self {
			output_dir,
			config_hash,
			base_url,
			last_save: None,
			save_interval_secs,
		}
	}

	/// Checks if it's time to save a checkpoint
	pub fn should_save(&self) -> bool {
		match self.last_save {
			None => true,
			Some(last) => {
				let elapsed = Utc::now()
					.signed_duration_since(last)
					.num_seconds() as u64;
				elapsed >= self.save_interval_secs
			}
		}
	}

	/// Saves a checkpoint and updates last save time
	pub fn save(
		&mut self,
		visited: HashSet<String>,
		results: Vec<PageResult>,
		stats: CrawlStats,
	) -> Result<()> {
		let checkpoint = Checkpoint::new(
			visited,
			results,
			stats,
			self.base_url.clone(),
			self.config_hash,
		);

		checkpoint.save(&self.output_dir)?;
		self.last_save = Some(Utc::now());

		Ok(())
	}

	/// Attempts to load an existing checkpoint
	pub fn try_load(&self) -> Option<Checkpoint> {
		if !Checkpoint::exists(&self.output_dir) {
			return None;
		}

		match Checkpoint::load(&self.output_dir) {
			Ok(checkpoint) => {
				if checkpoint.is_valid(&self.base_url, self.config_hash) {
					Some(checkpoint)
				} else {
					eprintln!("Warning: Checkpoint is invalid (config mismatch), starting fresh");
					None
				}
			}
			Err(e) => {
				eprintln!("Warning: Failed to load checkpoint: {}", e);
				None
			}
		}
	}

	/// Clears the checkpoint file
	pub fn clear(&self) -> Result<()> {
		Checkpoint::delete(&self.output_dir)
	}
}
