from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),  # Make sure this exists
    path('index', views.index, name='index'),  # You can keep this too
    path('home', views.home, name='home'),
    path('login', views.login_view, name='login'),
    path('signup', views.signup_view, name='signup'),
]