import re

from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Result
from students.models import Department, Student, programme
from .serializers import RankListSerializer, RankUpdateSerializer


def parse_int_param(value, field_name):
    try:
        return int(value)
    except (TypeError, ValueError):
        raise ValueError({field_name: "Enter a valid number."})


def normalize_name(value):
    return re.sub(r"[^a-z0-9]", "", value.lower())


def find_programmes_by_name(name):
    programmes = programme.objects.filter(pgm_name__iexact=name)
    if programmes.exists():
        return programmes

    normalized_name = normalize_name(name)
    programme_ids = [
        item.pgm_id
        for item in programme.objects.all()
        if normalize_name(item.pgm_name) == normalized_name
    ]
    return programme.objects.filter(pgm_id__in=programme_ids)


def resolve_programme_ids(filters):
    programme_ids = None

    if filters.get("programme_id"):
        programme_ids = {filters["programme_id"]}

    if filters.get("programme"):
        programmes = find_programmes_by_name(filters["programme"])
        if not programmes.exists():
            return None, {"programme": "Programme does not exist."}
        matched_programme_ids = set(programmes.values_list("pgm_id", flat=True))
        programme_ids = (
            matched_programme_ids
            if programme_ids is None
            else programme_ids & matched_programme_ids
        )

    if filters.get("department_id"):
        department_ids = {filters["department_id"]}
    elif filters.get("department"):
        departments = Department.objects.filter(
            department__iexact=filters["department"]
        )
        if not departments.exists():
            return None, {"department": "Department does not exist."}
        department_ids = set(departments.values_list("dep_id", flat=True))
    else:
        department_ids = None

    if department_ids is not None:
        department_programme_ids = set(
            programme.objects.filter(department_id__in=department_ids).values_list(
                "pgm_id",
                flat=True,
            )
        )
        programme_ids = (
            department_programme_ids
            if programme_ids is None
            else programme_ids & department_programme_ids
        )

    if programme_ids is not None and not programme_ids:
        return None, {"programme": "No programme matches the provided filters."}

    return programme_ids, None


@method_decorator(never_cache, name="dispatch")
class ResultAddView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = RankUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        result_year = serializer.validated_data["result_year"]
        year_of_admn = serializer.validated_data["year_of_admn"]
        results = serializer.validated_data["results"]
        student_ids = [item["student_id"] for item in results]
        students = Student.objects.in_bulk(student_ids)
        missing_student_ids = [
            student_id for student_id in student_ids if student_id not in students
        ]

        if missing_student_ids:
            return Response(
                {"student_id": f"Invalid student id(s): {missing_student_ids}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        programme_ids, error = resolve_programme_ids(serializer.validated_data)
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        group_students = Student.objects.filter(year_of_admn=year_of_admn)
        if programme_ids is not None:
            group_students = group_students.filter(programme_id__in=programme_ids)

        group_student_ids = set(group_students.values_list("stud_id", flat=True))
        submitted_student_ids = set(student_ids)

        extra_student_ids = sorted(submitted_student_ids - group_student_ids)
        missing_group_student_ids = sorted(group_student_ids - submitted_student_ids)

        if extra_student_ids:
            return Response(
                {
                    "student_id": (
                        "Student id(s) not in the selected admission year/programme/"
                        f"department: {extra_student_ids}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if missing_group_student_ids:
            return Response(
                {
                    "student_id": (
                        "Result must be provided for every student in the selected "
                        f"batch/programme/department. Missing student id(s): "
                        f"{missing_group_student_ids}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        group_results = Result.objects.filter(student__year_of_admn=year_of_admn)
        if programme_ids is not None:
            group_results = group_results.filter(student__programme_id__in=programme_ids)

        with transaction.atomic():
            deleted_count, _ = group_results.exclude(student_id__in=student_ids).delete()

            for item in results:
                Result.objects.update_or_create(
                    student=students[item["student_id"]],
                    defaults={
                        "rank": item.get("rank"),
                        "status": item["status"],
                        "ogpa": item["ogpa"],
                        "marks": item.get("marks"),
                        "result_year": result_year,
                    },
                )

        return Response(
            {
                "message": "Results updated successfully",
                "removed_old_results": deleted_count,
            },
            status=status.HTTP_200_OK,
        )

    def put(self, request):
        return self.post(request)


RankUpdate = ResultAddView


@method_decorator(never_cache, name="dispatch")
class RankListView(APIView):
    # permission_classes = [IsAuthenticated]
    
    def get(self, request):
        result_year = request.query_params.get("result_year")
        year_of_admn = (    
            request.query_params.get("year_of_admn")
            or request.query_params.get("admission_year")
        )
        programme_filter = request.query_params.get("programme")
        programme_id = request.query_params.get("programme_id")
        department_filter = request.query_params.get("department")
        department_id = request.query_params.get("department_id")

        results = (
            Result.objects.select_related("student")
            .filter(rank__in=[1, 2, 3])
            .order_by("rank")
        )

        if result_year:
            try:
                result_year = parse_int_param(result_year, "result_year")
            except ValueError:
                return Response(
                    {"result_year": "Enter a valid year."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            results = results.filter(result_year=result_year)

        if year_of_admn:
            try:
                year_of_admn = parse_int_param(year_of_admn, "year_of_admn")
            except ValueError:
                return Response(
                    {"year_of_admn": "Enter a valid admission year."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            results = results.filter(student__year_of_admn=year_of_admn)

        programme_ids = None

        if programme_id:
            try:
                programme_ids = {parse_int_param(programme_id, "programme_id")}
            except ValueError:
                return Response(
                    {"programme_id": "Enter a valid programme id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if department_id:
            try:
                department_ids = {parse_int_param(department_id, "department_id")}
            except ValueError:
                return Response(
                    {"department_id": "Enter a valid department id."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        elif department_filter:
            departments = Department.objects.filter(
                department__iexact=department_filter
            )
            if not departments.exists():
                return Response(
                    {"department": "Department does not exist."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            department_ids = set(departments.values_list("dep_id", flat=True))
        else:
            department_ids = None

        resolved_programme_ids, error = resolve_programme_ids(
            {
                "programme_id": next(iter(programme_ids)) if programme_ids else None,
                "programme": programme_filter,
                "department_id": next(iter(department_ids)) if department_ids else None,
                "department": department_filter,
            }
        )
        if error:
            return Response(error, status=status.HTTP_400_BAD_REQUEST)

        programme_ids = resolved_programme_ids

        if programme_ids is not None:
            results = results.filter(student__programme_id__in=programme_ids)

        rank_programme_ids = (
            results.values_list("student__programme_id", flat=True).distinct()
        )
        programmes = {
            item.pgm_id: item
            for item in programme.objects.select_related("department").filter(
                pgm_id__in=rank_programme_ids
            )
        }

        serializer = RankListSerializer(
            results,
            many=True,
            context={"programmes": programmes},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)
