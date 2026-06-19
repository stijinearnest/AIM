from django.urls import path
from .views import RankListView, ResultAddView

urlpatterns = [
    path("", RankListView.as_view(), name="rank-list"),
    path("update/", ResultAddView.as_view(), name="rank-update"),
    path("result/add/", ResultAddView.as_view(), name="result-add"),
]
