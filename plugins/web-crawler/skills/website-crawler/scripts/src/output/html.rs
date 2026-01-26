//! HTML report generation with dark/light theme and graph visualization

use crate::{CrawlResults, PageResult};
use anyhow::Result;
use std::collections::HashMap;
use std::path::Path;

#[derive(Debug, Clone, serde::Serialize)]
struct GraphNode {
	id: String,
	label: String,
	depth: i32,
	status: String,
	#[serde(rename = "inDegree")]
	in_degree: usize,
	#[serde(rename = "outDegree")]
	out_degree: usize,
	val: f32,
}

#[derive(Debug, Clone, serde::Serialize)]
struct GraphLink {
	source: String,
	target: String,
}

#[derive(Debug, Clone, serde::Serialize)]
struct GraphData {
	nodes: Vec<GraphNode>,
	links: Vec<GraphLink>,
}

/// Transforms crawl results into graph data for force-graph visualization
fn transform_to_graph_data(results: &[PageResult], base_domain: Option<&str>) -> GraphData {
	let mut node_map: HashMap<String, GraphNode> = HashMap::new();
	let mut links: Vec<GraphLink> = Vec::new();
	let mut in_degree_count: HashMap<String, usize> = HashMap::new();

	// Extract base domain from first result if not provided
	let base_domain = base_domain.map(|s| s.to_string()).or_else(|| {
		results.first().and_then(|page| {
			url::Url::parse(&page.url)
				.ok()
				.and_then(|u| u.domain().map(|d| d.to_string()))
		})
	});

	// Pass 1: Create nodes for all crawled pages
	for page in results {
		let is_external = base_domain
			.as_ref()
			.map(|d| !page.url.contains(d))
			.unwrap_or(false);
		let status = if page.error.is_some() {
			"error"
		} else if is_external {
			"external"
		} else {
			"success"
		};

		let label = if page.title.is_empty() {
			extract_label(&page.url)
		} else {
			page.title.clone()
		};

		node_map.insert(
			page.url.clone(),
			GraphNode {
				id: page.url.clone(),
				label,
				depth: page.depth as i32,
				status: status.to_string(),
				in_degree: 0,
				out_degree: page.links.len(),
				val: 1.0,
			},
		);

		// Count incoming links
		for link in &page.links {
			*in_degree_count.entry(link.clone()).or_insert(0) += 1;
		}
	}

	// Pass 2: Create links and missing nodes (external/uncrawled)
	for page in results {
		for target_url in &page.links {
			// Create node if not yet crawled (external or not visited)
			if !node_map.contains_key(target_url) {
				let is_external = base_domain
					.as_ref()
					.map(|d| !target_url.contains(d))
					.unwrap_or(true);

				node_map.insert(
					target_url.clone(),
					GraphNode {
						id: target_url.clone(),
						label: extract_label(target_url),
						depth: -1, // Not crawled
						status: if is_external { "external" } else { "success" }.to_string(),
						in_degree: *in_degree_count.get(target_url).unwrap_or(&0),
						out_degree: 0,
						val: 1.0,
					},
				);
			}

			// Create link
			links.push(GraphLink {
				source: page.url.clone(),
				target: target_url.clone(),
			});
		}
	}

	// Pass 3: Update inDegree and calculate final val
	for (url, count) in in_degree_count {
		if let Some(node) = node_map.get_mut(&url) {
			node.in_degree = count;
			// val determines node size (logarithmic scale)
			node.val = ((node.in_degree + node.out_degree) as f32).sqrt().max(1.0);
		}
	}

	GraphData {
		nodes: node_map.into_values().collect(),
		links,
	}
}

/// Extracts a readable label from a URL
fn extract_label(url: &str) -> String {
	if let Ok(parsed) = url::Url::parse(url) {
		let pathname = parsed.path();

		// Return hostname for root paths
		if pathname == "/" || pathname.is_empty() {
			return parsed.domain().unwrap_or(url).to_string();
		}

		// Return last path segment or full pathname
		let segments: Vec<&str> = pathname.split('/').filter(|s| !s.is_empty()).collect();
		if let Some(last) = segments.last() {
			return truncate(last, 30);
		}

		return truncate(pathname, 30);
	}

	// If URL parsing fails, return truncated original
	truncate(url, 30)
}

/// Truncates a string to a maximum length
fn truncate(s: &str, max_len: usize) -> String {
	if s.len() <= max_len {
		s.to_string()
	} else {
		format!("{}...", &s[..max_len - 3])
	}
}

/// Escapes HTML special characters
fn escape_html(text: &str) -> String {
	text.replace('&', "&amp;")
		.replace('<', "&lt;")
		.replace('>', "&gt;")
		.replace('"', "&quot;")
		.replace('\'', "&#039;")
}

/// Generates HTML report from crawl results
pub fn generate_html(results: &CrawlResults) -> Result<String> {
	let stats = &results.stats;
	let pages_crawled = stats.pages_crawled;
	let pages_found = stats.pages_found;
	let errors = stats.errors;
	let duration = stats.duration.unwrap_or(0) as f64 / 1000.0; // milliseconds to seconds

	// Group pages by depth
	let mut pages_by_depth: HashMap<usize, Vec<&PageResult>> = HashMap::new();
	for page in &results.results {
		pages_by_depth
			.entry(page.depth)
			.or_insert_with(Vec::new)
			.push(page);
	}

	let mut sorted_depths: Vec<usize> = pages_by_depth.keys().copied().collect();
	sorted_depths.sort_unstable();

	// Transform data for graph visualization
	let graph_data = transform_to_graph_data(&results.results, None);
	let graph_data_json = serde_json::to_string(&graph_data)?;

	// Generate depth sections HTML
	let mut depth_sections = String::new();
	for depth in sorted_depths {
		let pages = pages_by_depth.get(&depth).unwrap();
		depth_sections.push_str(&format!(
			r#"
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Depth {}</h2>
        <span class="badge">{} pages</span>
      </div>

"#,
			depth,
			pages.len()
		));

		for (page_index, page) in pages.iter().enumerate() {
			let link_id = format!("links-{}-{}", depth, page_index);
			let status_code = page.status_code;
			let status_class = if status_code == 200 { "success" } else { "error" };

			depth_sections.push_str(&format!(
				r#"      <div class="page-card">
        <div class="page-header">
          <div class="page-url">
            <a href="{}" target="_blank" rel="noopener noreferrer">{}</a>
          </div>
          <div class="page-meta">
            <span class="status-badge {}">{}</span>
            <span class="depth-badge">Depth {}</span>
          </div>
        </div>

"#,
				page.url, page.url, status_class, status_code, page.depth
			));

			if !page.title.is_empty() {
				depth_sections.push_str(&format!(
					"        <div class=\"page-title\">{}</div>\n\n",
					escape_html(&page.title)
				));
			}

			if let Some(error) = &page.error {
				depth_sections.push_str(&format!(
					"        <div class=\"error-message\">Error: {}</div>\n\n",
					escape_html(error)
				));
			}

			if !page.links.is_empty() {
				let link_limit = 100;
				depth_sections.push_str(&format!(
					r#"        <div class="links">
          <button class="links-toggle" onclick="toggleLinks('{}', this)">
            <span>Links ({})</span>
            <span class="links-toggle-icon">▼</span>
          </button>
          <div class="links-content" id="{}">
            <div class="links-container">
"#,
					link_id,
					page.links.len(),
					link_id
				));

				for link in page.links.iter().take(link_limit) {
					depth_sections.push_str(&format!(
						r#"              <div class="link-item">
                <a href="{}" target="_blank" rel="noopener noreferrer">{}</a>
              </div>
"#,
						link, link
					));
				}

				if page.links.len() > link_limit {
					depth_sections.push_str(&format!(
						"              <div class=\"link-count\">... and {} more links</div>\n",
						page.links.len() - link_limit
					));
				}

				depth_sections.push_str(
					r#"            </div>
          </div>
        </div>
"#,
				);
			}

			depth_sections.push_str("      </div>\n");
		}

		depth_sections.push_str("    </div>\n");
	}

	// Generate complete HTML (template from TypeScript crawler)
	let html = include_str!("../../templates/report.html")
		.replace("{{PAGES_CRAWLED}}", &pages_crawled.to_string())
		.replace("{{PAGES_FOUND}}", &pages_found.to_string())
		.replace("{{ERRORS}}", &errors.to_string())
		.replace("{{DURATION}}", &format!("{:.1}", duration))
		.replace("{{DEPTH_SECTIONS}}", &depth_sections)
		.replace("{{GRAPH_DATA_JSON}}", &graph_data_json);

	Ok(html)
}

/// Writes HTML report to file
pub fn write_html_report(results: &CrawlResults, output_path: &Path) -> Result<()> {
	let html = generate_html(results)?;
	std::fs::write(output_path, html)?;
	Ok(())
}
