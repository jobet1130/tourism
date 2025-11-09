from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock
from wagtail.documents.blocks import DocumentChooserBlock

class HeroBannerBlock(blocks.StructBlock):
    hero_title = blocks.CharBlock(required=True, max_length=100, help_text="Title for the hero banner")
    hero_subtitle = blocks.CharBlock(required=False, max_length=250, help_text="Subtitle for the hero banner")
    hero_image = ImageChooserBlock(required=True, help_text="Image for the hero banner")
    cta_text = blocks.CharBlock(required=False, max_length=50, help_text="Call to action text")
    cta_link = blocks.URLBlock(required=False, help_text="Call to action link")
    
    class Meta:
        icon = "image"
        label = "Hero Banner"
        template = "blocks/hero.html"
        
class CTAButtonBlock(blocks.StructBlock):
    button_text = blocks.CharBlock(required=True, max_length=255, help_text="Text for the button")
    button_link = blocks.URLBlock(required=True, help_text="URL for the button link")
    
    class Meta:
        icon = "link"
        label = "CTA Button"
        template = "blocks/cta_button.html"

class FeaturedDestinationSectionBlock(blocks.StructBlock):
    destinations = blocks.ListBlock(
        blocks.StructBlock([
            ('title', blocks.CharBlock()),
            ('description', blocks.TextBlock()),
            ('image', ImageChooserBlock()),
            ('link', blocks.PageChooserBlock(required=False))
        ])
    )
    
    class Meta:
        icon = "site"
        label = "Featured Destinations Section"
        template = "blocks/featured_destinations.html"
        
class UpcomingEventsBlock(blocks.StructBlock):
    events = blocks.ListBlock(
        blocks.StructBlock([
            ('title', blocks.CharBlock()),
            ('date', blocks.DateBlock()),
            ('image', ImageChooserBlock()),
            ('link', blocks.PageChooserBlock(required=False))
        ])
    )

    class Meta:
        icon = "date"
        label = "Upcoming Events"
        template = "blocks/upcoming_events.html"
        
class DestinationBlock(blocks.StructBlock):
    destination_name = blocks.CharBlock(required=True, max_length=100, help_text="Name of the destination")
    destination_description = blocks.TextBlock(required=True, help_text="Description of the destination")
    destination_image = ImageChooserBlock(required=True, help_text="Image of the destination")
    map_embed = blocks.TextBlock(required=False, help_text="Embed code for the map")
    
    class Meta:
        icon = "globe"
        label = "Destination"
        template = "blocks/destination.html"
        
class CultureBlock(blocks.StructBlock):
    culture_name = blocks.CharBlock(required=True, max_length=100, help_text="Name of the culture")
    culture_description = blocks.TextBlock(required=True, help_text="Description of the culture")
    culture_image = ImageChooserBlock(required=True, help_text="Image representing the culture")
    category = blocks.ChoiceBlock(choices=[
        ('music', 'Music'),
        ('art', 'Art'),
        ('food', 'Food'),
        ('traditions', 'Traditions'),
        ('festivals', 'Festivals')
    ], required=True, help_text="Category of the culture")
    
    class Meta:
        icon = "group"
        label = "Culture Highlight"
        template = "blocks/culture.html"
        
class NewsBlock(blocks.StructBlock):
    news_title = blocks.CharBlock(required=True, max_length=150, help_text="Title of the news article")
    news_summary = blocks.TextBlock(required=True, help_text="Summary of the news article")
    news_date = blocks.DateBlock(required=True, help_text="Publication date of the news article")
    news_image = ImageChooserBlock(required=False, help_text="Image for the news article")
    news_link = blocks.URLBlock(required=True, help_text="Link to the full news article")
    
    class Meta:
        icon = "doc-full"
        label = "News Article"
        template = "blocks/news.html"
        
class GalleryBlock(blocks.StructBlock):
    images = blocks.ListBlock(
        blocks.StructBlock([
            ('image', ImageChooserBlock()),
            ('caption', blocks.CharBlock(required=False))
        ])
    )

    class Meta:
        icon = "image"
        label = "Gallery"
        template = "blocks/gallery.html"
        
class LightboxBlock(blocks.StructBlock):
    gallery = blocks.ListBlock(
        blocks.StructBlock([
            ('image', ImageChooserBlock()),
            ('caption', blocks.CharBlock(required=False))
        ])
    )

    class Meta:
        icon = "media"
        label = "Lightbox Gallery"
        template = "blocks/lightbox.html"
        
class TripGuideBlock(blocks.StructBlock):
    itinerary_name = blocks.CharBlock()
    duration = blocks.CharBlock(required=False, help_text="e.g., 3-Day Trip")
    description = blocks.RichTextBlock()
    image = ImageChooserBlock()
    pdf_download = DocumentChooserBlock(required=False, help_text="Optional downloadable guide")

    class Meta:
        icon = "form"
        label = "Trip Guide"
        template = "blocks/trip_guide.html"
        
class ContactBlock(blocks.StructBlock):
    office_name = blocks.CharBlock()
    address = blocks.TextBlock()
    phone = blocks.CharBlock()
    email = blocks.EmailBlock()
    map_embed = blocks.TextBlock(required=False)

    class Meta:
        icon = "mail"
        label = "Contact Info"
        template = "blocks/contact.html"

class RichTextSection(blocks.StructBlock):
    heading = blocks.CharBlock(required=False)
    body = blocks.RichTextBlock()

    class Meta:
        icon = "edit"
        label = "Rich Text Section"
        template = "blocks/richtext_section.html"

