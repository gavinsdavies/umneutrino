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
{% assign member_names = "" %}

{% for member in members %}
    {% if member.experiments contains target_experiment %}
        {% if member_names != "" %}
            {% assign member_names = member_names | append: ", " %}
        {% endif %}
    {% assign member_names = member_names | append: member.name %}  
    {% endif %}
{% endfor %}

{% assign smembers = site.data.students %}
{% assign smember_names = "" %}

{% for smember in smembers %}
    {% if smember.experiments contains target_experiment %}
        {% if smember_names != "" %}
            {% assign smember_names = smember_names | append: ", " %}
        {% endif %}
    {% assign smember_names = smember_names | append: smember.name %}  
    {% endif %}
{% endfor %}
<h2>Staff</h2>
<h4>{{ member_names }}</h4>
{% if smember_names != "" %}
<h2>Undergraduate(s)</h2> <h4>{{ smember_names }}</h4>
 {% endif %}
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


