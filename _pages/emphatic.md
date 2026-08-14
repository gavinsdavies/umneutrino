---
title: "UM Neutrino - EMPHATIC Research"
layout: experiment
excerpt: "UM Neutrino -- EMPHATIC Research"
permalink: /research/emphatic/
---

<div class="d-flex justify-content-between align-items-center">
# EMPHATIC
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/logopic/EMPHATIC.png"  alt="EMPHATIC experiment logo" class="img-fluid" style="height: 50px; float: right;">
</div>

Page under construction -- more detail coming soon.

EMPHATIC (Experiment to Measure the Production of Hadrons At a Testbeam In Chicagoland) is a fixed-target experiment at Fermilab. It measures how often, and with what energy and angle, hadrons come out when a proton beam hits a target -- data that neutrino experiments like DUNE and NOvA need to predict their beam composition accurately. Better hadron-production measurements mean smaller uncertainties on the predicted neutrino flux, which feeds directly into oscillation analyses.

{% assign target_experiment = "emphatic" %}
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
<!-- TODO(Gavin): add an EMPHATIC overview image (see dune.md's
     assets/images/respic/DUNE_overview.jpg for the convention) and restore
     an ![](...) tag pointing at assets/images/respic/<name>.jpg here. -->


