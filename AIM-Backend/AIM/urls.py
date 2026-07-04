"""
URL configuration for AIM project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path,include
from result.views import resultListView, ResultAddView

urlpatterns = [
    path('admin/', admin.site.urls),
    path("users/", include("users.urls")),
    path("result", resultListView.as_view(), name="result-list-no-slash"),
    path("result/", include("result.urls")),
    path("rank/", include("result.urls")),
    path("result/update", ResultAddView.as_view(), name="result-update-no-slash"),
    path("result/add", ResultAddView.as_view(), name="result-add-no-slash"),
    path("result/add/", ResultAddView.as_view(), name="result-add"),
    path("students/", include("students.urls")),
]
