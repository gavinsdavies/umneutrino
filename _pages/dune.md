---
title: "UM Neutrino - DUNE Research"
layout: experiment
excerpt: "UM Neutrino -- DUNE Research"
permalink: /research/dune/
---

<div class="d-flex justify-content-between align-items-center">
# DUNE
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/DUNE.png"  alt="DUNE experiment logo" class="img-fluid" style="height: 50px; float: right;">
</div>

Page under construction -- more detail coming soon.

<p>DUNE (Deep Underground Neutrino Experiment) is an international experiment that will send a neutrino beam from Fermilab 800 miles through the Earth to detectors installed nearly a mile underground at the Sanford Underground Research Facility in South Dakota. By comparing neutrino and antineutrino oscillations over that distance, DUNE aims to determine the neutrino mass ordering and search for CP violation in the lepton sector. Its large underground detectors will also be sensitive to neutrinos from a nearby supernova and to proton decay, should either occur during the experiment's run.</p>

{% assign target_experiment = "dune" %}
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

![]({{ site.url }}{{ site.baseurl }}/assets/images/respic/DUNE_overview.jpg){: style="width: 70%; float: center; margin: 0px"}


