#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = "Feng Xia"
SITENAME = "My Stocks"
SITEURL = ""

PATH = "content"

IGNORE_FILES = [".#*"]

# These folders will be copied to `/output` without pelican modification
STATIC_PATHS = ["images", "downloads",
                "app", "data", "slides"]  # "extra/CNAME"
# EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'}, }

# must have this to copy `/slides` to output
# and skip processor complaining about formatting error
# in .html and .md in this folder
ARTICLE_EXCLUDES = ["slides", "downloads", "images", "data"]
TIMEZONE = "America/New_York"

DEFAULT_LANG = "en"

# Feed generation is usually not desired when developing
# FEED_ALL_ATOM = None
# CATEGORY_FEED_ATOM = None
# TRANSLATION_FEED_ATOM = None
# AUTHOR_FEED_ATOM = None
# AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (
    ("Pelican", "http://getpelican.com/"),
    ("Python.org", "http://python.org/"),
    ("Jinja2", "http://jinja.pocoo.org/"),
    ("You can modify those links in your config file", "#"),
)

# Social widget
SOCIAL = (
    ("You can add links in your config file", "#"),
    ("Another social link", "#"),
)

# pagination
DEFAULT_PAGINATION = 1


# Theme
THEME = "theme/feng"
EMAIL_ADDRESS = "feng_xia41103@hotmail.com"
GITHUB_ADDRESS = "http://github.com/fengxia41103"
LINKEDIN_ADDRESS = "https://www.linkedin.com/in/fengxia41103"

LOAD_CONTENT_CACHE = False  # for development use

SUMMARY_MAX_LENGTH = 175
IGNORE_FILES = ["README.*", "readme.*", "Readme.*"]

# plugins
PLUGIN_PATHS = ["plugins"]
PLUGINS = ["tipue_search"]

# make a flat structure
PAGE_URL = "{slug}.html"
PAGE_SAVE_AS = "{slug}.html"
AUTHOR_URL = "{slug}.html"
AUTHOR_SAVE_AS = "{slug}.html"
CATEGORY_URL = "{slug}.html"
CATEGORY_SAVE_AS = "{slug}.html"
TAG_URL = "tag-{slug}.html"
TAG_SAVE_AS = "tag-{slug}.html"


##############################
#
# Custom filters
#
##############################


def tags_contain(test_list, item):
    return item in [t.name for t in test_list]


JINJA_FILTERS = {"tags_contain": tags_contain}
