from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField, RichTextField
from wagtail.admin.panels import FieldPanel
from . import blocks as site_blocks


# ------------------------------
# BASE PAGE MODEL
# ------------------------------
class TourismBasePage(Page):
    """
    A reusable base model for pages in the Misamis Occidental Tourism website.
    Includes an optional subtitle and rich introduction field.
    """
    subtitle = models.CharField(max_length=250, blank=True, help_text="Optional page subtitle")
    introduction = RichTextField(blank=True, help_text="Optional introduction text for the page")

    content_panels = Page.content_panels + [
        FieldPanel("subtitle"),
        FieldPanel("introduction"),
    ]

    class Meta:
        abstract = True


# ------------------------------
# HOME PAGE
# ------------------------------
class HomePage(TourismBasePage):
    template = "home/home_page.html"

    body = StreamField([
        ('hero_banner', site_blocks.HeroBannerBlock()),
        ('featured_destinations', site_blocks.FeaturedDestinationSectionBlock()),
        ('upcoming_events', site_blocks.UpcomingEventsBlock()),
        ('richtext_section', site_blocks.RichTextSection()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True, default=[])

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# DESTINATIONS PAGE
# ------------------------------
class DestinationsPage(TourismBasePage):
    template = "pages/destinations_page.html"

    body = StreamField([
        ('destination', site_blocks.DestinationBlock()),
        ('richtext_section', site_blocks.RichTextSection()),
        ('gallery', site_blocks.GalleryBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# EVENTS & FESTIVALS PAGE
# ------------------------------
class EventsPage(TourismBasePage):
    template = "pages/events_page.html"

    body = StreamField([
        ('event', site_blocks.UpcomingEventsBlock()),
        ('richtext_section', site_blocks.RichTextSection()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# CULTURE & HERITAGE PAGE
# ------------------------------
class CulturePage(TourismBasePage):
    template = "pages/culture_page.html"

    body = StreamField([
        ('culture', site_blocks.CultureBlock()),
        ('richtext_section', site_blocks.RichTextSection()),
        ('gallery', site_blocks.GalleryBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# NEWS & ANNOUNCEMENTS PAGE
# ------------------------------
class NewsPage(TourismBasePage):
    template = "pages/news_page.html"

    body = StreamField([
        ('news', site_blocks.NewsBlock()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# GALLERY PAGE
# ------------------------------
class GalleryPage(TourismBasePage):
    template = "pages/gallery_page.html"

    body = StreamField([
        ('gallery', site_blocks.GalleryBlock()),
        ('lightbox', site_blocks.LightboxBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# PLAN YOUR TRIP PAGE
# ------------------------------
class PlanYourTripPage(TourismBasePage):
    template = "pages/plan_your_trip_page.html"

    body = StreamField([
        ('trip_guide', site_blocks.TripGuideBlock()),
        ('richtext_section', site_blocks.RichTextSection()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# CONTACT PAGE
# ------------------------------
class ContactPage(TourismBasePage):
    template = "pages/contact_page.html"

    body = StreamField([
        ('contact_info', site_blocks.ContactBlock()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]


# ------------------------------
# ABOUT PAGE
# ------------------------------
class AboutPage(TourismBasePage):
    template = "pages/about_page.html"

    body = StreamField([
        ('richtext_section', site_blocks.RichTextSection()),
        ('gallery', site_blocks.GalleryBlock()),
        ('cta_button', site_blocks.CTAButtonBlock()),
    ], use_json_field=True)

    content_panels = TourismBasePage.content_panels + [
        FieldPanel('body'),
    ]
