---
title: "News"
layout: textlay
excerpt: "UM Neutrino at University of Mississippi."
sitemap: false
permalink: /allnews.html
---

# All News

<!-- Filter buttons -->

<div class="mb-4">
  <button class="btn btn-sm btn-outline-secondary filter-btn active" data-filter="all">All</button>
  <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="team">Team</button>
  <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="milestone">Milestones</button>
  <button class="btn btn-sm btn-outline-secondary filter-btn" data-filter="publication">Publications</button>
</div>

<div id="news-list">
{% for article in site.data.news %}

<div class="news-item mb-4 pb-3 border-bottom" data-category="{{ article.category }}">
<div class="row">
<div class="col-md-2">
<small class="text-muted fw-bold">{{ article.date }}</small>
<div class="mt-1">
{% if article.category == 'team' %}
<span class="badge bg-primary">Team</span>
{% elsif article.category == 'milestone' %}
<span class="badge bg-success">Milestone</span>
{% elsif article.category == 'publication' %}
<span class="badge bg-info">Publication</span>
{% elsif article.category == 'award' %}
<span class="badge bg-warning">Award</span>
{% elsif article.category == 'event' %}
<span class="badge bg-secondary">Event</span>
{% else %}
<span class="badge bg-light text-dark">{{ article.category | capitalize }}</span>
{% endif %}
</div>
</div>
<div class="col-md-10">
<h5 class="mb-2">{{ article.title }}</h5>
<p class="mb-0">{{ article.description }}</p>
{% if article.link %}
<a href="{{ article.link }}" class="btn btn-sm btn-outline-primary mt-2">Read More</a>
{% endif %}
</div>
</div>
</div>

{% endfor %}
</div>
