//! JSON output

use crate::CrawlResults;
use anyhow::{Context, Result};
use std::path::Path;

pub fn write_json(results: &CrawlResults, output_path: &Path) -> Result<()> {
    let json = serde_json::to_string_pretty(results)
        .context("Failed to serialize results to JSON")?;
    
    std::fs::create_dir_all(output_path.parent().unwrap_or(Path::new(".")))?;
    std::fs::write(output_path, json)
        .with_context(|| format!("Failed to write JSON to {}", output_path.display()))?;
    
    Ok(())
}
