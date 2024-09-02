---
title: "UM Neutrino - NOvA Research"
layout: experiment
excerpt: "UM Neutrino -- NOvA Research"
sitemap: false
permalink: /research/nova/
---

<div class="d-flex justify-content-between align-items-center">
# NOvA
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/NOvA.png"  alt="NOvA experiment logo" class="img-responsive" style="height: 50px; float: right;">
</div>

Work-in-progress, please standby (Sept. 02, 2024)



{% assign target_experiment = "nova" %}
{% assign members = site.data.team_members %}
{% assign member_links = "" %}

{% for member in members %}
    {% if member.experiments contains target_experiment %}
        {% if member_links != "" %}
            {% assign member_links = member_links | append: ", " %}
        {% endif %}
    {% assign member_anchor = member.name | slugify %}
    {% assign link = "<a href='#" | append: member_anchor | append: "'>" | append: member.name | append: "</a>" %}
    {% assign member_links = member_links | append: link %}
    {% endif %}
{% endfor %}

<h4>{{ member_links | safe }}</h4>

<!-- Render Member Sections -->
{% for member in members %}
  {% if member.experiments contains target_experiment %}
    <p>Rendering section for: {{ member.name }}</p>
    <h4 id="{{ member.name | slugify }}">{{ member.name }}</h4>
    <p>Details about {{ member.name }}.</p>
  {% endif %}
{% endfor %}

<!--
<h1>Members and Their Experiments</h1>

{% assign experiments = site.data.research %}
{% assign members = site.data.team_members %}

{% for member in members %}
  <h2>{{ member.name }}</h2>
  <ul>
    {% for experiment in member.experiments %}
      {% assign experiment_details = experiments | where: "link", experiment | first %}
      <li>
        {{ experiment_details.name }}: {{ experiment_details.description }}
      </li>
    {% endfor %}
  </ul>
{% endfor %}
-->

![]({{ site.url }}{{ site.baseurl }}/images/respic/.png){: style="width: 70%; float: center; margin: 0px"}


