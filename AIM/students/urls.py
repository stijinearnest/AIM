from django.urls import path
from .views import (
    GetProgramme,
    GetDepartment,
    GetProgrammesByDepartment,
    GetStudent,
    GetStudentsByAdmissionYearAndProgramme,
)

urlpatterns = [
    path("programme/", GetProgramme.as_view(), name="get-programme"),
    path(
        "programmes/",
        GetProgrammesByDepartment.as_view(),
        name="get-programmes-by-department",
    ),
    path("department/", GetDepartment.as_view(), name="get-department"),
    path("student/", GetStudent.as_view(), name="get-student"),
    path(
        "by-programme/",
        GetStudentsByAdmissionYearAndProgramme.as_view(),
        name="get-students-by-admission-year-and-programme",
    ),
]
