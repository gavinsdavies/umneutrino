---
title: "UM Neutrino - NOvA Research"
layout: experiment
excerpt: "UM Neutrino -- NOvA Research"
sitemap: false
permalink: /research/nova/
---

<div class="d-flex justify-content-between align-items-center">
# NOvA
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/NOvA.png"  alt="NOvA experiment logo" class="img-fluid" style="height: 50px; float: right;">
</div>

Work-in-progress, please standby (Sept. 02, 2024)

The NOvA (NuMI Off-Axis Electron Neutrino Appearance) experiment is a prominent particle physics project designed to investigate the mysterious behavior of neutrinos, specifically how they oscillate between different types as they travel. Situated in the United States, NOvA utilizes a powerful particle accelerator at Fermilab to produce a beam of muon neutrinos that travel 500 miles through the Earth to a large detector located in northern Minnesota. By comparing the number and type of neutrinos detected at this distant site with those generated at Fermilab, NOvA aims to uncover fundamental properties of neutrinos, such as the mass ordering and any differences between neutrino and antineutrino behavior. The findings from NOvA could provide crucial insights into the asymmetry between matter and antimatter in the universe, helping to explain why the universe is predominantly composed of matter. NOvA just recently celebrated the milestone of collecting 10 years of neutrino data!

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


