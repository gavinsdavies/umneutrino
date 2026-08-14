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

The EMPHATIC (Experiment to Measure the Production of Hadrons At a Testbeam In Chicagoland) experiment is a cutting-edge research project focused on improving our understanding of hadron production, which is critical for various areas of particle physics, including neutrino experiments. Located at Fermilab, EMPHATIC aims to precisely measure the production rates and characteristics of hadrons—particles made of quarks, such as protons and neutrons—when protons collide with various target materials. These measurements are essential for refining the models used in neutrino experiments, where accurate predictions of particle interactions are crucial for interpreting the data. By providing high-precision data on hadron production, EMPHATIC contributes to reducing uncertainties in neutrino flux predictions and enhances the accuracy of experiments like DUNE and NOvA. This experiment plays a vital role in advancing our knowledge of particle interactions and improving the overall precision of particle physics research.

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


