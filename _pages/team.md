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


Jump to [global reach](#global-reach), [staff](#staff), [master and bachelor students](#master-and-bachelor-students), [alumni](#alumni), [high school visitors](#high-school-visitors).

{% include team-map.html %}

## Staff

{% include team-section.html members=site.data.team_members %}

## Master and Bachelor Students

{% include team-section.html members=site.data.students %}

<a id="alumni"></a>
## Alumni - Ph.D.

{% include team-section.html members=site.data.alumni_members %}

## Alumni - M.Sc.

{% include team-section.html members=site.data.alumni_msc %}

## Alumni - B.Sc.

{% include team-section.html members=site.data.alumni_bsc %}

## High School Visitors

<ul>{% for member in site.data.alumni_visitors %}<li>{{ member.name }}</li>{% endfor %}</ul>
