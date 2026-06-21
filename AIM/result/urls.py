from django.urls import path
from .views import resultListView, ResultAddView

urlpatterns = [
    path("", resultListView.as_view(), name="rank-list"),
    path("update/", ResultAddView.as_view(), name="rank-update"),
    path("result/add/", ResultAddView.as_view(), name="result-add"),
]
