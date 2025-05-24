from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('home', views.home, name='home'),
    path('login', views.login_view, name='login'),
    path('signup', views.signup_view, name='signup'),
]