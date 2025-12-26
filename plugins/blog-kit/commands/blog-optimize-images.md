# Blog Image Optimization

Optimize article images with automated compression, format conversion (WebP), and reference updates.

## Usage

```bash
/blog-optimize-images "language/article-slug"
```

**Examples**:
```bash
/blog-optimize-images "en/nodejs-best-practices"
/blog-optimize-images "fr/microservices-logging"
```

**Note**: Provide the language code and article slug (path relative to `articles/`).

## Prerequisites

 **Required**:
- Article exists at `articles/[language]/[slug]/article.md`
- Images referenced in article (`.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.tiff`)
- ffmpeg installed (for conversion)

**Install ffmpeg**:
```bash
# macOS
brew install ffmpeg

# Windows (with Chocolatey)
choco install ffmpeg

# Windows (manual)
# Download from: https://ffmpeg.org/download.html

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

## What This Command Does

Delegates to the **quality-optimizer** subagent (Phase 4) for image optimization:

- **Discovers Images**: Scans article for image references
- **Backs Up Originals**: Copies to `images/.backup/` (preserves uncompressed)
- **Converts to WebP**: 80% quality, optimized for web
- **Updates References**: Changes `.png` → `.webp` in article.md
- **Reports Results**: Shows size reduction and file locations

**Time**: 10-20 minutes (depends on image count/size)
**Output**: Optimized images in `images/`, backups in `images/.backup/`

## Instructions

Create a new subagent conversation with the `quality-optimizer` agent.

**Provide the following prompt**:

```
You are optimizing images for a blog article.

**Article Path**: articles/$ARGUMENTS/article.md

Execute ONLY Phase 4 (Image Optimization) from your instructions:

1. **Image Discovery**:
   - Scan article for image references
   - Extract image paths from markdown: `grep -E '!\[.*\]\(.*\.(png|jpg|jpeg|gif|bmp|tiff)\)' article.md`
   - Build list of images to process

2. **Generate Optimization Script** (`/tmp/optimize-images-$$.sh`):
   - Create image optimization script in /tmp/
   - Include backup logic (copy originals to images/.backup/)
   - Include conversion logic (to WebP, 80% quality)
   - Include reference update logic (sed replacements in article.md)
   - Make script executable

3. **Execute Script**:
   - Run the optimization script
   - Capture output and errors
   - Verify all images processed successfully

4. **Validation**:
   - Check all originals backed up to images/.backup/
   - Verify all WebP files created in images/
   - Confirm article.md references updated
   - Calculate total size reduction

**Important**:
- All scripts must be in /tmp/ (never pollute project)
- Backup originals BEFORE conversion
- Use ffmpeg (cross-platform: Windows, macOS, Linux)
- 80% quality for WebP conversion (hardcoded)
- Update ALL image references in article.md
- Report file size reductions

Begin image optimization now.
```

## Expected Output

After completion, verify:

 **Backup Directory Created**:
```bash
ls articles/en/my-article/images/.backup/
# screenshot.png (original)
# diagram.png (original)
```

 **Optimized Images Created**:
```bash
ls articles/en/my-article/images/
# screenshot.webp (optimized, 80% quality)
# diagram.webp (optimized, 80% quality)
```

 **Article References Updated**:
```markdown
# Before:
![Screenshot](images/.backup/screenshot.png)

# After:
![Screenshot](images/screenshot.webp)
```

 **Size Reduction Report**:
```
 Optimization Results:
  - screenshot.png: 2.4MB → 512KB (79% reduction)
  - diagram.png: 1.8MB → 420KB (77% reduction)

  Total savings: 3.3MB (78% reduction)
```

## Supported Image Formats

### Source Formats (will be converted)
- `.png` - Portable Network Graphics
- `.jpg` / `.jpeg` - JPEG images
- `.gif` - Graphics Interchange Format (first frame)
- `.bmp` - Bitmap images
- `.tiff` - Tagged Image File Format

### Target Format
- `.webp` - WebP (80% quality, optimized)

### Compression Settings

**Hardcoded** (cannot be changed via command):
- **Quality**: 80%
- **Format**: WebP
- **Method**: ffmpeg (cross-platform)

**Why 80%?**
- Excellent visual quality
- Significant file size reduction (30-70%)
- Broad browser support
- Optimal for web performance

## Image Workflow

### 1. Add Images to Article

Place originals in `.backup/` first:
```bash
cp ~/Downloads/screenshot.png articles/en/my-article/images/.backup/
```

Reference in article (use `.backup/` path initially):
```markdown
![Architecture Screenshot](images/.backup/screenshot.png)
```

### 2. Run Optimization

```bash
/blog-optimize-images "en/my-article"
```

### 3. Verify Results

Check backups:
```bash
ls articles/en/my-article/images/.backup/
# screenshot.png 
```

Check optimized:
```bash
ls articles/en/my-article/images/
# screenshot.webp 
```

Check article updated:
```bash
grep "screenshot" articles/en/my-article/article.md
# ![Architecture Screenshot](images/screenshot.webp) 
```

## Multi-Language Support

Images are per-language/per-article:

```bash
# English article images
/blog-optimize-images "en/my-topic"
# → articles/en/my-topic/images/

# French article images
/blog-optimize-images "fr/my-topic"
# → articles/fr/my-topic/images/
```

**Sharing images across languages**:
```markdown
# In French article, link to English image
![Diagram](/en/my-topic/images/diagram.webp)
```

## Re-Optimization

If you need to re-optimize:

### Restore from Backup
```bash
# Copy backups back to main images/
cp articles/en/my-article/images/.backup/* articles/en/my-article/images/

# Update article references to use .backup/ again
sed -i '' 's|images/\([^.]*\)\.webp|images/.backup/\1.png|g' articles/en/my-article/article.md
```

### Run Optimization Again
```bash
/blog-optimize-images "en/my-article"
```

## Troubleshooting

### "ffmpeg not found"
```bash
# Install ffmpeg
brew install ffmpeg                    # macOS
choco install ffmpeg                   # Windows (Chocolatey)
sudo apt-get install ffmpeg            # Linux

# Verify installation
ffmpeg -version
```

### "No images to optimize"
```bash
# Check article has image references
grep "!\[" articles/en/my-article/article.md

# Check image files exist
ls articles/en/my-article/images/.backup/
```

### "Images not updating in article"
```bash
# Check current references
grep "images/" articles/en/my-article/article.md

# Manually fix if needed
sed -i '' 's|\.png|.webp|g' articles/en/my-article/article.md
```

### "Permission denied"
```bash
# Make optimization script executable
chmod +x /tmp/optimize-images-*.sh

# Or run agent again (it recreates script)
```

## Performance Tips

### Before Optimization
1. **Use descriptive names**: `architecture-diagram.png` not `img1.png`
2. **Keep high quality**: Optimization preserves visual quality
3. **Remove unused images**: Delete unreferenced images first

### After Optimization
1. **Verify backups exist**: Check `.backup/` directory
2. **Test image loading**: Preview article to ensure images load
3. **Monitor file sizes**: Typical reduction 30-70%
4. **Commit both**: Commit `.backup/` and optimized images (or just optimized)

## Integration with Workflows

### New Article with Images

```bash
# 1. Create article
/blog-marketing "en/my-topic"

# 2. Add images to .backup/
cp ~/images/*.png articles/en/my-topic/images/.backup/

# 3. Reference in article.md
# ![Image](images/.backup/image.png)

# 4. Optimize
/blog-optimize-images "en/my-topic"

# 5. Validate
/blog-optimize "en/my-topic"
```

### Update Existing Article Images

```bash
# 1. Add new images to .backup/
cp ~/new-image.png articles/en/my-topic/images/.backup/

# 2. Reference in article
# ![New Image](images/.backup/new-image.png)

# 3. Re-optimize (only new images affected)
/blog-optimize-images "en/my-topic"
```

## Storage Considerations

### What to Commit to Git

**Option 1: Commit Both** (recommended for collaboration)
```gitignore
# .gitignore - allow both
# (images/.backup/ and images/*.webp committed)
```

**Option 2: Commit Only Optimized**
```gitignore
# .gitignore - exclude backups
articles/**/images/.backup/
```

**Option 3: Commit Only Backups** (not recommended)
```gitignore
# .gitignore - exclude optimized
articles/**/images/*.webp
# (requires re-optimization on each machine)
```

### Large Images

For very large originals (>10MB):
1. Store backups externally (CDN, cloud storage)
2. Document source URL in article frontmatter
3. Only commit optimized `.webp` files

```yaml
---
title: "My Article"
image_sources:
  - original: "https://cdn.example.com/screenshot.png"
    optimized: "images/screenshot.webp"
---
```

## Script Cleanup

Optimization scripts are temporary:

```bash
# List optimization scripts
ls /tmp/optimize-images-*.sh

# Remove manually if needed
rm /tmp/optimize-images-*.sh

# Or let OS auto-cleanup on reboot
```

---

**Ready to optimize images?** Provide the language/slug path and execute this command.
