package main

import (
	"context"
	"encoding/json"
	"encoding/xml"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	"golang.org/x/net/html"
	"golang.org/x/time/rate"
)

// LogLevel represents the log severity level
type LogLevel string

const (
	LogLevelTrace LogLevel = "TRACE"
	LogLevelDebug LogLevel = "DEBUG"
	LogLevelInfo  LogLevel = "INFO"
	LogLevelWarn  LogLevel = "WARN"
	LogLevelError LogLevel = "ERROR"
	LogLevelFatal LogLevel = "FATAL"
)

// AppLogger is a simple logger structure
type AppLogger struct {
	Level LogLevel
}

func (l *AppLogger) logf(level LogLevel, format string, args ...interface{}) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	msg := fmt.Sprintf(format, args...)
	log.Printf("[%s] %s: %s", timestamp, level, msg)
}

func (l *AppLogger) Info(format string, args ...interface{}) {
	l.logf(LogLevelInfo, format, args...)
}

func (l *AppLogger) Warn(format string, args ...interface{}) {
	l.logf(LogLevelWarn, format, args...)
}

func (l *AppLogger) Error(format string, args ...interface{}) {
	l.logf(LogLevelError, format, args...)
}

func (l *AppLogger) Debug(format string, args ...interface{}) {
	l.logf(LogLevelDebug, format, args...)
}

var logger = &AppLogger{Level: LogLevelInfo}

// SitemapURL represents a URL entry in a sitemap
type SitemapURL struct {
	Loc string `xml:"loc"`
}

// Sitemap represents an XML sitemap structure
type Sitemap struct {
	XMLName xml.Name     `xml:"urlset"`
	URLs    []SitemapURL `xml:"url"`
}

// SitemapIndex represents a sitemap index file
type SitemapIndex struct {
	XMLName  xml.Name          `xml:"sitemapindex"`
	Sitemaps []SitemapIndexURL `xml:"sitemap"`
}

// SitemapIndexURL represents a sitemap URL entry in an index
type SitemapIndexURL struct {
	Loc string `xml:"loc"`
}

// PageResult represents the result of crawling a single page
type PageResult struct {
	URL         string    `json:"url"`
	Title       string    `json:"title"`
	StatusCode  int       `json:"status_code"`
	Depth       int       `json:"depth"`
	Links       []string  `json:"links"`
	Error       string    `json:"error,omitempty"`
	CrawledAt   time.Time `json:"crawled_at"`
	ContentType string    `json:"content_type"`
}

// CrawlJob represents a crawl job
type CrawlJob struct {
	URL   string
	Depth int
}

// Stats contains crawling statistics
type Stats struct {
	PagesFound    int64     `json:"pages_found"`
	PagesCrawled  int64     `json:"pages_crawled"`
	ExternalLinks int64     `json:"external_links"`
	ExcludedLinks int64     `json:"excluded_links"`
	Errors        int64     `json:"errors"`
	StartTime     time.Time `json:"start_time"`
}

// CrawlResults represents the final output
type CrawlResults struct {
	Stats   Stats        `json:"stats"`
	Results []PageResult `json:"results"`
}

// Checkpoint represents the saved state
type Checkpoint struct {
	VisitedURLs []string     `json:"visited_urls"`
	Results     []PageResult `json:"results"`
	Stats       Stats        `json:"stats"`
	LastSaved   time.Time    `json:"last_saved"`
}

// Crawler represents the main crawler instance
type Crawler struct {
	config         Config
	visited        sync.Map
	results        []PageResult
	resultsMux     sync.Mutex
	stats          Stats
	rateLimiter    *rate.Limiter
	httpClient     *http.Client
	checkpointFile string
	excludeRegex   []*regexp.Regexp
	activeJobs     int64
	jobsMux        sync.Mutex
}

// Config represents the crawler configuration
type Config struct {
	BaseURL       string
	AllowedDomain string
	MaxDepth      int
	MaxWorkers    int
	RateLimit     int
	OutputDir     string
	UseSitemap    bool
}

// NewCrawler creates a new crawler instance
func NewCrawler(config Config) *Crawler {
	// Compile exclude patterns
	excludePatterns := []string{
		`\.(jpg|jpeg|png|gif|svg|ico|pdf|zip|tar|gz|mp4|mp3|avi|mov|webp|bmp)$`,
		`\.(css|js|woff|woff2|ttf|eot|otf)$`,
		`^mailto:`,
		`^tel:`,
		`^javascript:`,
		`^#`,
		`\?.*utm_`,
	}

	var excludeRegex []*regexp.Regexp
	for _, pattern := range excludePatterns {
		if re, err := regexp.Compile(pattern); err == nil {
			excludeRegex = append(excludeRegex, re)
		}
	}

	safeDomain := strings.ReplaceAll(config.AllowedDomain, ".", "_")
	checkpointFile := filepath.Join("/tmp", fmt.Sprintf("crawler_%s_checkpoint.json", safeDomain))

	return &Crawler{
		config:         config,
		stats:          Stats{StartTime: time.Now()},
		rateLimiter:    rate.NewLimiter(rate.Limit(config.RateLimit), config.RateLimit),
		excludeRegex:   excludeRegex,
		checkpointFile: checkpointFile,
		httpClient: &http.Client{
			Timeout: 30 * time.Second,
			Transport: &http.Transport{
				MaxIdleConns:        100,
				MaxIdleConnsPerHost: 10,
				IdleConnTimeout:     90 * time.Second,
			},
		},
	}
}

// LoadCheckpoint loads saved state
func (c *Crawler) LoadCheckpoint() bool {
	if _, err := os.Stat(c.checkpointFile); os.IsNotExist(err) {
		return false
	}

	data, err := os.ReadFile(c.checkpointFile)
	if err != nil {
		logger.Warn("Failed to read checkpoint: %v", err)
		return false
	}

	var checkpoint Checkpoint
	if err := json.Unmarshal(data, &checkpoint); err != nil {
		logger.Warn("Failed to parse checkpoint: %v", err)
		return false
	}

	// Restore state
	for _, url := range checkpoint.VisitedURLs {
		c.visited.Store(url, true)
	}
	c.results = checkpoint.Results
	c.stats = checkpoint.Stats

	logger.Info("Checkpoint loaded: %d visited, %d results", len(checkpoint.VisitedURLs), len(checkpoint.Results))
	return true
}

// SaveCheckpoint saves current state
func (c *Crawler) SaveCheckpoint() error {
	visitedURLs := []string{}
	c.visited.Range(func(key, value interface{}) bool {
		visitedURLs = append(visitedURLs, key.(string))
		return true
	})

	checkpoint := Checkpoint{
		VisitedURLs: visitedURLs,
		Results:     c.results,
		Stats:       c.stats,
		LastSaved:   time.Now(),
	}

	data, err := json.Marshal(checkpoint)
	if err != nil {
		return err
	}

	return os.WriteFile(c.checkpointFile, data, 0644)
}

// FetchSitemap fetches URLs from sitemap.xml
func (c *Crawler) FetchSitemap() []string {
	urls := []string{}
	sitemapURLs := []string{
		fmt.Sprintf("%s://%s/sitemap.xml", "https", c.config.AllowedDomain),
		fmt.Sprintf("%s://%s/sitemap_index.xml", "https", c.config.AllowedDomain),
		fmt.Sprintf("%s://%s/wp-sitemap.xml", "https", c.config.AllowedDomain),
	}

	for _, sitemapURL := range sitemapURLs {
		logger.Info("Trying sitemap: %s", sitemapURL)
		resp, err := c.httpClient.Get(sitemapURL)
		if err != nil || resp.StatusCode != 200 {
			continue
		}
		defer resp.Body.Close()

		body, err := io.ReadAll(resp.Body)
		if err != nil {
			continue
		}

		// Try as sitemap index first
		var index SitemapIndex
		if err := xml.Unmarshal(body, &index); err == nil && len(index.Sitemaps) > 0 {
			logger.Info("Found sitemap index with %d sitemaps", len(index.Sitemaps))
			for _, sm := range index.Sitemaps {
				subURLs := c.fetchSitemapURL(sm.Loc)
				urls = append(urls, subURLs...)
			}
			return urls
		}

		// Try as regular sitemap
		var sitemap Sitemap
		if err := xml.Unmarshal(body, &sitemap); err == nil && len(sitemap.URLs) > 0 {
			logger.Info("Found sitemap with %d URLs", len(sitemap.URLs))
			for _, u := range sitemap.URLs {
				urls = append(urls, u.Loc)
			}
			return urls
		}
	}

	return urls
}

func (c *Crawler) fetchSitemapURL(sitemapURL string) []string {
	urls := []string{}
	resp, err := c.httpClient.Get(sitemapURL)
	if err != nil || resp.StatusCode != 200 {
		return urls
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return urls
	}

	var sitemap Sitemap
	if err := xml.Unmarshal(body, &sitemap); err == nil {
		for _, u := range sitemap.URLs {
			urls = append(urls, u.Loc)
		}
	}
	return urls
}

// Start begins the crawling process
func (c *Crawler) Start() {
	logger.Info("Starting crawler for %s", c.config.BaseURL)

	// Try to load checkpoint
	c.LoadCheckpoint()

	// Use large buffer to avoid deadlocks with many URLs
	jobs := make(chan CrawlJob, 10000)
	var wg sync.WaitGroup

	// Start workers
	for i := 0; i < c.config.MaxWorkers; i++ {
		wg.Add(1)
		go c.worker(jobs, &wg)
	}

	// Seed jobs
	if c.config.UseSitemap {
		logger.Info("Fetching sitemap URLs...")
		sitemapURLs := c.FetchSitemap()
		if len(sitemapURLs) > 0 {
			logger.Info("Adding %d URLs from sitemap", len(sitemapURLs))
			for _, url := range sitemapURLs {
				if !c.isVisited(url) && c.isAllowedDomain(url) {
					atomic.AddInt64(&c.activeJobs, 1)
					jobs <- CrawlJob{URL: url, Depth: 1}
				}
			}
		}
	}

	// Add initial job if not visited
	if !c.isVisited(c.config.BaseURL) {
		atomic.AddInt64(&c.activeJobs, 1)
		jobs <- CrawlJob{URL: c.config.BaseURL, Depth: 0}
	}

	// Monitor and checkpoint
	ticker := time.NewTicker(5 * time.Second)
	checkpointTicker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	defer checkpointTicker.Stop()

	go func() {
		for {
			select {
			case <-ticker.C:
				c.printProgress()
			case <-checkpointTicker.C:
				if err := c.SaveCheckpoint(); err != nil {
					logger.Warn("Failed to save checkpoint: %v", err)
				}
			}

			// Check if done
			if atomic.LoadInt64(&c.activeJobs) == 0 {
				time.Sleep(2 * time.Second) // Grace period
				if atomic.LoadInt64(&c.activeJobs) == 0 {
					close(jobs)
					return
				}
			}
		}
	}()

	wg.Wait()
	c.printProgress()
}

// worker processes crawl jobs
func (c *Crawler) worker(jobs chan CrawlJob, wg *sync.WaitGroup) {
	defer wg.Done()

	for job := range jobs {
		atomic.AddInt64(&c.activeJobs, -1)

		if c.shouldSkip(job.URL) {
			continue
		}

		c.markVisited(job.URL)
		c.rateLimiter.Wait(context.Background())

		result := c.crawlPage(job.URL, job.Depth)
		c.addResult(result)

		// Queue new jobs
		if job.Depth < c.config.MaxDepth {
			for _, link := range result.Links {
				if !c.isVisited(link) && c.isAllowedDomain(link) && !c.shouldExclude(link) {
					atomic.AddInt64(&c.activeJobs, 1)
					jobs <- CrawlJob{URL: link, Depth: job.Depth + 1}
				}
			}
		}
	}
}

// crawlPage crawls a single page
func (c *Crawler) crawlPage(pageURL string, depth int) PageResult {
	result := PageResult{
		URL:       pageURL,
		Depth:     depth,
		CrawledAt: time.Now(),
	}

	req, err := http.NewRequest("GET", pageURL, nil)
	if err != nil {
		result.Error = err.Error()
		atomic.AddInt64(&c.stats.Errors, 1)
		return result
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (compatible; WebCrawler/1.0)")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		result.Error = err.Error()
		atomic.AddInt64(&c.stats.Errors, 1)
		return result
	}
	defer resp.Body.Close()

	result.StatusCode = resp.StatusCode
	result.ContentType = resp.Header.Get("Content-Type")

	if resp.StatusCode != 200 {
		result.Error = fmt.Sprintf("HTTP %d", resp.StatusCode)
		atomic.AddInt64(&c.stats.Errors, 1)
		return result
	}

	atomic.AddInt64(&c.stats.PagesCrawled, 1)

	// Parse HTML
	if strings.Contains(result.ContentType, "text/html") {
		doc, err := html.Parse(resp.Body)
		if err == nil {
			result.Title = c.extractTitle(doc)
			result.Links = c.extractLinks(doc, pageURL)
		}
	}

	return result
}

// extractTitle extracts the page title
func (c *Crawler) extractTitle(n *html.Node) string {
	var title string
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "title" {
			if n.FirstChild != nil {
				title = n.FirstChild.Data
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			f(child)
		}
	}
	f(n)
	return title
}

// extractLinks extracts all links from the page
func (c *Crawler) extractLinks(n *html.Node, baseURL string) []string {
	var links []string
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "a" {
			for _, attr := range n.Attr {
				if attr.Key == "href" {
					link := c.normalizeURL(attr.Val, baseURL)
					if link != "" && !c.shouldExclude(link) {
						links = append(links, link)
						atomic.AddInt64(&c.stats.PagesFound, 1)
					}
				}
			}
		}
		for child := n.FirstChild; child != nil; child = child.NextSibling {
			f(child)
		}
	}
	f(n)
	return links
}

// normalizeURL normalizes a URL
func (c *Crawler) normalizeURL(href, baseURL string) string {
	parsedBase, _ := url.Parse(baseURL)
	parsedHref, err := url.Parse(href)
	if err != nil {
		return ""
	}

	if parsedHref.Scheme == "" {
		parsedHref.Scheme = parsedBase.Scheme
	}
	if parsedHref.Host == "" {
		parsedHref.Host = parsedBase.Host
	}

	parsedHref.Fragment = ""
	return parsedHref.String()
}

// shouldExclude checks if URL matches exclude patterns
func (c *Crawler) shouldExclude(urlStr string) bool {
	for _, re := range c.excludeRegex {
		if re.MatchString(urlStr) {
			atomic.AddInt64(&c.stats.ExcludedLinks, 1)
			return true
		}
	}
	return false
}

// isAllowedDomain checks if URL is in allowed domain
func (c *Crawler) isAllowedDomain(urlStr string) bool {
	parsedURL, err := url.Parse(urlStr)
	if err != nil {
		return false
	}
	return parsedURL.Host == c.config.AllowedDomain
}

// shouldSkip checks if URL should be skipped
func (c *Crawler) shouldSkip(urlStr string) bool {
	return c.isVisited(urlStr) || !c.isAllowedDomain(urlStr) || c.shouldExclude(urlStr)
}

// Thread-safe visited tracking
func (c *Crawler) isVisited(urlStr string) bool {
	_, visited := c.visited.Load(urlStr)
	return visited
}

func (c *Crawler) markVisited(urlStr string) {
	c.visited.Store(urlStr, true)
}

// Thread-safe result management
func (c *Crawler) addResult(result PageResult) {
	c.resultsMux.Lock()
	defer c.resultsMux.Unlock()
	c.results = append(c.results, result)
}

// printProgress prints current progress
func (c *Crawler) printProgress() {
	logger.Info("Progress: %d crawled, %d found, %d errors (active jobs: %d)",
		atomic.LoadInt64(&c.stats.PagesCrawled),
		atomic.LoadInt64(&c.stats.PagesFound),
		atomic.LoadInt64(&c.stats.Errors),
		atomic.LoadInt64(&c.activeJobs))
}

// SaveResults saves results to JSON file
func (c *Crawler) SaveResults() error {
	results := CrawlResults{
		Stats:   c.stats,
		Results: c.results,
	}

	data, err := json.MarshalIndent(results, "", "  ")
	if err != nil {
		return err
	}

	outputFile := filepath.Join(c.config.OutputDir, "results.json")
	if err := os.MkdirAll(c.config.OutputDir, 0755); err != nil {
		return err
	}

	// Remove checkpoint on successful completion
	os.Remove(c.checkpointFile)

	return os.WriteFile(outputFile, data, 0644)
}

func main() {
	// Parse flags
	urlFlag := flag.String("url", "", "Base URL to crawl")
	domainFlag := flag.String("domain", "", "Allowed domain")
	depthFlag := flag.Int("depth", 2, "Maximum crawl depth")
	workersFlag := flag.Int("workers", 20, "Number of workers")
	rateFlag := flag.Int("rate", 2, "Rate limit (requests/second)")
	outputFlag := flag.String("output", "", "Output directory")
	sitemapFlag := flag.Bool("sitemap", true, "Use sitemap.xml for discovery")
	flag.Parse()

	if *urlFlag == "" {
		log.Fatal("URL is required")
	}

	// Parse domain from URL if not provided
	domain := *domainFlag
	if domain == "" {
		parsedURL, err := url.Parse(*urlFlag)
		if err != nil {
			log.Fatal("Invalid URL")
		}
		domain = parsedURL.Host
	}

	config := Config{
		BaseURL:       *urlFlag,
		AllowedDomain: domain,
		MaxDepth:      *depthFlag,
		MaxWorkers:    *workersFlag,
		RateLimit:     *rateFlag,
		OutputDir:     *outputFlag,
		UseSitemap:    *sitemapFlag,
	}

	crawler := NewCrawler(config)
	crawler.Start()

	if err := crawler.SaveResults(); err != nil {
		logger.Error("Failed to save results: %v", err)
		os.Exit(1)
	}

	logger.Info("Crawling completed successfully")
}