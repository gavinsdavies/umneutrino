---
title: "News"
layout: textlay
excerpt: "UM Neutrino at University of Mississippi."
sitemap: false
permalink: /allnews.html
---

# News

{% for article in site.data.news %}
<p>{{ article.date }} <br> {{ article.headline | safe }}</p>
{% endfor %}
