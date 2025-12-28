# frozen_string_literal: true

source "https://rubygems.org"

# gem "rails"

gem "jekyll", "~> 4.3"

# Jekyll plugins
group :jekyll_plugins do
  gem "jekyll-feed", "~> 0.17"           # RSS feed generation
  gem "jekyll-seo-tag", "~> 2.8"         # SEO optimization
  gem "jekyll-sitemap", "~> 1.4"         # Generate sitemap.xml
  gem "jekyll-paginate", "~> 1.1"        # Pagination support
  gem "jekyll-archives"                   # Archive pages by category/tag
  gem "jekyll-redirect-from"              # Redirect old URLs
  gem "jekyll-last-modified-at"           # Add last modified dates
end

# Performance
gem "liquid-c"                            # Faster Liquid rendering

# Development tools
group :development do
  gem "webrick", "~> 1.8"                 # Required for Ruby 3.0+
  gem "kramdown-parser-gfm"               # GitHub-flavored markdown
end