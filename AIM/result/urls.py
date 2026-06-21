from django.urls import path
from .views import (
    resultListView,
    ResultAddView,
    StudentResultsView,
)

urlpatterns = [
    path("", resultListView.as_view()),
    path("update/", ResultAddView.as_view()),
    path("result/add/", ResultAddView.as_view()),
    path("student-results/", StudentResultsView.as_view()),
]