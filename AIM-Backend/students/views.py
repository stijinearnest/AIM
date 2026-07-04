from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Department
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Student, programme, Department


class GetProgramme(APIView):    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        programme_id = request.query_params.get("programme_id")

        if not programme_id:
            return Response(
                {"programme_id": "programme_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            programme_id = int(programme_id)
        except (TypeError, ValueError):
            return Response(
                {"programme_id": "Enter a valid programme id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            prog = programme.objects.get(pgm_id=programme_id)
        except programme.DoesNotExist:
            return Response(
                {"programme": "Programme does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "programme_id": prog.pgm_id,
                "programme_name": prog.pgm_name,
            },
            status=status.HTTP_200_OK,
        )


class GetDepartment(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        department_id = request.query_params.get("department_id")

        if not department_id:
            return Response(
                {"department_id": "department_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            department_id = int(department_id)
        except (TypeError, ValueError):
            return Response(
                {"department_id": "Enter a valid department id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            dept = Department.objects.get(dep_id=department_id)
        except Department.DoesNotExist:
            return Response(
                {"department": "Department does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "department_id": dept.dep_id,
                "department_name": dept.department,
            },
            status=status.HTTP_200_OK,
        )

class GetAllDepartments(APIView):

    def get(self, request):
        departments = Department.objects.all().order_by("department")

        return Response(
            {
                "departments": [
                    {
                        "dep_id": dept.dep_id,
                        "department_name": dept.department,
                    }
                    for dept in departments
                ]
            },
            status=status.HTTP_200_OK,
        )

class GetProgrammesByDepartment(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        department_id = request.query_params.get("department_id")

        if not department_id:
            return Response(
                {"department_id": "department_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            department_id = int(department_id)
        except (TypeError, ValueError):
            return Response(
                {"department_id": "Enter a valid department id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            dept = Department.objects.get(dep_id=department_id)
        except Department.DoesNotExist:
            return Response(
                {"department": "Department does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        programmes = programme.objects.filter(department_id=department_id).order_by(
            "pgm_name"
        )

        return Response(
            {
                "department_id": dept.dep_id,
                "department_name": dept.department,
                "programmes": [
                    {
                        "programme_id": prog.pgm_id,
                        "programme_name": prog.pgm_name,
                        "no_of_sems": prog.no_of_sems,
                        "grad_level": prog.grad_level,
                    }
                    for prog in programmes
                ],
            },
            status=status.HTTP_200_OK,
        )


class GetStudent(APIView):
  #  permission_classes = [IsAuthenticated]

    def get(self, request):
        stud_id = request.query_params.get("stud_id")

        if not stud_id:
            return Response(
                {"stud_id": "stud_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            stud_id = int(stud_id)
        except (TypeError, ValueError):
            return Response(
                {"stud_id": "Enter a valid student id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = (
                Student.objects.select_related(
                    "caste",
                    "religion",
                    "programme",
                    "quota",
                )
                .get(stud_id=stud_id)
            )
        except Student.DoesNotExist:
            return Response(
                {"student": "Student does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {
                "stud_id": student.stud_id,
                "admn_no": student.admn_no,
                "roll_no": student.roll_no,
                "uty_reg_no": student.uty_reg_no,
                "name": student.name,
                "year_of_admn": student.year_of_admn,
                "dob": student.dob,
                "sex": student.sex,
                "caste_id": student.caste_id,
                "caste": {
                    "caste_id": student.caste.caste_id,
                    "caste_name": student.caste.caste_name,
                    "religion_id": student.caste.religion_id,
                    "category_id": student.caste.category_id,
                }
                if student.caste
                else None,
                "religion_id": student.religion_id,
                "religion": {
                    "religion_id": student.religion.religion_id,
                    "religion_name": student.religion.religion_name,
                }
                if student.religion
                else None,
                "email": student.email,
                "contact_no": student.contact_no,
                "house_name": student.house_name,
                "street": student.street,
                "place": student.place,
                "dist": student.dist,
                "state": student.state,
                "pincode": student.pincode,
                "programme_id": student.programme_id,
                "programme": {
                    "programme_id": student.programme.pgm_id,
                    "programme_name": student.programme.pgm_name,
                    "department_id": student.programme.department_id,
                }
                if student.programme
                else None,
                "quota_id": student.quota_id,
                "quota": {
                    "quota_id": student.quota.quota_id,
                    "quota_name": student.quota.quota_name,
                }
                if student.quota
                else None,
                "marks_sslc": student.marks_sslc,
                "marks_twelth": student.marks_twelth,
                "board_twelth": student.board_twelth,
                "photo": student.photo,
                "is_studying":student.is_studying,
                "differently_abled": student.differently_abled,
                "date_of_admission": student.date_of_admission,
                "date_of_leaving": student.date_of_leaving,
                "year_of_leaving": student.year_of_leaving,
            },
            status=status.HTTP_200_OK,
        )

class UpdateStudentStatus(APIView):

    def post(self, request):
        return self._update_status(request)

    def put(self, request):
        return self._update_status(request)

    def _update_status(self, request):
        stud_id = request.data.get("stud_id")
        is_studying = request.data.get("is_studying")

        if stud_id is None:
            return Response(
                {"stud_id": "stud_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if is_studying is None:
            return Response(
                {"is_studying": "is_studying is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            student = Student.objects.get(stud_id=stud_id)
        except Student.DoesNotExist:
            return Response(
                {"student": "Student does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        student.is_studying = is_studying
        student.save()

        return Response(
            {
                "message": "Student status updated successfully.",
                "stud_id": student.stud_id,
                "is_studying": student.is_studying,
            }
        )

class GetStudentsByAdmissionYearAndProgramme(APIView):
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        year_of_admn = request.query_params.get("year_of_admn")
        programme_id = request.query_params.get("programme_id")

        if not year_of_admn:
            return Response(
                {"year_of_admn": "year_of_admn is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not programme_id:
            return Response(
                {"programme_id": "programme_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            year_of_admn = int(year_of_admn)
        except (TypeError, ValueError):
            return Response(
                {"year_of_admn": "Enter a valid admission year."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            programme_id = int(programme_id)
        except (TypeError, ValueError):
            return Response(
                {"programme_id": "Enter a valid programme id."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            prog = programme.objects.select_related("department").get(pgm_id=programme_id)
        except programme.DoesNotExist:
            return Response(
                {"programme": "Programme does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )

        students = (
            Student.objects.filter(
                year_of_admn=year_of_admn,
                programme_id=programme_id,
            )
            .select_related("programme")
            .order_by("roll_no", "name", "stud_id")
        )

        return Response(
            {
                "year_of_admn": year_of_admn,
                "programme": {
                    "programme_id": prog.pgm_id,
                    "programme_name": prog.pgm_name,
                    "department_id": prog.department_id,
                    "department_name": prog.department.department
                    if prog.department
                    else None,
                },
                "students": [
                    {
                        "stud_id": student.stud_id,
                        "admn_no": student.admn_no,
                        "roll_no": student.roll_no,
                        "uty_reg_no": student.uty_reg_no,
                        "name": student.name,
                        "year_of_admn": student.year_of_admn,
                        "programme_id": student.programme_id,
                        "photo": student.photo,
                        "is_studying":student.is_studying
                    }
                    for student in students
                ],
            },
            status=status.HTTP_200_OK,
        )
