---
title: "UM Neutrino - NOvA Research"
layout: experiment
excerpt: "UM Neutrino -- NOvA Research"
permalink: /research/nova/
---

<div class="d-flex justify-content-between align-items-center">
# NOvA
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/NOvA.png"  alt="NOvA experiment logo" class="img-fluid" style="height: 50px; float: right;">
</div>

Page under construction -- more detail coming soon.

NOvA (NuMI Off-Axis Electron Neutrino Appearance) studies how neutrinos oscillate between flavors as they travel. Fermilab's NuMI beamline sends muon neutrinos 500 miles through the Earth to NOvA's far detector in northern Minnesota, where they're compared against measurements taken close to the beam. By running in both neutrino and antineutrino mode, NOvA constrains the neutrino mass ordering and looks for differences in how neutrinos and antineutrinos oscillate -- a step toward understanding why the universe is made of matter rather than antimatter. NOvA has now been collecting data for over a decade, building an increasingly precise dataset for its oscillation measurements.

{% assign target_experiment = "nova" %}
{% assign members = site.data.team_members %}
{% assign member_names = "" %}

{% for member in members %}
    {% assign member_experiments_downcased = member.experiments | join: "," | downcase %}
    {% if member_experiments_downcased contains target_experiment %}
        {% if member_names != "" %}
            {% assign member_names = member_names | append: ", " %}
        {% endif %}
    {% assign member_names = member_names | append: member.name %}  
    {% endif %}
{% endfor %}

{% assign smembers = site.data.students %}
{% assign smember_names = "" %}

{% for smember in smembers %}
    {% assign smember_experiments_downcased = smember.experiments | join: "," | downcase %}
    {% if smember_experiments_downcased contains target_experiment %}
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

<!-- TODO(Gavin): add a NOvA overview image (see dune.md's
     assets/images/respic/DUNE_overview.jpg for the convention) and restore
     an ![](...) tag pointing at assets/images/respic/<name>.jpg here. -->


