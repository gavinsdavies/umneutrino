---
title: "UM Neutrino - Team"
layout: gridlay
excerpt: "UM Neutrino: Team members"
permalink: /team/
custom_title_enabled: true 
custom_title_value: UM Neutrino @ University of Mississippi
---

# Group Members

 **We are  looking for new PhD students, Postdocs, and Master students to join the team** [(see openings)]({{ site.url }}{{ site.baseurl }}/vacancies) **!**


Jump to [global reach](#global-reach), [principal investigator](#principal-investigator), [postdoctoral researchers](#postdoctoral-researchers), [graduate students](#graduate-students), [undergraduate researchers](#undergraduate-researchers), [alumni](#alumni), [high school visitors](#high-school-visitors).

{% include team-map.html %}

{%- assign um_pi = site.data.team_members | where: "role", "pi" | first %}

<a id="principal-investigator"></a>
## Principal Investigator

{% include team-pi-banner.html member=um_pi %}

<a id="postdoctoral-researchers"></a>
## Postdoctoral Researchers

{% include team-section.html members=site.data.team_members role="postdoc" %}

<a id="graduate-students"></a>
## Graduate Students

{% include team-section.html members=site.data.team_members role="grad" %}

<a id="undergraduate-researchers"></a>
## Undergraduate Researchers

{% include team-section.html members=site.data.team_members role="undergrad" %}

<a id="alumni"></a>
## Alumni - Ph.D.

{% include alumni-table.html members=site.data.alumni_members %}

## Alumni - M.Sc.

{% include alumni-table.html members=site.data.alumni_msc %}

## Alumni - B.Sc.

{% include alumni-table.html members=site.data.alumni_bsc %}

## High School Visitors

<ul>{% for member in site.data.alumni_visitors %}<li>{{ member.name }}</li>{% endfor %}</ul>
