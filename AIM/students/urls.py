from django.urls import path
from .views import (
    GetProgramme,
    GetDepartment,
    GetProgrammesByDepartment,
    GetStudent,
    GetStudentsByAdmissionYearAndProgramme,
    GetAllDepartments,
)

urlpatterns = [
    path("programme/", GetProgramme.as_view(), name="get-programme"),
    path(
        "programmes/",
        GetProgrammesByDepartment.as_view(),
        name="get-programmes-by-department",
    ),
    path("department/", GetDepartment.as_view(), name="get-department"),
    path("departments/", GetAllDepartments.as_view()),
    path("student/", GetStudent.as_view(), name="get-student"),
    path(
        "by-programme/",
        GetStudentsByAdmissionYearAndProgramme.as_view(),
        name="get-students-by-admission-year-and-programme",
    ),
]
