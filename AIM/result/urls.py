from django.urls import path
from .views import (
    resultListView,
    ResultAddView,
    StudentResultsView,
    ResultEditView,
)

urlpatterns = [
    path("", resultListView.as_view()),
    path("update/", ResultAddView.as_view()),
    path("result/add/", ResultAddView.as_view()),
    path("student-results/", StudentResultsView.as_view()),
    path(
        "result/<int:student_id>/",
        ResultEditView.as_view(),
        name="result-detail",
    ),
    path(
        "result/edit/<int:student_id>/",
        ResultEditView.as_view(),
        name="result-edit",
    ),
]
