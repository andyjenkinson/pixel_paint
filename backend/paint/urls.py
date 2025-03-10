
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("colour_pixel", views.colour_pixel, name = "colour_pixel"),
    path("state", views.get_state, name = "get_state"),
    path("save", views.save, name = "save"),
    path("text", views.text, name = "text"),
    path("clear", views.clear, name = "clear")
]
