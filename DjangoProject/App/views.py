from django.contrib import messages
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect
from django.http import HttpResponse

from App.forms import CustomUserCreationForm


# Create your views here.


def index(request):
    return render(request, 'App/index.html')

def home(request):
    return render(request, "App/Home.html")


def login_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(home)
        else:
            messages.error(request, "Invalid username or password")
    return render(request, "App/Login.html")

def signup_view(request):
    if request.method == "POST":
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect(home)
    else:
        form = CustomUserCreationForm()
    return render(request, "App/Sign_Up.html", {"form": form})