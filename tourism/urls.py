from django.conf import settings
from django.urls import include, path
from django.contrib import admin

from wagtail.admin import urls as wagtailadmin_urls
from wagtail import urls as wagtail_urls
from wagtail.documents import urls as wagtaildocs_urls

from search import views as search_views
from home import views as home_views

urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("admin/", include(wagtailadmin_urls)),
    path("documents/", include(wagtaildocs_urls)),
    path("search/", search_views.search, name="search"),
    
    # JSON API endpoints for AJAX navigation
    path("home/json/", home_views.home_json, name="home_json"),
    path("destinations/json/", home_views.destinations_json, name="destinations_json"),
    path("festivals/json/", home_views.festivals_json, name="festivals_json"),
    path("stay/json/", home_views.stay_json, name="stay_json"),
    path("cuisine/json/", home_views.cuisine_json, name="cuisine_json"),
    path("about/json/", home_views.about_json, name="about_json"),
    path("contact/json/", home_views.contact_json, name="contact_json"),
]


if settings.DEBUG:
    from django.conf.urls.static import static
    from django.contrib.staticfiles.urls import staticfiles_urlpatterns

    # Serve static and media files from development server
    urlpatterns += staticfiles_urlpatterns()
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns = urlpatterns + [
    # For anything not caught by a more specific rule above, hand over to
    # Wagtail's page serving mechanism. This should be the last pattern in
    # the list:
    path("", include(wagtail_urls)),
    # Alternatively, if you want Wagtail pages to be served from a subpath
    # of your site, rather than the site root:
    #    path("pages/", include(wagtail_urls)),
]