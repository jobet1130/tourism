from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
import json

def home_json(request):
    """Return home page content as JSON"""
    # In a real implementation, you would render a template and return its content
    content = """
    <div class="container">
        <h1>Welcome to Misamis Occidental</h1>
        <p>Discover the beauty and culture of Misamis Occidental.</p>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <h3>Destinations</h3>
                    <p>Explore our beautiful beaches and mountains.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <h3>Festivals</h3>
                    <p>Experience our vibrant local festivals.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <h3>Cuisine</h3>
                    <p>Taste our delicious local dishes.</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Home - Misamis Occidental Tourism',
        'content': content
    })

def destinations_json(request):
    """Return destinations page content as JSON"""
    content = """
    <div class="container">
        <h1>Destinations</h1>
        <p>Explore the beautiful destinations in Misamis Occidental.</p>
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <h3>Dahilayan Adventure Park</h3>
                    <p>Zipline and adventure activities.</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <h3>Aliwagwag Falls</h3>
                    <p>Breathtaking waterfall experience.</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Destinations - Misamis Occidental Tourism',
        'content': content
    })

def festivals_json(request):
    """Return festivals page content as JSON"""
    content = """
    <div class="container">
        <h1>Festivals</h1>
        <p>Experience the vibrant festivals of Misamis Occidental.</p>
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <h3>Linabo Festival</h3>
                    <p>Celebrated in honor of the patron saint.</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <h3>Kahimunan Festival</h3>
                    <p>Thanksgiving festival for a bountiful harvest.</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Festivals - Misamis Occidental Tourism',
        'content': content
    })

def stay_json(request):
    """Return where to stay page content as JSON"""
    content = """
    <div class="container">
        <h1>Where to Stay</h1>
        <p>Find the perfect accommodation for your visit.</p>
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <h3>Hotels</h3>
                    <p>Comfortable hotels in key locations.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <h3>Resorts</h3>
                    <p>Luxury resorts with scenic views.</p>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <h3>Homestays</h3>
                    <p>Experience local hospitality.</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Where to Stay - Misamis Occidental Tourism',
        'content': content
    })

def cuisine_json(request):
    """Return cuisine page content as JSON"""
    content = """
    <div class="container">
        <h1>Local Cuisine</h1>
        <p>Discover the delicious flavors of Misamis Occidental.</p>
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <h3>Specialties</h3>
                    <p>Try our famous Linabo rice and other delicacies.</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <h3>Restaurants</h3>
                    <p>Find the best local restaurants.</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Cuisine - Misamis Occidental Tourism',
        'content': content
    })

def about_json(request):
    """Return about page content as JSON"""
    content = """
    <div class="container">
        <h1>About Us</h1>
        <p>Learn more about Misamis Occidental Tourism.</p>
        <div class="card">
            <h3>Our Mission</h3>
            <p>To promote and develop tourism in Misamis Occidental through sustainable and responsible practices.</p>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'About - Misamis Occidental Tourism',
        'content': content
    })

def contact_json(request):
    """Return contact page content as JSON"""
    content = """
    <div class="container">
        <h1>Contact Us</h1>
        <p>Get in touch with us for more information.</p>
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <h3>Office Address</h3>
                    <p>Provincial Capitol, Oroquieta City, Misamis Occidental</p>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <h3>Contact Numbers</h3>
                    <p>(063) 222-2222</p>
                </div>
            </div>
        </div>
    </div>
    """
    
    return JsonResponse({
        'status': 'success',
        'title': 'Contact - Misamis Occidental Tourism',
        'content': content
    })