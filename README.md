# UM Neutrino Research Group Website

The official website for the UM Neutrino research group at the University of Mississippi's Department of Physics & Astronomy.

🌐 **Live Site:** [https://www.umneutrino.com](https://www.umneutrino.com)

## Technology Stack

This website is built with:

- **[Jekyll](https://jekyllrb.com)** 4.3 - Static site generator
- **[Bootstrap](https://getbootstrap.com)** 5.3.3 - CSS framework
- **[Bootswatch](https://bootswatch.com)** (Darkly theme) - Bootstrap theme
- **[Bootstrap Icons](https://icons.getbootstrap.com)** 1.11.2 - Icon library
- **Ruby** 3.0+ - Required runtime

### Jekyll Plugins

- jekyll-feed - RSS feed generation
- jekyll-seo-tag - SEO optimization
- jekyll-sitemap - Sitemap generation
- jekyll-paginate - Pagination support
- jekyll-archives - Archive pages
- jekyll-redirect-from - URL redirects
- jekyll-last-modified-at - Last modified dates
- liquid-c - Performance optimization

## Building Locally

### Prerequisites

- Ruby 3.0 or higher
- Bundler gem
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/gavinsdavies/umneutrino.git
   cd umneutrino
   ```

2. Install dependencies:
   ```bash
   bundle install
   ```

3. Run the development server:
   ```bash
   bundle exec jekyll serve --livereload
   ```

4. Open your browser to `http://localhost:4000`

The `--livereload` flag automatically refreshes your browser when you make changes.

### Building for Production

To generate the static site:

```bash
bundle exec jekyll build
```

The compiled site will be in the `_site/` directory.

## Project Structure

```
├── _data/           # YAML data files (team, publications, news, research)
├── _includes/       # Reusable HTML components
├── _layouts/        # Page templates
├── _pages/          # Markdown content pages
├── _sass/           # Sass stylesheets
├── assets/          # Images, CSS, JavaScript
│   ├── css/
│   ├── images/
│   └── js/
├── _config.yml      # Jekyll configuration
└── Gemfile          # Ruby dependencies
```

## Content Management

### Adding Team Members

Edit `_data/team_members.yml` or `_data/students.yml`:

```yaml
- name: Dr. Example Person
  photo: photo.jpg
  info: Position Title
  email: email@example.com
  country: 🇺🇸
  experiments:
    - NOvA
    - DUNE
```

### Adding Publications

Edit `_data/publist.yml`:

```yaml
- title: "Paper Title"
  authors: Author list
  link:
    url: https://doi.org/...
    display: Journal Name
  year: 2024
  highlight: 1  # Set to 1 to feature on homepage
```

### Adding News Items

Edit `_data/news.yml`:

```yaml
- date: 1 January 2024
  headline: "News headline here"
  category: milestone  # or team, publication, grant
```

## Deployment

This site can be deployed to:

- **GitHub Pages** - Automatic deployment from `gh-pages` branch
- **Netlify** - Connect your repository for automatic builds
- **Any static hosting** - Upload the `_site/` directory

## Credits

Originally inspired by the [Allan Lab](https://github.com/allanlab/allanlab) website template. This fork has been significantly modified and extended for the UM Neutrino group's specific needs.

## License

Copyright © 2019-2026 UM Neutrino Research Group, University of Mississippi.

Code released under the [MIT License](https://opensource.org/licenses/MIT).

## Contact

**Dr. Gavin S. Davies**  
University of Mississippi  
Department of Physics & Astronomy  
222 Lewis Hall  
University, MS 38677  
USA

Email: gavin.s.davies@gmail.com
