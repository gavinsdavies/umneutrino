---
title: "UM Neutrino - Pictures"
layout: piclay
excerpt: "UM Neutrino -- Pictures"
permalink: /pictures/
---

# Pictures
Jump to: [Oxford](#oxford), [EPIC Summer School](#epic-summer-school), [Outreach](#outreach)


## Oxford

#### Work in progress

#### Gallery
(Right-click *'view image'* to see a larger image.)
{% assign number_printed = 0 %}
{% for pic in site.data.pictures_Leiden %}

{% assign even_odd = number_printed | modulo: 4 %}

{% if even_odd == 0 %}
<div class="row">
{% endif %}

<div class="col-sm-3 clearfix">
<img src="{{ site.url }}{{ site.baseurl }}/images/picpic/Gallery/{{ pic.image }}" class="img-fluid" width="95%" style="float: left" />
</div>

{% assign number_printed = number_printed | plus: 1 %}

{% if even_odd > 2 %}
</div>
{% endif %}


{% endfor %}

{% assign even_odd = number_printed | modulo: 4 %}
{% if even_odd == 1 %}
</div>
{% endif %}

{% if even_odd == 2 %}
</div>
{% endif %}

{% if even_odd == 3 %}
</div>
{% endif %}

<p> &nbsp; </p>

Our first group photo.
<figure>
<img src="{{ site.url }}{{ site.baseurl }}/images/picpic/.jpg" width="60%" >
</figure>


## EPIC Summer School

MESH-supported EPIC (Exploring particle Physics Integrated with Computing) Summer
School, July 13-17 2026. Photos to be added once available -- see the
[school website](https://olemiss-physics.github.io/epic-summer-2026/) and
[site repository](https://github.com/olemiss-physics/epic-summer-2026) in the meantime.

<!-- TODO(Gavin): drop event photos into assets/images/picpic/epic/ and swap this
     placeholder figure for a real gallery once available. -->
<figure>
<img src="{{ site.url }}{{ site.baseurl }}/assets/images/picpic/epic/.jpg" width="60%">
</figure>


## Outreach
Work in progress
<figure>
<img src="{{ site.url }}{{ site.baseurl }}/images/picpic/.jpg" width="60%">
</figure>
