---
title: "UM Neutrino - DUNE Research"
layout: experiment
excerpt: "UM Neutrino -- DUNE Research"
sitemap: false
permalink: /research/dune/
---

<div class="d-flex justify-content-between align-items-center">
# DUNE
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/DUNE.png"  alt="DUNE experiment logo" class="img-responsive" style="height: 50px; float: right;">
</div>

Work-in-progress, please standby (Sept. 02, 2024)

<p>The DUNE (Deep Underground Neutrino Experiment) is a groundbreaking international scientific project aimed at exploring the fundamental properties of neutrinos, the most abundant yet least understood particles in the universe. Located deep underground at the Sanford Underground Research Facility in South Dakota, DUNE seeks to answer critical questions about the nature of matter and the origins of the universe. By studying neutrino oscillations, the experiment hopes to uncover the differences between neutrinos and antineutrinos, providing insights into why the universe is dominated by matter over antimatter. DUNE also aims to detect neutrinos from supernovae, offering a unique glimpse into the processes that fuel star explosions. This ambitious project involves collaboration from scientists and engineers worldwide and is expected to make significant contributions to our understanding of particle physics and cosmology.</p>

{% assign target_experiment = "dune" %}
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

![]({{ site.url }}{{ site.baseurl }}/assets/images/respic/DUNE_overview.jpg){: style="width: 70%; float: center; margin: 0px"}


